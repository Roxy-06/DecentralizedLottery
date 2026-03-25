import React from 'react';
import './LotteryStatus.css';

interface LotteryStatusProps {
  state: {
    isActive: boolean;
    ticketPrice: string;
    participants: number;
    prizePool: string;
    roundId: number;
    lastWinner: string | null;
  };
}

export default function LotteryStatus({ state }: LotteryStatusProps) {
  return (
    <div className="lottery-status">
      <h2>Lottery Status</h2>

      <div className="status-grid">
        <div className="status-card">
          <div className="status-label">Lottery Status</div>
          <div className={`status-value ${state.isActive ? 'active' : 'inactive'}`}>
            {state.isActive ? '🟢 Active' : '🔴 Inactive'}
          </div>
        </div>

        <div className="status-card">
          <div className="status-label">Round</div>
          <div className="status-value">#{state.roundId}</div>
        </div>

        <div className="status-card">
          <div className="status-label">Ticket Price</div>
          <div className="status-value">{state.ticketPrice} XLM</div>
        </div>

        <div className="status-card">
          <div className="status-label">Total Participants</div>
          <div className="status-value">{state.participants}</div>
        </div>

        <div className="status-card">
          <div className="status-label">Prize Pool</div>
          <div className="status-value">{state.prizePool} XLM</div>
        </div>

        <div className="status-card">
          <div className="status-label">Last Winner</div>
          <div className="status-value">
            {state.lastWinner
              ? `${state.lastWinner.slice(0, 10)}...`
              : 'No winner yet'}
          </div>
        </div>
      </div>

      {state.isActive && state.participants > 0 && (
        <div className="info-message">
          💡 Lottery is active! {state.participants} participant(s) have entered.
        </div>
      )}

      {!state.isActive && (
        <div className="info-message">
          ⏳ Lottery is currently inactive. Waiting for admin to start a new round.
        </div>
      )}
    </div>
  );
}
