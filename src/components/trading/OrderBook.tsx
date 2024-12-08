import React from 'react';

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
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between p-3 border-b ${borderColor}">
        <h2 className={`font-medium ${textColor}`}>Order Book</h2>
        <div className="flex space-x-2">
          <button className="px-2 py-1 text-xs rounded bg-gray-700 text-white">0.1</button>
          <button className="px-2 py-1 text-xs rounded bg-gray-700 text-white">1.0</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Headers */}
        <div className={`grid grid-cols-3 px-3 py-2 text-xs ${mutedTextColor} sticky top-0 ${theme === 'dark' ? 'bg-[#0b0e11]' : 'bg-white'}`}>
          <div>Price (USDT)</div>
          <div className="text-right">Size (BTC)</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks */}
        <div className="space-y-1">
          {asks.map((ask, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 px-3 py-1 text-sm ${hoverBg} cursor-pointer relative`}
            >
              <div className="text-[#f6465d]">{ask.price.toLocaleString()}</div>
              <div className="text-right">{ask.size.toFixed(3)}</div>
              <div className="text-right">{ask.total.toFixed(2)}</div>
              <div
                className="absolute inset-0 bg-[#f6465d] opacity-[0.05]"
                style={{ width: `${(ask.total / Math.max(...asks.map(a => a.total))) * 100}%` }}
              />
            </div>
          ))}
        </div>

        {/* Spread */}
        <div className={`px-3 py-2 text-sm ${mutedTextColor} text-center`}>
          Spread: {((asks[0]?.price || 0) - (bids[0]?.price || 0)).toFixed(2)} ({((((asks[0]?.price || 0) - (bids[0]?.price || 0)) / (asks[0]?.price || 1)) * 100).toFixed(2)}%)
        </div>

        {/* Bids */}
        <div className="space-y-1">
          {bids.map((bid, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 px-3 py-1 text-sm ${hoverBg} cursor-pointer relative`}
            >
              <div className="text-[#02c076]">{bid.price.toLocaleString()}</div>
              <div className="text-right">{bid.size.toFixed(3)}</div>
              <div className="text-right">{bid.total.toFixed(2)}</div>
              <div
                className="absolute inset-0 bg-[#02c076] opacity-[0.05]"
                style={{ width: `${(bid.total / Math.max(...bids.map(b => b.total))) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
