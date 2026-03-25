import React, { useState } from 'react';
import { LotteryService } from '../services/LotteryService';
import './AdminPanel.css';

interface AdminPanelProps {
  lotteryService: LotteryService;
  publicKey: string;
  lotteryState: {
    isActive: boolean;
    ticketPrice: string;
    participants: number;
    prizePool: string;
    roundId: number;
    lastWinner: string | null;
  };
  onAdminAction: () => void;
}

export default function AdminPanel({
  lotteryService,
  publicKey,
  lotteryState,
  onAdminAction,
}: AdminPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStartLottery = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await lotteryService.startLottery(publicKey);
      setSuccess('✓ Lottery started successfully!');
      setTimeout(() => {
        onAdminAction();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error starting lottery:', err);
      setError('Failed to start lottery. Make sure you are the admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrawWinner = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (lotteryState.participants === 0) {
        setError('Cannot draw winner - no participants in this round.');
        setLoading(false);
        return;
      }

      await lotteryService.drawWinner(publicKey);
      setSuccess(
        `✓ Winner drawn successfully! Prize pool: ${lotteryState.prizePool} XLM`
      );
      setTimeout(() => {
        onAdminAction();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error drawing winner:', err);
      setError('Failed to draw winner. Make sure you are the admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <h2>🔐 Admin Panel</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-actions">
        <div className="action-card">
          <h3>Lottery Control</h3>

          <div className="action-status">
            <p>Current Status:</p>
            <span className={lotteryState.isActive ? 'status-active' : 'status-inactive'}>
              {lotteryState.isActive ? '🟢 Active' : '🔴 Inactive'}
            </span>
          </div>

          {!lotteryState.isActive ? (
            <button
              className="btn btn-success btn-block"
              onClick={handleStartLottery}
              disabled={loading}
            >
              {loading ? '⏳ Starting...' : '▶️  Start New Lottery Round'}
            </button>
          ) : (
            <div className="active-info">
              <p>✓ Lottery is active</p>
              <p>Participants: {lotteryState.participants}</p>
              <p>Prize Pool: {lotteryState.prizePool} XLM</p>
            </div>
          )}
        </div>

        <div className="action-card">
          <h3>Draw Winner</h3>

          {lotteryState.isActive ? (
            <>
              {lotteryState.participants > 0 ? (
                <>
                  <div className="action-status">
                    <p>Current Participants: {lotteryState.participants}</p>
                  </div>
                  <button
                    className="btn btn-warning btn-block"
                    onClick={handleDrawWinner}
                    disabled={loading}
                  >
                    {loading ? '⏳ Drawing...' : '🎰 Draw Winner & Close Round'}
                  </button>
                </>
              ) : (
                <div className="warning-info">
                  <p>⚠️ No participants yet</p>
                  <p>Wait for players to buy tickets before drawing a winner.</p>
                </div>
              )}
            </>
          ) : (
            <div className="info-message">
              <p>💡 Start the lottery first to accept ticket purchases</p>
            </div>
          )}
        </div>

        <div className="action-card stats">
          <h3>Round Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Round ID:</span>
              <span className="stat-value">#{lotteryState.roundId}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Participants:</span>
              <span className="stat-value">{lotteryState.participants}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Prize Pool:</span>
              <span className="stat-value">{lotteryState.prizePool} XLM</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ticket Price:</span>
              <span className="stat-value">{lotteryState.ticketPrice} XLM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-notice">
        <h4>Admin Guidelines</h4>
        <ul>
          <li>Start a lottery round before players can buy tickets</li>
          <li>Any player can buy tickets when lottery is active</li>
          <li>Use Draw Winner to select a winner and distribute the prize</li>
          <li>After drawing, the round closes and a new one can be started</li>
          <li>All transactions are recorded on-chain and verifiable</li>
        </ul>
      </div>
    </div>
  );
}
