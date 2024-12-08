import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export const WalletBalance: React.FC = () => {
  const { connected } = useWallet();

  // Dummy balances for demonstration
  const balances = {
    BTC: 0.1234,
    USDT: 5000.00,
  };

  if (!connected) {
    return (
      <div className="p-4 border-b border-gray-800">
        <div className="text-center text-gray-400">
          Connect wallet to view balance
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-800">
      <h3 className="text-sm text-gray-400 mb-3">Available Balance</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-white">BTC</span>
          <span className="text-white">{balances.BTC.toFixed(8)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white">USDT</span>
          <span className="text-white">${balances.USDT.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
