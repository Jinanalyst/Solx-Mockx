import React, { useState } from 'react';

interface Order {
  price: number;
  size: number;
  total: number;
}

interface OrderBookProps {
  theme?: 'light' | 'dark';
  asks?: Order[];
  bids?: Order[];
  className?: string;
}

export const OrderBook: React.FC<OrderBookProps> = ({ 
  theme = 'dark',
  asks = [],
  bids = [],
  className = ''
}) => {
  const [grouping, setGrouping] = useState('0.01');
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-200';

  const groupSizes = ['0.01', '0.1', '1.0', '10'];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-2 border-b ${borderColor}">
        <div className="flex items-center space-x-4">
          <h2 className={`text-sm font-medium ${textColor}`}>Order Book</h2>
          <div className="flex">
            {groupSizes.map((size) => (
              <button
                key={size}
                onClick={() => setGrouping(size)}
                className={`px-2 py-1 text-xs ${
                  grouping === size
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Headers */}
        <div className={`grid grid-cols-3 px-3 py-1 text-xs ${mutedTextColor} sticky top-0 ${theme === 'dark' ? 'bg-[#0b0e11]' : 'bg-white'}`}>
          <div>Price(USDT)</div>
          <div className="text-right">Qty(BTC)</div>
          <div className="text-right">Total(BTC)</div>
        </div>

        {/* Asks */}
        <div>
          {asks.map((ask, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 px-3 py-[2px] text-xs ${hoverBg} cursor-pointer relative`}
            >
              <div className="text-[#f6465d] z-10">{ask.price.toLocaleString()}</div>
              <div className="text-right z-10">{ask.size.toFixed(6)}</div>
              <div className="text-right z-10">{ask.total.toFixed(6)}</div>
              <div
                className="absolute inset-0 bg-[#f6465d] opacity-[0.05]"
                style={{ width: `${(ask.total / Math.max(...asks.map(a => a.total))) * 100}%`, left: 'auto', right: 0 }}
              />
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className={`px-3 py-1 text-xs ${textColor} flex items-center justify-between border-y ${borderColor}`}>
          <span className="text-[#f6465d]">↓ {(asks[0]?.price || 0).toLocaleString()}</span>
          <span className="text-gray-500">≈{((asks[0]?.price || 0)).toLocaleString()} USD</span>
        </div>

        {/* Bids */}
        <div>
          {bids.map((bid, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 px-3 py-[2px] text-xs ${hoverBg} cursor-pointer relative`}
            >
              <div className="text-[#02c076] z-10">{bid.price.toLocaleString()}</div>
              <div className="text-right z-10">{bid.size.toFixed(6)}</div>
              <div className="text-right z-10">{bid.total.toFixed(6)}</div>
              <div
                className="absolute inset-0 bg-[#02c076] opacity-[0.05]"
                style={{ width: `${(bid.total / Math.max(...bids.map(b => b.total))) * 100}%`, left: 0 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-2 border-t ${borderColor}">
        <div className="flex items-center space-x-2">
          <span className={`text-xs ${mutedTextColor}`}>B {Math.round((bids.reduce((acc, bid) => acc + bid.total, 0) / (asks.reduce((acc, ask) => acc + ask.total, 0) + bids.reduce((acc, bid) => acc + bid.total, 0))) * 100)}%</span>
          <div className="flex-1 h-1 bg-gray-700 rounded">
            <div
              className="h-full bg-[#02c076] rounded"
              style={{
                width: `${(bids.reduce((acc, bid) => acc + bid.total, 0) / (asks.reduce((acc, ask) => acc + ask.total, 0) + bids.reduce((acc, bid) => acc + bid.total, 0))) * 100}%`
              }}
            />
          </div>
          <span className={`text-xs ${mutedTextColor}`}>S {Math.round((asks.reduce((acc, ask) => acc + ask.total, 0) / (asks.reduce((acc, ask) => acc + ask.total, 0) + bids.reduce((acc, bid) => acc + bid.total, 0))) * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
