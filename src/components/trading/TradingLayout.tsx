import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TradingViewWidget } from './TradingViewWidget';
import { OrderBook } from './OrderBook';
import { TradePanel } from './TradePanel';
import { TopNavigation } from './TopNavigation';
import { TradingTabs } from './TradingTabs';
import { WalletBalance } from './WalletBalance';
import { TradePairSelector } from './TradePairSelector';

export const TradingLayout: React.FC = () => {
  const { connected } = useWallet();

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Top Navigation */}
      <TopNavigation />

      {/* Main Trading Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left and Center Content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Chart Area */}
          <div className="h-[60%] min-h-[400px] border-b border-gray-800">
            <TradingViewWidget
              symbol="BTCUSDT"
              theme="dark"
              autosize
            />
          </div>

          {/* Order Book and Trading History */}
          <div className="flex flex-1 border-t border-gray-800">
            <div className="w-1/2 border-r border-gray-800">
              <OrderBook />
            </div>
            <div className="w-1/2">
              <TradingTabs />
            </div>
          </div>
        </div>

        {/* Right Trading Panel */}
        <div className="w-[350px] border-l border-gray-800 flex flex-col">
          <WalletBalance />
          <TradePairSelector />
          <TradePanel />
        </div>
      </div>
    </div>
  );
};
