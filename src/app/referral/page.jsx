// pages/referral.js
"use client"
import { useState } from 'react';
import ReferralPanel from "../../components/home/ReferralPanel" //  '../components/home/ReferralPanel';

export default function ReferralPage() {
  const [referralBalance, setReferralBalance] = useState(0.5); // Example balance in BNB
  const [referralCode] = useState('ABC123'); // Example referral code

  const handleWithdraw = async () => {
    try {
      // Implement withdrawal logic here (e.g., calling your API or blockchain function)
      alert('Withdrawal initiated!');
      // Optionally, update balance after withdrawal
      setReferralBalance((prev) => prev - 0.5); // Example deduction
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  return (
    <div>
      <h1>Your Referral Program</h1>
      <ReferralPanel
        referralBalance={referralBalance}
        referralCode={referralCode}
        onWithdraw={handleWithdraw}
      />
    </div>
  );
}
