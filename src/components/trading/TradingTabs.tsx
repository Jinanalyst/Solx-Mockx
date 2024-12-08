import React, { useState } from 'react';

interface Trade {
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  time: string;
}

interface Order {
  id: string;
  pair: string;
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  filled: number;
  status: 'open' | 'partial' | 'filled' | 'cancelled';
}

export const TradingTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'history'>('orders');

  // Dummy data for demonstration
  const openOrders: Order[] = [
    {
      id: '1',
      pair: 'BTC/USDT',
      type: 'limit',
      side: 'buy',
      price: 45000,
      amount: 0.1,
      filled: 0.05,
      status: 'partial',
    },
  ];

  const tradeHistory: Trade[] = [
    {
      price: 45100,
      amount: 0.01,
      side: 'buy',
      time: '2024-02-08 12:34:56',
    },
    {
      price: 45050,
      amount: 0.02,
      side: 'sell',
      time: '2024-02-08 12:34:50',
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-800">
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'orders'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          Open Orders
        </button>
        <button
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'history'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Trade History
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'orders' ? (
          <div className="divide-y divide-gray-800">
            {openOrders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex justify-between mb-2">
                  <span className={order.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    {order.side.toUpperCase()} {order.pair}
                  </span>
                  <span className="text-gray-400">{order.type.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white">${order.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">
                    {order.filled}/{order.amount} BTC
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {tradeHistory.map((trade, index) => (
              <div key={index} className="p-4">
                <div className="flex justify-between mb-2">
                  <span className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    {trade.side.toUpperCase()}
                  </span>
                  <span className="text-gray-400">{trade.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-white">${trade.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">{trade.amount} BTC</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
