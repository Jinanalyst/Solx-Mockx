'use client';

import { useState } from 'react';
import { TradingViewWidget } from '@/components/trading/TradingViewWidget';
import { OrderBook } from '@/components/trading/OrderBook';
import { TradePanel } from '@/components/trading/TradePanel';
import { RecentTrades } from '@/components/trading/RecentTrades';
import { TradingOrders } from '@/components/trading/TradingOrders';

function TradeContent() {
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
            <span className="text-xl font-semibold text-white">BTCUSDT</span>
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
        {/* Left Section - Chart and Order Book */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-gray-800">
          {/* Chart */}
          <div className="h-[50%] border-b border-gray-800">
            <TradingViewWidget symbol="BTCUSDT" />
          </div>
          
          {/* Trading Orders Section */}
          <div className="h-[25%] border-b border-gray-800">
            <TradingOrders />
          </div>

          {/* Bottom Section */}
          <div className="flex flex-1 min-h-0">
            <OrderBook className="flex-1 border-r border-gray-800" />
            <RecentTrades className="flex-1" />
          </div>
        </div>

        {/* Right Section - Trading Panel */}
        <div className="w-[350px]">
          <TradePanel />
        </div>
      </div>
    </div>
  );
}

export default function TradePage() {
  return (
    <div className="min-h-screen bg-background">
      <TradeContent />
    </div>
  );
}
