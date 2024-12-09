'use client';

import React, { useState, useEffect } from 'react';
import TradingViewWidget from '@/components/TradingViewWidget';
import { TradingPair, getTradingPairs } from '@/utils/tradingView';
import { TradingOrders } from '@/components/trading/TradingOrders';

export default function MockTradingPage() {
  const [selectedPair, setSelectedPair] = useState<string>('BTCUSDT');
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);

  useEffect(() => {
    const loadTradingPairs = async () => {
      const pairs = await getTradingPairs();
      setTradingPairs(pairs);
    };
    loadTradingPairs();
  }, []);

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Mock Trading</h1>
        <select 
          value={selectedPair}
          onChange={(e) => setSelectedPair(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {tradingPairs.map((pair) => (
            <option key={`${pair.base}${pair.quote}`} value={`${pair.base}${pair.quote}`}>
              {pair.description || `${pair.base}/${pair.quote}`}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Chart Section */}
          <div className="bg-gray-800 rounded-lg p-4" style={{ height: '500px' }}>
            <TradingViewWidget 
              symbol={selectedPair}
              theme="dark"
              interval="15"
              height="100%"
            />
          </div>

          {/* Trading Orders Section */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <TradingOrders />
          </div>
        </div>

        {/* Trading Interface */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Order Form</h2>
            <div className="flex space-x-2 mb-4">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
                Buy
              </button>
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
                Sell
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Total</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Order Book</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Price</span>
                <span>Amount</span>
                <span>Total</span>
              </div>
              {/* Add order book entries here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
