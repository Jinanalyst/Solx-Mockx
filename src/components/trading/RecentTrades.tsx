'use client';

import { useEffect, useState } from 'react';

interface Trade {
  price: string;
  quantity: string;
  timestamp: number;
  isBuyerMaker: boolean;
}

interface RecentTradesProps {
  symbol?: string;
  className?: string;
}

export function RecentTrades({ symbol = 'BTCUSDT', className = '' }: RecentTradesProps) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    let ws: WebSocket;

    const connectWebSocket = () => {
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`);
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const newTrade: Trade = {
          price: data.p,
          quantity: data.q,
          timestamp: data.T,
          isBuyerMaker: data.m
        };

        setTrades(prevTrades => {
          const updatedTrades = [newTrade, ...prevTrades].slice(0, 50); // Keep last 50 trades
          return updatedTrades;
        });
      };
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, [symbol]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="grid grid-cols-3 px-2 py-2 text-xs text-gray-400 border-b border-gray-800">
        <div className="text-right">Price(USDT)</div>
        <div className="text-right">Qty(BTC)</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto">
        {trades.map((trade, index) => (
          <div
            key={`${trade.timestamp}-${index}`}
            className="grid grid-cols-3 py-1 px-2 text-right text-sm hover:bg-gray-800/30"
          >
            <span className={trade.isBuyerMaker ? 'text-[#f6465d]' : 'text-[#02c076]'}>
              {parseFloat(trade.price).toFixed(2)}
            </span>
            <span className="text-gray-300">{parseFloat(trade.quantity).toFixed(6)}</span>
            <span className="text-gray-300">{formatTime(trade.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
