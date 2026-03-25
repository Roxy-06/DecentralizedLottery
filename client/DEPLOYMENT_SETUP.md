# Decentralized Lottery - Deployment Setup Guide

## ✅ Application Status: DEPLOYED

**Local URL:** `http://localhost:3000`  
**Network:** Stellar Testnet  
**Contract ID:** `CCA5F5GVMHIRZAWY3A7DKNQGTVSRWKYUA573PH6PKCXW7ADZRQG66J53`  
**Admin Wallet:** `GBXXGZVELSIJTATVN2M6JLT53G26PELAZ5B2SWH25U6Q3M4DNMUYIAIZ`

---

## 🔧 Prerequisites

### 1. Install Freighter Wallet
- Download from: https://www.freighter.app/
- Install the browser extension and create/import your wallet
- **IMPORTANT:** Set Freighter to **Stellar Testnet** mode

### 2. Verify Wallet Settings
1. Open Freighter extension
2. Click the settings icon (⚙️)
3. Make sure "Network" is set to "Testnet"
4. Verify you have testnet XLM available

### 3. Get Testnet XLM (if needed)
Visit the Stellar Testnet Friendbot: https://friendbot.stellar.org/

---

## 🚀 Running the Application

### Start the Development Server
```bash
cd D:\Stellar Bootcamp\DecentralizedLottery\client
npm start
```

The application will open automatically at `http://localhost:3000`

---

## 👤 Admin Dashboard (Your Wallet)

When you connect your wallet matching the admin address:
- **Admin Wallet:** `GBXXGZVELSIJTATVN2M6JLT53G26PELAZ5B2SWH25U6Q3M4DNMUYIAIZ`

You'll see the **Admin Panel** with:
- ▶️ **Start New Lottery Round** - Opens the lottery for players
- 🎰 **Draw Winner & Close Round** - Selects winner and distributes prizes
- 📊 **Round Statistics** - View current round data

### Admin Actions:
1. **Start Lottery Round**
   - Click "Start New Lottery Round"
   - Approve the transaction in Freighter
   - Round becomes active for players to buy tickets

2. **Draw Winner**
   - Wait for players to buy tickets (round must be active)
   - Click "Draw Winner & Close Round"
   - Approve the transaction in Freighter
   - Winner receives the prize pool (minus admin fee)

---

## 🎟️ Player Dashboard (Other Wallets)

When you connect a player wallet (any wallet except the admin wallet):
- You'll see the **Player Interface**
- Can view lottery status (active/inactive, prize pool, participants)
- Can purchase tickets when the lottery is active

### Player Actions:
1. **Check Lottery Status**
   - View if lottery is active
   - See current prize pool and ticket price
   - View number of participants

2. **Buy Tickets**
   - Click the "Buy Ticket(s)" card
   - Adjust quantity using +/- buttons
   - Click "Buy Ticket(s)" button
   - Approve transaction in Freighter
   - Your ticket is recorded on-chain

---

## 🔐 Wallet Connection

### Connecting Your Wallet:

1. **Click "Connect Freighter Wallet"**
   - Freighter will prompt for authorization
   - Make sure "Testnet" is selected
   - Approve the connection

2. **Automatic Admin Detection**
   - App automatically detects if your wallet is the admin
   - Shows "👑 ADMIN" badge if you're the admin
   - Shows player UI if you're a regular player

3. **Network Verification**
   - App confirms you're on Stellar Testnet
   - Contract is set to testnet only

---

## 📊 Contract Integration

### Contract Details:
- **Type:** Soroban Smart Contract
- **Language:** Rust + WebAssembly
- **Network:** Stellar Testnet
- **RPC:** https://soroban-testnet.stellar.org
- **Horizon:** https://horizon-testnet.stellar.org

### Contract Functions:
- `initialize()` - Sets up lottery (called once)
- `start_lottery()` - Opens a new round (admin only)
- `buy_ticket()` - Players enter the lottery
- `draw_winner()` - Selects winner & distributes prizes (admin only)
- `get_participants()` - Views all participants
- `get_ticket_price()` - Gets entry cost
- `is_active()` - Checks if lottery is running
- `get_last_winner()` - Gets previous round winner

---

## 🌐 Environment Variables

