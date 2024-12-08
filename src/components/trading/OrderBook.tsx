'use client';

import React from 'react';
import { useMockTrading } from '@/contexts/MockTradingContext';
import { formatNumber } from '@/lib/utils';

interface OrderBookProps {
  pair: string;
  onError?: (error: unknown) => void;
  onPriceClick?: (price: number) => void;
}

export function OrderBook({ pair, onError, onPriceClick }: OrderBookProps) {
  const { orderBook } = useMockTrading();

  const handlePriceClick = (price: number) => {
    if (onPriceClick) {
      onPriceClick(price);
    }
  };

  if (!orderBook) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Order Book</h3>
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Order Book</h3>
      
      <div className="space-y-2">
        <div className="grid grid-cols-3 text-sm text-muted-foreground">
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Total</span>
        </div>
        
        {/* Sells */}
        <div className="space-y-1">
          {orderBook.asks.slice().reverse().map((ask, i) => (
            <div 
              key={i} 
              className="grid grid-cols-3 text-sm text-red-500 cursor-pointer hover:bg-accent"
              onClick={() => handlePriceClick(ask.price)}
            >
              <span>{formatNumber(ask.price)}</span>
              <span className="text-right">{formatNumber(ask.amount)}</span>
              <span className="text-right">{formatNumber(ask.price * ask.amount)}</span>
            </div>
          ))}
        </div>
        
        {/* Current price */}
        <div className="border-y border-border py-2 text-center font-semibold">
          {formatNumber((orderBook.asks[0].price + orderBook.bids[0].price) / 2)}
        </div>
        
        {/* Buys */}
        <div className="space-y-1">
          {orderBook.bids.map((bid, i) => (
            <div 
              key={i} 
              className="grid grid-cols-3 text-sm text-green-500 cursor-pointer hover:bg-accent"
              onClick={() => handlePriceClick(bid.price)}
            >
              <span>{formatNumber(bid.price)}</span>
              <span className="text-right">{formatNumber(bid.amount)}</span>
              <span className="text-right">{formatNumber(bid.price * bid.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
