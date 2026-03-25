import React, { useState } from 'react';
import { LotteryService } from '../services/LotteryService';
import './BuyTicket.css';

interface BuyTicketProps {
  lotteryService: LotteryService;
  publicKey: string;
  isActive: boolean;
  ticketPrice: string;
  onSuccess: () => void;
}

export default function BuyTicket({
  lotteryService,
  publicKey,
  isActive,
  ticketPrice,
  onSuccess,
}: BuyTicketProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const handleBuyTicket = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Call the buy_ticket function on the contract
      const txHash = await lotteryService.buyTicket(
        publicKey,
        lotteryService.getContractId()
      );

      setSuccess(`✓ Ticket purchased successfully! ${txHash}`);
      setTimeout(() => {
        onSuccess();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error buying ticket:', err);
      setError('Failed to purchase ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) {
    return (
      <div className="buy-ticket">
        <div className="inactive-message">
          <p>⏳ Lottery is not active right now</p>
          <p>Please wait for the admin to start a new round.</p>
        </div>
      </div>
    );
  }

  const totalCost = (parseFloat(ticketPrice) * quantity).toFixed(7);

  return (
    <div className="buy-ticket">
      <h2>Buy Lottery Ticket</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="ticket-card">
        <div className="ticket-info">
          <div className="info-row">
            <span className="label">Price per Ticket:</span>
            <span className="value">{ticketPrice} XLM</span>
          </div>

          <div className="quantity-selector">
            <label htmlFor="quantity">Number of Tickets:</label>
            <div className="quantity-control">
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="qty-input"
              />
              <button
                className="qty-btn"
                onClick={() => setQuantity(Math.min(100, quantity + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="divider"></div>

          <div className="info-row total">
            <span className="label">Total Cost:</span>
            <span className="value">{totalCost} XLM</span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-block"
          onClick={handleBuyTicket}
          disabled={loading}
        >
          {loading ? '⏳ Processing...' : '🎟️ Buy Ticket(s)'}
        </button>

        <div className="ticket-notice">
          <p>
            💡 Tip: Buy multiple tickets to increase your chances of winning!
          </p>
        </div>
      </div>
    </div>
  );
}
