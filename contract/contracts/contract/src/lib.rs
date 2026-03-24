#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, Vec, token, log,
};

// ─── Storage Keys ────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TicketPrice,
    Participants,
    LotteryActive,
    RoundId,
    LastWinner,
    TokenAddress,
    FeePercent,
}

// ─── Errors ───────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum LotteryError {
    NotAdmin           = 1,
    LotteryNotActive   = 2,
    LotteryAlreadyActive = 3,
    NoParticipants     = 4,
    InvalidTicketPrice = 5,
    InvalidFeePercent  = 6,
    AlreadyInitialized = 7,
}

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct LotteryContract;

#[contractimpl]
impl LotteryContract {

    // ── Initialize ─────────────────────────────────────────────────────────

    /// Deploy & configure the lottery once.
    /// - `token`       : Stellar asset contract address used for tickets & prizes
    /// - `ticket_price`: Cost in stroops (base units) to enter
    /// - `fee_percent` : Admin fee taken from the prize pool (0–30)
    pub fn initialize(
        env: Env,
        admin: Address,
        token: Address,
        ticket_price: i128,
        fee_percent: u32,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        if ticket_price <= 0 {
            panic!("ticket price must be > 0");
        }
        if fee_percent > 30 {
            panic!("fee_percent must be <= 30");
        }

        env.storage().instance().set(&DataKey::Admin,        &admin);
        env.storage().instance().set(&DataKey::TokenAddress, &token);
        env.storage().instance().set(&DataKey::TicketPrice,  &ticket_price);
        env.storage().instance().set(&DataKey::FeePercent,   &fee_percent);
        env.storage().instance().set(&DataKey::LotteryActive, &false);
        env.storage().instance().set(&DataKey::RoundId,      &0u64);
        env.storage().persistent().set(&DataKey::Participants, &Vec::<Address>::new(&env));

        log!(&env, "Lottery initialized by {}", admin);
    }

    // ── Admin: start / draw ────────────────────────────────────────────────

    /// Admin opens a new lottery round.
    pub fn start_lottery(env: Env, admin: Address) {
        admin.require_auth();
        Self::require_admin(&env, &admin);

        let active: bool = env.storage().instance().get(&DataKey::LotteryActive).unwrap_or(false);
        if active {
            panic!("lottery already active");
        }

        // Clear any leftover participants from a previous round.
        env.storage().persistent().set(&DataKey::Participants, &Vec::<Address>::new(&env));
        env.storage().instance().set(&DataKey::LotteryActive, &true);

        let round: u64 = env.storage().instance().get(&DataKey::RoundId).unwrap_or(0);
        log!(&env, "Lottery round {} started", round + 1);
    }

    /// Admin draws a winner, distributes the prize, and closes the round.
    pub fn draw_winner(env: Env, admin: Address) -> Address {
        admin.require_auth();
        Self::require_admin(&env, &admin);

        let active: bool = env.storage().instance().get(&DataKey::LotteryActive).unwrap_or(false);
        if !active {
            panic!("lottery not active");
        }

        let participants: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Participants)
            .unwrap_or(Vec::new(&env));

        if participants.is_empty() {
            panic!("no participants");
        }

        // ── Pseudo-random winner selection ──────────────────────────────────
        // Uses the ledger timestamp + sequence as entropy.
        // For production consider Stellar's VRF or an oracle.
        let seed = env.ledger().timestamp() ^ (env.ledger().sequence() as u64);
        let idx  = (seed % participants.len() as u64) as u32;
        let winner = participants.get(idx).unwrap();

        // ── Prize distribution ──────────────────────────────────────────────
        let ticket_price: i128 = env.storage().instance().get(&DataKey::TicketPrice).unwrap();
        let fee_percent:  u32  = env.storage().instance().get(&DataKey::FeePercent).unwrap();
        let total_pool: i128   = ticket_price * participants.len() as i128;
        let fee_amount: i128   = total_pool * fee_percent as i128 / 100;
        let prize: i128        = total_pool - fee_amount;

        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();
        let token_client = token::Client::new(&env, &token_address);

