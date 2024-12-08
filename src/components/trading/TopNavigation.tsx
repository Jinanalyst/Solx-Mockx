import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const TopNavigation: React.FC = () => {
  const timeframes = ['1s', '1m', '5m', '15m', '30m', '1h', '4h', '1d'];

  return (
    <div className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4">
      {/* Left Section - Trading Pair & Timeframes */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold text-white">BTC/USDT</span>
          <span className="text-green-500">$45,123.45</span>
          <span className="text-green-500 text-sm">+2.34%</span>
        </div>
        
        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              className="px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 rounded"
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Right Section - Navigation & Wallet */}
      <div className="flex items-center space-x-6">
        <nav className="flex space-x-6 text-gray-300">
          <button className="hover:text-white">Markets</button>
          <button className="hover:text-white">Tools</button>
          <button className="hover:text-white">Settings</button>
        </nav>
        <WalletMultiButton />
      </div>
    </div>
  );
};
