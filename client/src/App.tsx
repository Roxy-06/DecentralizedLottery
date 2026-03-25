import React, { useState, useEffect } from 'react';
import { LotteryService } from './services/LotteryService';
import WalletConnect from './components/WalletConnect';
import LotteryStatus from './components/LotteryStatus';
import BuyTicket from './components/BuyTicket';
import AdminPanel from './components/AdminPanel';
import './App.css';

interface LotteryState {
  isActive: boolean;
  ticketPrice: string;
  participants: number;
  prizePool: string;
  roundId: number;
  lastWinner: string | null;
}

const CONTRACT_ID = process.env.REACT_APP_CONTRACT_ID || 'CCA5F5GVMHIRZAWY3A7DKNQGTVSRWKYUA573PH6PKCXW7ADZRQG66J53';
const ADMIN_WALLET = process.env.REACT_APP_ADMIN_WALLET || 'GBXXGZVELSIJTATVN2M6JLT53G26PELAZ5B2SWH25U6Q3M4DNMUYIAIZ';

function App() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lotteryState, setLotteryState] = useState<LotteryState>({
    isActive: false,
    ticketPrice: '0',
    participants: 0,
    prizePool: '0',
    roundId: 0,
    lastWinner: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lotteryService = new LotteryService(CONTRACT_ID, ADMIN_WALLET);

  useEffect(() => {
    const loadData = async () => {
      await loadLotteryState();
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLotteryState = async () => {
    try {
      setLoading(true);
      setError(null);
      const state = await lotteryService.getLotteryState();
      setLotteryState(state);
    } catch (err) {
      console.error('Error loading lottery state:', err);
      setError('Failed to load lottery state. Make sure the contract is deployed.');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnected = (pubKey: string, isAdminUser: boolean) => {
    setConnected(true);
    setPublicKey(pubKey);
    setIsAdmin(isAdminUser);
    if (isAdminUser) {
      console.log('✅ Admin wallet connected');
    } else {
      console.log('✅ Player wallet connected');
    }
  };

  const handleWalletDisconnected = () => {
    setConnected(false);
    setPublicKey(null);
    setIsAdmin(false);
    setError(null);
  };

  const handleTicketPurchased = () => {
    loadLotteryState();
  };

  const handleAdminAction = () => {
    loadLotteryState();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🎰 Decentralized Lottery</h1>
        <p>On Stellar Network (Testnet)</p>
        <p className="contract-info">
          Contract: {CONTRACT_ID.slice(0, 20)}...
        </p>
      </header>

      <main className="app-main">
        {!connected ? (
          <div className="welcome-section">
            <div className="welcome-card">
              <h2>Welcome to Decentralized Lottery</h2>
              <p>
                Win amazing prizes by participating in our fully decentralized lottery on the Stellar Testnet.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#999', marginBottom: '1.5rem' }}>
                Admin wallet: {ADMIN_WALLET.slice(0, 20)}...
              </p>
              <WalletConnect onConnected={handleWalletConnected} />
            </div>
          </div>
        ) : (
          <div className="dashboard">
            <div className="dashboard-header">
              <div className="user-info">
                <span className="connected-badge">✓ Connected to Testnet</span>
                <span className="public-key">{publicKey?.slice(0, 20)}...</span>
                {isAdmin && <span className="admin-badge">👑 ADMIN</span>}
              </div>
              <button 
                className="btn btn-secondary"
                onClick={handleWalletDisconnected}
              >
                Disconnect
              </button>
            </div>

            {error && (
              <div className="error-section">
                <p>{error}</p>
              </div>
            )}

            {loading ? (
              <div className="loading">Loading lottery data...</div>
            ) : (
              <>
                <LotteryStatus state={lotteryState} />

                {!isAdmin && (
                  <BuyTicket 
                    lotteryService={lotteryService}
                    publicKey={publicKey!}
                    isActive={lotteryState.isActive}
                    ticketPrice={lotteryState.ticketPrice}
                    onSuccess={handleTicketPurchased}
                  />
                )}

                {isAdmin && (
                  <AdminPanel
                    lotteryService={lotteryService}
                    publicKey={publicKey!}
                    lotteryState={lotteryState}
                    onAdminAction={handleAdminAction}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Decentralized Lottery © 2026 | Built on Stellar Testnet</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Make sure Freighter is installed and set to Stellar Testnet
        </p>
      </footer>
    </div>
  );
}

export default App;
