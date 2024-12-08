import React, { useState } from 'react';
import { TradingViewWidget } from '../components/trading/TradingViewWidget';
import { OrderBook } from '../components/trading/OrderBook';
import { TradePanel } from '../components/trading/TradePanel';

export const TradingPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30m');
  const timeframes = ['1s', '1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11]">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b border-gray-800 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-6">
          {/* Trading Pair Info */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-white">BTC/USDT</span>
            <span className="text-[#02c076]">100,055.36</span>
            <span className="text-[#02c076] text-sm">+0.75%</span>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex space-x-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedTimeframe === tf
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">24h Volume: 1,812,156,156.15</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Chart and Order Book Section */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* TradingView Chart */}
          <div className="h-[65%] min-h-[400px]">
            <TradingViewWidget
              symbol="BTCUSDT"
              theme="dark"
              interval={selectedTimeframe}
            />
          </div>

          {/* Order Book and Recent Trades */}
          <div className="flex flex-1 border-t border-gray-800">
            <OrderBook
              className="w-1/2 border-r border-gray-800"
              pair="BTC/USDT"
            />
            <div className="w-1/2 flex flex-col">
              <div className="border-b border-gray-800 px-4 py-2">
                <span className="text-gray-400">Recent Trades</span>
              </div>
              <div className="flex-1 overflow-auto">
                {/* Recent trades will be implemented here */}
              </div>
            </div>
          </div>
        </div>

        {/* Trading Panel */}
        <TradePanel className="w-[350px] border-l border-gray-800" />
      </div>

      {/* Bottom Section - Trade History */}
      <div className="h-48 border-t border-gray-800">
        <div className="flex h-10 border-b border-gray-800">
          <button className="px-4 text-white border-b-2 border-[#f7a600]">
            Open Orders (0)
          </button>
          <button className="px-4 text-gray-400 hover:text-white">
            Order History
          </button>
          <button className="px-4 text-gray-400 hover:text-white">
            Trade History
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {/* Trade history content will be implemented here */}
        </div>
      </div>
    </div>
  );
};
