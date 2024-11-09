// components/ReferralPanel.tsx

import React, { useState } from 'react';

interface ReferralPanelProps {
  referralBalance: string;
  referralCode: string;
  onWithdraw: () => void;
}

const ReferralPanel: React.FC<ReferralPanelProps> = ({ referralBalance, referralCode, onWithdraw }) => {
  const [isCopied, setIsCopied] = useState(false);

  // Function to copy referral code to clipboard
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div style={styles.panel}>
      <h2>Referral Program</h2>

      <div style={styles.section}>
        <label>Referral Balance:</label>
        <p>{referralBalance} BNB</p>
      </div>

      <div style={styles.section}>
        <button onClick={onWithdraw} style={styles.withdrawButton}>Withdraw BNB</button>
      </div>

      <div style={styles.section}>
        <label>Your Referral Code:</label>
        <div style={styles.referralCodeContainer}>
          <span>{referralCode}</span>
          <button onClick={copyReferralCode} style={styles.copyButton}>
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Styling object (used for inline styles)
const styles = {
  panel: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '800px',
    margin: 'auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  section: {
    margin: '10px 0',
  },
  withdrawButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  referralCodeContainer: {
    display: 'flex',
    flexDirection: 'column', // Arrange children in a column
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
    textAlign: 'center', // Optional: Center text within each child if needed
    height: '100%', //
  },
  copyButton: {
    marginLeft: '10px',
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
} as const;

export default ReferralPanel;
