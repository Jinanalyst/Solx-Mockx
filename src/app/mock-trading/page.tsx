'use client';

import { useState } from 'react';
import { TradingViewWidget } from '@/components/trading/TradingViewWidget';
import { OrderBook } from '@/components/trading/OrderBook';
import { TradePanel } from '@/components/trading/TradePanel';
import { RecentTrades } from '@/components/trading/RecentTrades';
import { Switch } from '@/components/ui/switch';
import { Sun, Moon } from 'lucide-react';

function MockTradingContent() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Mock data
  const mockData = {
    asks: [
      { price: 100100.50, size: 0.235, total: 23.52 },
      { price: 100095.20, size: 1.523, total: 152.41 },
      { price: 100090.80, size: 0.876, total: 87.67 },
    ],
    bids: [
      { price: 100075.60, size: 0.456, total: 45.67 },
      { price: 100070.30, size: 1.789, total: 178.99 },
      { price: 100065.90, size: 0.987, total: 98.79 },
    ],
    lastPrice: 100055.36,
    change24h: 0.75,
    high24h: 101234.56,
    low24h: 99876.54,
    volume24h: '1,812,156,156.15',
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('light-theme');
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-[#0b0e11]' : 'bg-white'}`}>
      {/* Top Navigation Bar */}
      <div className={`h-14 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex items-center px-4 justify-between sticky top-0 z-50 bg-inherit`}>
        <div className="flex items-center space-x-6">
          {/* Trading Pair Info */}
          <div className="flex items-center space-x-4">
            <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>BTC/USDT</span>
            <div className="flex flex-col">
              <span className="text-[#02c076] text-lg font-medium">${mockData.lastPrice.toLocaleString()}</span>
              <span className="text-[#02c076] text-xs">+{mockData.change24h}%</span>
            </div>
          </div>
          
          {/* Market Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex flex-col">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>24h High</span>
              <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${mockData.high24h.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>24h Low</span>
              <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${mockData.low24h.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>24h Volume</span>
              <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${mockData.volume24h}</span>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center space-x-2">
          <Sun className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-yellow-500'}`} />
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
          />
          <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-gray-400'}`} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Section - Chart and Order Book */}
        <div className="flex flex-col flex-[2] min-w-0 border-r border-gray-800">
          {/* Chart */}
          <div className="h-[600px] border-b border-gray-800">
            <TradingViewWidget theme={theme} />
          </div>
          
          {/* Bottom Section */}
          <div className="flex flex-1 min-h-0">
            <OrderBook 
              className="flex-1 border-r border-gray-800"
              theme={theme}
              asks={mockData.asks}
              bids={mockData.bids}
            />
            <RecentTrades 
              className="flex-1"
              theme={theme}
            />
          </div>
        </div>

        {/* Right Section - Trading Panel */}
        <div className="w-[400px]">
          <TradePanel theme={theme} />
        </div>
      </div>

      {/* Footer */}
      <div className={`h-12 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} flex items-center px-4 justify-between bg-inherit`}>
        <div className="flex items-center space-x-4">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            BTC/USDT +{mockData.change24h}%
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Last Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MockTradingPage() {
  return <MockTradingContent />;
}
