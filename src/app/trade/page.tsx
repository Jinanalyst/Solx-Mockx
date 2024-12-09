'use client';

import { TradingViewWidget } from '@/components/trading/TradingViewWidget';
import { TradePanel } from '@/components/trading/TradePanel';
import { Positions } from '@/components/trading/Positions';
import { usePrice } from '@/contexts/PriceContext';

function TradeContent() {
  const { getPrice, getVolume, getChange24h } = usePrice();

  // Get real-time data
  const currentPrice = getPrice('BTCUSDT');
  const volume24h = getVolume('BTCUSDT');
  const priceChange24h = getChange24h('BTCUSDT');

  return (
    <div className="flex flex-col h-screen bg-[#0b0e11]">
      {/* Top Navigation Bar */}
      <div className="h-14 border-b border-gray-800 flex items-center px-4 justify-between">
        {/* Left Section - Trading Pair Info */}
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold text-white">BTCUSDT</span>
          <span className={`${priceChange24h >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
            {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-sm ${priceChange24h >= 0 ? 'text-[#02c076]' : 'text-[#f6465d]'}`}>
            {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
          </span>
        </div>

        {/* Right Section - Volume */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">
            24h Volume: {volume24h.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 min-h-0">
        {/* Left Section - Chart and Positions */}
        <div className="col-span-8 grid grid-rows-[1fr_auto] gap-4 min-h-0">
          {/* Chart */}
          <div className="rounded-lg overflow-hidden border border-gray-800 min-h-0">
            <TradingViewWidget symbol="BTCUSDT" />
          </div>
          
          {/* Positions */}
          <div className="h-[200px] min-h-0 overflow-auto">
            <Positions />
          </div>
        </div>

        {/* Right Section - Trade Panel */}
        <div className="col-span-4 min-h-0">
          <div className="h-full overflow-auto">
            <TradePanel symbol="BTC/USDT" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradePage() {
  return <TradeContent />;
}
