'use client';

import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'swap' | 'dca';
  pair: string;
  amount: string;
  price: string;
  total: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
}

const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    type: 'buy',
    pair: 'SOL/USDT',
    amount: '10.5',
    price: '108.45',
    total: '1,138.72',
    time: '2024-01-20 14:30:25',
    status: 'completed',
  },
  {
    id: 'tx2',
    type: 'sell',
    pair: 'BTC/USDT',
    amount: '0.05',
    price: '43,567.89',
    total: '2,178.39',
    time: '2024-01-20 14:25:12',
    status: 'completed',
  },
  {
    id: 'tx3',
    type: 'swap',
    pair: 'SOL → USDT',
    amount: '5.0',
    price: '108.45',
    total: '542.25',
    time: '2024-01-20 14:20:45',
    status: 'completed',
  },
  {
    id: 'tx4',
    type: 'dca',
    pair: 'ETH/USDT',
    amount: '0.1',
    price: '2,345.67',
    total: '234.57',
    time: '2024-01-20 14:15:30',
    status: 'completed',
  },
];

export function TransactionHistory() {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'swap' | 'dca'>('all');

  const filteredTransactions = filter === 'all'
    ? mockTransactions
    : mockTransactions.filter(tx => tx.type === filter);

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'buy':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'sell':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'swap':
        return (
          <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'dca':
        return (
          <svg className="h-4 w-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 8v8m-4-4h8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1 text-sm ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('buy')}
            className={`rounded-lg px-3 py-1 text-sm ${
              filter === 'buy'
                ? 'bg-green-500 text-white'
                : 'hover:bg-muted'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setFilter('sell')}
            className={`rounded-lg px-3 py-1 text-sm ${
              filter === 'sell'
                ? 'bg-red-500 text-white'
                : 'hover:bg-muted'
            }`}
          >
            Sell
          </button>
          <button
            onClick={() => setFilter('swap')}
            className={`rounded-lg px-3 py-1 text-sm ${
              filter === 'swap'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-muted'
            }`}
          >
            Swap
          </button>
          <button
            onClick={() => setFilter('dca')}
            className={`rounded-lg px-3 py-1 text-sm ${
              filter === 'dca'
                ? 'bg-purple-500 text-white'
                : 'hover:bg-muted'
            }`}
          >
            DCA
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getTypeIcon(tx.type)}
                  </div>
                  <div>
                    <div className="font-medium">{tx.pair}</div>
                    <div className="text-sm text-muted-foreground">
                      {tx.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {tx.amount} @ {tx.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total: {tx.total} USDT
                  </div>
                </div>
                <div className={`text-sm ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No transactions found
          </div>
        )}
      </div>
    </div>
  );
}
