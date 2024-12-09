'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { useMockBalance } from '@/contexts/MockBalanceContext';
import { TradingViewWidget } from './TradingViewWidget';
import { TradePanel } from './TradePanel';
import { Positions } from './Positions';

interface TradingPair {
  name: string;
  symbol: string;
  baseToken: string;
  quoteToken: string;
  price: string;
  change24h: number;
  volume24h: string;
  logoUrl: string;
}

const tradingPairs: TradingPair[] = [
  {
    name: 'BTC/USDT',
    symbol: 'BTCUSDT',
    baseToken: 'BTC',
    quoteToken: 'USDT',
    price: '99,447.98',
    change24h: -0.08,
    volume24h: '1.97B',
    logoUrl: '/images/tokens/btc.png'
  },
  {
    name: 'ETH/USDT',
    symbol: 'ETHUSDT',
    baseToken: 'ETH',
    quoteToken: 'USDT',
    price: '3,905.86',
    change24h: -1.76,
    volume24h: '652.77M',
    logoUrl: '/images/tokens/eth.png'
  },
  {
    name: 'SOL/USDT',
    symbol: 'SOLUSDT',
    baseToken: 'SOL',
    quoteToken: 'USDT',
    price: '230.58',
    change24h: -2.84,
    volume24h: '188.19M',
    logoUrl: '/images/tokens/sol.png'
  }
];

export function MockTrading() {
  const { mockBalances } = useMockBalance();
  const [selectedPair, setSelectedPair] = React.useState<TradingPair>(tradingPairs[0]);
  const [prices, setPrices] = React.useState<{ [key: string]: string }>({});

  // Get USDT balance from mock balances
  const usdtBalance = mockBalances.find(b => b.symbol === 'USDT')?.balance || 0;

  // Simulate real-time price updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices: { [key: string]: string } = {};
        tradingPairs.forEach(pair => {
          const currentPrice = parseFloat(pair.price);
          const randomChange = (Math.random() - 0.5) * 0.001 * currentPrice;
          newPrices[pair.name] = (currentPrice + randomChange).toFixed(
            currentPrice > 100 ? 2 : currentPrice > 1 ? 4 : 6
          );
        });
        return newPrices;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11]">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b border-gray-800 flex items-center px-4 justify-between">
        {/* Left Section - Trading Pair Info */}
        <div className="flex items-center space-x-4">
          <select
            className="bg-background text-foreground px-2 py-1 rounded-md border"
            value={selectedPair.name}
            onChange={(e) => {
              const pair = tradingPairs.find(p => p.name === e.target.value);
              if (pair) setSelectedPair(pair);
            }}
          >
            {tradingPairs.map((pair) => (
              <option key={pair.name} value={pair.name}>
                {pair.name}
              </option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-semibold ${selectedPair.change24h >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
              ${prices[selectedPair.name] || selectedPair.price}
            </span>
            <span className={`text-sm ${selectedPair.change24h >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
              {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h}%
            </span>
          </div>
        </div>

        {/* Right Section - Volume and Balance */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">
            24h Volume: {selectedPair.volume24h} USDT
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-400">
            Mock Balance: {usdtBalance.toFixed(2)} USDT
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
        {/* Left Section - Chart and Positions */}
        <div className="col-span-8 grid grid-rows-[1fr_auto] gap-4 min-h-0">
          {/* Chart */}
          <div className="rounded-lg overflow-hidden border border-gray-800 min-h-0">
            <TradingViewWidget symbol={selectedPair.symbol} />
          </div>
          
          {/* Positions */}
          <div className="h-[200px] min-h-0 overflow-auto">
            <Positions />
          </div>
        </div>

        {/* Right Section - Trade Panel */}
        <div className="col-span-4 min-h-0">
          <div className="h-full overflow-auto">
            <TradePanel symbol={selectedPair.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
