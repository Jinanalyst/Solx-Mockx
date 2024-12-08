'use client';

import React from 'react';
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
      <div className={`flex items-center justify-between p-3 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>Recent Trades</h3>
      </div>

      {/* Table Headers */}
      <div className={`grid grid-cols-3 px-3 py-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'} border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <div>Price (USDT)</div>
        <div className="text-right">Size (BTC)</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List */}
      <ScrollArea className="flex-1">
        <div className="px-3">
          {trades.slice(0, 10).map((trade, index) => (
            <div
              key={trade.id}
              className={`grid grid-cols-3 py-1 text-xs ${
                theme === 'dark'
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={trade.side === 'buy' ? 'text-[#02c076]' : 'text-[#f6465d]'}>
                {formatNumber(trade.price)}
              </div>
              <div className={`text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {formatNumber(trade.amount)}
              </div>
              <div className={`text-right ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {new Date(trade.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
