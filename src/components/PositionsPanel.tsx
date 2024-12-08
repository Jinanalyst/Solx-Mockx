'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Position {
  pair: string;
  side: 'long' | 'short';
  size: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  pnlPercent: string;
  isProfit: boolean;
}

const mockPositions: Position[] = [
  {
    pair: 'SOL/USDT',
    side: 'long',
    size: '100',
    entryPrice: '108.45',
    markPrice: '110.25',
    pnl: '+180.00',
    pnlPercent: '+1.65%',
    isProfit: true,
  },
  {
    pair: 'BTC/USDT',
    side: 'short',
    size: '0.05',
    entryPrice: '43,567.89',
    markPrice: '43,123.45',
    pnl: '+22.22',
    pnlPercent: '+1.02%',
    isProfit: true,
  },
];

export function PositionsPanel() {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('open')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'open'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Open Positions
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'closed'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Closed Positions
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {mockPositions.length > 0 ? (
          <div className="divide-y divide-border">
            {mockPositions.map((position, index) => (
              <div key={index} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    position.side === 'long' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {position.side === 'long' ? (
                      <ArrowUpRight className={`h-5 w-5 text-green-500`} />
                    ) : (
                      <ArrowDownRight className={`h-5 w-5 text-red-500`} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{position.pair}</div>
                    <div className="text-sm text-muted-foreground">
                      Size: {position.size}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    Entry: {position.entryPrice}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mark: {position.markPrice}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    position.isProfit ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {position.pnl} USDT
                  </div>
                  <div className={`text-sm ${
                    position.isProfit ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {position.pnlPercent}
                  </div>
                </div>
                <button className="rounded-lg border border-border px-3 py-1 text-sm hover:bg-muted">
                  Close
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No {activeTab} positions
          </div>
        )}
      </div>
    </div>
  );
}
