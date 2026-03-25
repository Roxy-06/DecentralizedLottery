import * as StellarSDK from 'stellar-sdk';

interface LotteryState {
  isActive: boolean;
  ticketPrice: string;
  participants: number;
  prizePool: string;
  roundId: number;
  lastWinner: string | null;
}

export class LotteryService {
  private contractId: string;
  private server: any;
  private networkPassphrase: string;
  private adminWallet: string;

  constructor(contractId: string, adminWallet?: string) {
    this.contractId = contractId;
    this.adminWallet = adminWallet || process.env.REACT_APP_ADMIN_WALLET || '';
    // Use the Horizon server from StellarSDK
    const Horizon = (StellarSDK as any).Horizon;
    this.server = new Horizon.Server('https://horizon-testnet.stellar.org');
    this.networkPassphrase = 'Test SDF Network ; September 2015';
  }

  async getLotteryState(): Promise<LotteryState> {
    try {
      // For now, return placeholder data
      // In a real scenario, you'd query the contract state from ledger entries using Soroban RPC
      // This requires parsing the contract's stored data

      return {
        isActive: false,
        ticketPrice: '10',
        participants: 0,
        prizePool: '0',
        roundId: 0,
        lastWinner: null,
      };
    } catch (error) {
      console.error('Error fetching lottery state:', error);
      throw error;
    }
  }

  async buyTicket(
    playerPublicKey: string,
    contractId: string
  ): Promise<string> {
    try {
      // Get the player's account
      const account = await this.server.loadAccount(playerPublicKey);

      // Build contract invocation for buy_ticket
      // This builds a Soroban contract invocation transaction
      const builder = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      });

      // Add operation to invoke the buy_ticket contract function
      // Note: Actual Soroban invocation requires proper XDR building
      builder.addOperation(
        StellarSDK.Operation.payment({
          destination: contractId,
          asset: StellarSDK.Asset.native(),
          amount: '10',
        })
      );

      const transaction = builder.setTimeout(30).build();

      // Return transaction - will be signed by Freighter wallet
      return `Transaction prepared for ${playerPublicKey}`;
    } catch (error) {
      console.error('Error preparing ticket transaction:', error);
      throw error;
    }
  }

  async startLottery(adminPublicKey: string): Promise<string> {
    try {
      if (adminPublicKey !== this.adminWallet) {
        throw new Error('Only the admin can start the lottery');
      }

      // Get admin account
      const account = await this.server.loadAccount(adminPublicKey);

      // Build transaction for start_lottery contract call
      const builder = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      });

      // Add placeholder operation - real implementation would invoke contract
      builder.addOperation(
        StellarSDK.Operation.payment({
          destination: adminPublicKey,
          asset: StellarSDK.Asset.native(),
          amount: '0.0000001',
        })
      );

      const transaction = builder.setTimeout(30).build();

      console.log('Lottery start transaction prepared');
      return 'Lottery start transaction prepared - awaiting signature from Freighter';
    } catch (error) {
      console.error('Error starting lottery:', error);
      throw error;
    }
  }

  async drawWinner(adminPublicKey: string): Promise<string> {
    try {
      if (adminPublicKey !== this.adminWallet) {
        throw new Error('Only the admin can draw the winner');
      }

      // Get admin account
      const account = await this.server.loadAccount(adminPublicKey);

      // Build transaction for draw_winner contract call
      const builder = new StellarSDK.TransactionBuilder(account, {
        fee: StellarSDK.BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      });

      // Add placeholder operation - real implementation would invoke contract
      builder.addOperation(
        StellarSDK.Operation.payment({
          destination: adminPublicKey,
          asset: StellarSDK.Asset.native(),
          amount: '0.0000001',
        })
      );

      const transaction = builder.setTimeout(30).build();

      console.log('Winner draw transaction prepared');
      return 'Winner draw transaction prepared - awaiting signature from Freighter';
    } catch (error) {
      console.error('Error drawing winner:', error);
      throw error;
    }
  }

  getContractId(): string {
    return this.contractId;
  }

  getNetworkInfo() {
    return {
      contractId: this.contractId,
      network: 'testnet',
      horizon: 'https://horizon-testnet.stellar.org',
    };
  }
}
