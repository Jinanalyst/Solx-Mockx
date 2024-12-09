'use client';

import React, { useState } from 'react';
import { useMockTrading } from '@/contexts/MockTradingContext';
import { formatNumber } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Trade {
  price: number;
  amount: number;
  timestamp: number;
  side: 'buy' | 'sell';
}

interface RecentTradesProps {
  className?: string;
  theme?: 'dark' | 'light';
}

export function RecentTrades({ className, theme = 'dark' }: RecentTradesProps) {
  const { trades } = useMockTrading();
  const [activeTab, setActiveTab] = useState<'recent' | 'market'>('recent');

  if (!trades || trades.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
        <div className="text-center text-muted-foreground">No trades yet</div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${theme === 'dark' ? 'bg-[#0b0e11]' : 'bg-white'} ${className}`}>
      {/* Header */}
      <div className={`flex items-center border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'recent'
              ? 'border-[#f0b90b] text-[#f0b90b]'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Recent Trades
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'market'
              ? 'border-[#f0b90b] text-[#f0b90b]'
              : 'border-transparent text-gray-500 hover:text-gray-300'
          }`}
        >
          Market Trades
        </button>
      </div>

      {/* Table Headers */}
      <div className={`grid grid-cols-3 px-3 py-1 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
        <div>Price(USDT)</div>
        <div className="text-right">Size(BTC)</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List */}
      <ScrollArea className="flex-1">
        <div className="px-3">
          {trades.slice(0, 30).map((trade, index) => (
            <div
              key={trade.id}
              className={`grid grid-cols-3 py-[2px] text-xs ${
                theme === 'dark'
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={trade.side === 'buy' ? 'text-[#02c076]' : 'text-[#f6465d]'}>
                {formatNumber(trade.price)}
              </div>
              <div className={`text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {trade.amount.toFixed(6)}
              </div>
              <div className={`text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
