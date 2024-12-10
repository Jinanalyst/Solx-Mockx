'use client';

import { useState, useEffect, useCallback } from 'react';

interface OrderBookProps {
  symbol?: string;
  className?: string;
}

interface OrderBookEntry {
  price: string;
  quantity: string;
  total?: string;
}

export function OrderBook({ symbol = 'BTC/USDT', className }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [currentPrice, setCurrentPrice] = useState<string>('0');

  const connectWebSocket = useCallback(() => {
    if (!symbol) return null;
    
    const formattedSymbol = symbol.replace('/', '').toLowerCase();
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${formattedSymbol}@depth20@100ms`);
    const priceWs = new WebSocket(`wss://stream.binance.com:9443/ws/${formattedSymbol}@trade`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.bids || !data.asks) return;

        const newBids = data.bids.slice(0, 15).map((bid: string[]) => ({
          price: bid[0],
          quantity: bid[1],
          total: (parseFloat(bid[0]) * parseFloat(bid[1])).toFixed(4)
        }));

        const newAsks = data.asks.slice(0, 15).map((ask: string[]) => ({
          price: ask[0],
          quantity: ask[1],
          total: (parseFloat(ask[0]) * parseFloat(ask[1])).toFixed(4)
        }));

        setBids(newBids);
        setAsks(newAsks);
      } catch (error) {
        console.error('Error processing orderbook data:', error);
      }
    };

    priceWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setCurrentPrice(parseFloat(data.p).toFixed(2));
      } catch (error) {
        console.error('Error processing price data:', error);
      }
    };

    return { ws, priceWs };
  }, [symbol]);

  useEffect(() => {
    const sockets = connectWebSocket();
    
    return () => {
      if (sockets) {
        sockets.ws.close();
        sockets.priceWs.close();
      }
    };
  }, [connectWebSocket]);

  return (
    <div className={className}>
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold">Order Book</h3>
        <div className="grid grid-cols-3 text-sm text-muted-foreground mb-2">
          <div>Price</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Total</div>
        </div>
        
        {/* Asks (Sell orders) */}
        <div className="space-y-1">
          {asks.slice().reverse().map((ask, i) => (
            <div key={i} className="grid grid-cols-3 text-sm text-red-500">
              <div>{parseFloat(ask.price).toFixed(2)}</div>
              <div className="text-right">{parseFloat(ask.quantity).toFixed(6)}</div>
              <div className="text-right">{ask.total}</div>
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className="py-2 text-center font-bold text-lg">
          ${currentPrice}
        </div>

        {/* Bids (Buy orders) */}
        <div className="space-y-1">
          {bids.map((bid, i) => (
            <div key={i} className="grid grid-cols-3 text-sm text-green-500">
              <div>{parseFloat(bid.price).toFixed(2)}</div>
              <div className="text-right">{parseFloat(bid.quantity).toFixed(6)}</div>
              <div className="text-right">{bid.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
