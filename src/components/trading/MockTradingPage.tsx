import React, { useState } from 'react';
import { TradingViewWidget } from './TradingViewWidget';
import { OrderBook } from './OrderBook';
import { TradePanel } from './TradePanel';
import { RecentTrades } from './RecentTrades';

export const MockTradingPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30m');
  const timeframes = ['1s', '1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];

  // Mock data
  const mockPrice = 100055.36;
  const mockChange = 0.75;
  const mockVolume = '1,812,156,156.15';

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11]">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b border-gray-800 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-6">
          {/* Trading Pair Info */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-white">BTC/USDT</span>
            <span className="text-[#02c076]">{mockPrice.toLocaleString()}</span>
            <span className="text-[#02c076] text-sm">+{mockChange}%</span>
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
          <span className="text-gray-400">24h Volume: {mockVolume} USDT</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Chart and Order Book Section */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* TradingView Chart */}
          <div className="h-[65%] min-h-[400px] border-b border-gray-800">
            <TradingViewWidget
              symbol="BTCUSDT"
              theme="dark"
              interval={selectedTimeframe}
            />
          </div>

          {/* Order Book and Recent Trades */}
          <div className="flex flex-1">
            <OrderBook
              className="w-1/2 border-r border-gray-800"
              pair="BTC/USDT"
            />
            <div className="w-1/2 flex flex-col">
              <div className="border-b border-gray-800 px-4 py-2">
                <span className="text-gray-400">Recent Trades</span>
              </div>
              <RecentTrades />
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
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left p-4">Time</th>
                <th className="text-left p-4">Type</th>
                <th className="text-right p-4">Price</th>
                <th className="text-right p-4">Amount</th>
                <th className="text-right p-4">Filled</th>
                <th className="text-right p-4">Total</th>
                <th className="text-right p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Mock empty state */}
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No orders found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