Located in `.env`:
```
REACT_APP_CONTRACT_ID=CCA5F5GVMHIRZAWY3A7DKNQGTVSRWKYUA573PH6PKCXW7ADZRQG66J53
REACT_APP_ADMIN_WALLET=GBXXGZVELSIJTATVN2M6JLT53G26PELAZ5B2SWH25U6Q3M4DNMUYIAIZ
REACT_APP_NETWORK=testnet
REACT_APP_HORIZON_URL=https://horizon-testnet.stellar.org
REACT_APP_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
REACT_APP_PORT=3000
```

---

## 📝 Transaction Flow

### Buying a Ticket (Player):
1. Player clicks "Buy Ticket(s)"
2. App prepares a transaction
3. Freighter prompts for signature
4. Player approves in Freighter
5. Transaction submitted to testnet
6. Player's entry recorded on-chain
7. Prize pool increases

### Starting Lottery (Admin):
1. Admin clicks "Start New Lottery Round"
2. App prepares transaction
3. Freighter prompts for signature
4. Admin approves in Freighter
5. Lottery status changes to ACTIVE
6. Players can now buy tickets

### Drawing Winner (Admin):
1. Admin clicks "Draw Winner & Close Round"
2. Contract selects random winner from participants
3. Freighter prompts for signature
4. Admin approves in Freighter
5. Prize distributed to winner
6. Admin fee taken
7. Round closes automatically
8. New round can be started

---

## 🐛 Troubleshooting

### ❌ "Freighter wallet not installed"
- Install Freighter extension: https://www.freighter.app/
- Refresh the page after installing

### ❌ "Connection failed"
- Make sure Freighter is set to **Stellar Testnet** (not MainNet)
- Check your Freighter is unlocked
- Try refreshing the page

### ❌ "Not admin" error
- Admin wallet is: `GBXXGZVELSIJTATVN2M6JLT53G26PELAZ5B2SWH25U6Q3M4DNMUYIAIZ`
- Only this wallet can start/draw lottery
- Use other wallets to test player functionality

### ❌ Transaction fails
- Make sure you have testnet XLM available
- Get testnet XLM from: https://friendbot.stellar.org/
- Check network status: https://status.stellar.org/

### ❌ App not loading
- Make sure `npm start` is running in the client folder
- Check that port 3000 is not in use
- Try: `npm start -- --port 3001` if port 3000 is occupied

---

## 📱 Testing Scenario

### Test as Admin:
1. Start the app
2. Connect your admin wallet (`GBXXGZVELSIJTATVN2M6JLT53G26PELAZ5B2SWH25U6Q3M4DNMUYIAIZ`)
3. Click "Start New Lottery Round"
4. Approve in Freighter
5. See lottery is now ACTIVE

### Test as Player:
1. Use a different wallet account
2. Connect that wallet to the app
3. See "Buy Tickets" option
4. Click to buy tickets
5. Approve in Freighter
6. See transaction confirmed

### Complete Round:
1. (As admin) Start lottery
2. (As players) Buy multiple tickets
3. (As admin) Draw winner
4. Winner receives prize pool
5. New round can be started

---

## 🔍 Monitoring Transactions

All transactions are visible on:
- **Stellar Expert:** https://stellar.expert/explorer/testnet/
- **Stellar Chain Viewer:** https://testnet.stellar.expert/

Search by:
- Contract ID: `CCA5F5GVMHIRZAWY3A7DKNQGTVSRWKYUA573PH6PKCXW7ADZRQG66J53`
- Admin wallet: `GBXXGZVELSIJTATVN2M6JLT53G26PELAZ5B2SWH25U6Q3M4DNMUYIAIZ`
- Your wallet address

---

## 📞 Support

For issues or questions:
1. Check that Freighter is on Testnet
2. Verify you have testnet XLM
3. Check Stellar status page
4. Review contract deployment on Stellar Expert

---

## ✨ Features Summary

✅ Fully decentralized lottery (on-chain)  
✅ Freighter wallet integration  
✅ Admin panel for lottery management  
✅ Player interface for ticket purchases  
✅ Real-time status updates  
✅ Transparent winner selection  
✅ Automatic prize distribution  
✅ Transaction history tracking  
✅ Responsive UI design  
✅ Production-ready on Stellar Testnet