        // Transfer prize to winner.
        token_client.transfer(&env.current_contract_address(), &winner, &prize);

        // Transfer admin fee.
        if fee_amount > 0 {
            token_client.transfer(&env.current_contract_address(), &admin, &fee_amount);
        }

        // ── Bookkeeping ─────────────────────────────────────────────────────
        let round: u64 = env.storage().instance().get(&DataKey::RoundId).unwrap_or(0);
        env.storage().instance().set(&DataKey::RoundId,       &(round + 1));
        env.storage().instance().set(&DataKey::LotteryActive, &false);
        env.storage().instance().set(&DataKey::LastWinner,    &winner);
        env.storage().persistent().set(&DataKey::Participants, &Vec::<Address>::new(&env));

        log!(&env, "Round {} winner: {} | prize: {} | fee: {}", round + 1, winner, prize, fee_amount);

        winner
    }

    // ── Public: buy ticket ─────────────────────────────────────────────────

    /// Any account can call this to enter the current lottery round.
    pub fn buy_ticket(env: Env, participant: Address) {
        participant.require_auth();

        let active: bool = env.storage().instance().get(&DataKey::LotteryActive).unwrap_or(false);
        if !active {
            panic!("lottery not active");
        }

        let ticket_price: i128 = env.storage().instance().get(&DataKey::TicketPrice).unwrap();
        let token_address: Address = env.storage().instance().get(&DataKey::TokenAddress).unwrap();

        // Charge the participant.
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&participant, &env.current_contract_address(), &ticket_price);

        // Record entry.
        let mut participants: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Participants)
            .unwrap_or(Vec::new(&env));
        participants.push_back(participant.clone());
        env.storage().persistent().set(&DataKey::Participants, &participants);

        log!(&env, "{} bought a ticket. Total entries: {}", participant, participants.len());
    }

    // ── View functions ─────────────────────────────────────────────────────

    pub fn get_participants(env: Env) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::Participants)
            .unwrap_or(Vec::new(&env))
    }

    pub fn get_ticket_price(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TicketPrice).unwrap_or(0)
    }

    pub fn is_active(env: Env) -> bool {
        env.storage().instance().get(&DataKey::LotteryActive).unwrap_or(false)
    }

    pub fn get_prize_pool(env: Env) -> i128 {
        let ticket_price: i128 = env.storage().instance().get(&DataKey::TicketPrice).unwrap_or(0);
        let participants: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Participants)
            .unwrap_or(Vec::new(&env));
        ticket_price * participants.len() as i128
    }

    pub fn get_last_winner(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::LastWinner)
    }

    pub fn get_round_id(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::RoundId).unwrap_or(0)
    }

    // ── Admin helpers ──────────────────────────────────────────────────────

    /// Update ticket price between rounds.
    pub fn set_ticket_price(env: Env, admin: Address, new_price: i128) {
        admin.require_auth();
        Self::require_admin(&env, &admin);
        if new_price <= 0 {
            panic!("ticket price must be > 0");
        }
        let active: bool = env.storage().instance().get(&DataKey::LotteryActive).unwrap_or(false);
        if active {
            panic!("cannot change price while lottery is active");
        }
        env.storage().instance().set(&DataKey::TicketPrice, &new_price);
    }

    /// Transfer admin role.
    pub fn transfer_admin(env: Env, current_admin: Address, new_admin: Address) {
        current_admin.require_auth();
        Self::require_admin(&env, &current_admin);
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        log!(&env, "Admin transferred from {} to {}", current_admin, new_admin);
    }

    // ── Internal ───────────────────────────────────────────────────────────

    fn require_admin(env: &Env, caller: &Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if *caller != admin {
            panic!("caller is not admin");
        }
    }
}