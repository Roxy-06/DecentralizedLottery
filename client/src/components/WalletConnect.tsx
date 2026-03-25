import React, { useState } from 'react';
import './WalletConnect.css';

interface WalletConnectProps {
  onConnected: (publicKey: string, isAdmin: boolean) => void;
}

// Admin wallet address
const ADMIN_WALLET = 'GBXXGZVELSIJTATVN2M6JLT53G26PELAZ5B2SWH25U6Q3M4DNMUYIAIZ';

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualKey, setManualKey] = useState('');

  const connectFreighter = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Freighter is installed
      if (typeof (window as any).freighter === 'undefined') {
        setError('Freighter wallet not installed. Please install the Freighter extension.');
        return;
      }

      // Request connection
      const result = await (window as any).freighter.requestAccess();
      if (!result.error) {
        const publicKey = result.publicKey;
        const isAdmin = publicKey === ADMIN_WALLET;
        console.log(`Connected wallet: ${publicKey}, Is Admin: ${isAdmin}`);
        onConnected(publicKey, isAdmin);
      } else {
        setError(result.error?.message || 'Failed to connect wallet');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet. Make sure Freighter is installed and enabled for testnet.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualConnect = () => {
    try {
      if (!manualKey.trim()) {
        setError('Please enter a valid public key');
        return;
      }

      // Validate public key format (Stellar keys start with 'G')
      if (!manualKey.startsWith('G') || manualKey.length !== 56) {
        setError('Invalid public key format. Stellar keys start with G and are 56 characters long.');
        return;
      }

      const isAdmin = false; // For demo purposes
      onConnected(manualKey, isAdmin);
      setShowManualInput(false);
    } catch (err) {
      setError('Invalid public key');
    }
  };

  return (
    <div className="wallet-connect-container">
      {error && <div className="error-message">{error}</div>}

      {!showManualInput ? (
        <div className="wallet-options">
          <button 
            className="btn btn-primary btn-large"
            onClick={connectFreighter}
            disabled={loading}
          >
            {loading ? 'Connecting...' : '🔐 Connect Freighter Wallet'}
          </button>

          <div className="divider">or</div>

          <button
            className="btn btn-secondary"
            onClick={() => setShowManualInput(true)}
          >
            Manual Key Entry (Testnet Demo)
          </button>
        </div>
      ) : (
        <div className="manual-input">
          <label htmlFor="publicKey">Enter Your Stellar Public Key:</label>
          <input
            id="publicKey"
            type="text"
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={manualKey}
            onChange={(e) => setManualKey(e.target.value)}
            className="input-field"
          />
          <div className="button-group">
            <button
              className="btn btn-primary"
              onClick={handleManualConnect}
              disabled={!manualKey.trim()}
            >
              Connect
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowManualInput(false);
                setManualKey('');
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="info-box">
        <h3>About this dApp</h3>
        <ul>
          <li>Buy lottery tickets with Stellar assets</li>
          <li>Fully decentralized - all logic on-chain</li>
          <li>Transparent randomized winner selection</li>
          <li>Instant prize distribution via smart contract</li>
        </ul>
      </div>
    </div>
  );
}
