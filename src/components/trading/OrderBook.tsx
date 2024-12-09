'use client';

import { useState, useEffect, useCallback } from 'react';

interface OrderBookEntry {
  price: string;
  quantity: string;
  total?: string;
}

export function OrderBook({ symbol = 'BTC/USDT' }: { symbol?: string }) {
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
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="sticky top-0 grid grid-cols-3 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground bg-card border-b">
        <div>Price(USDT)</div>
        <div>Size(BTC)</div>
        <div>Total</div>
      </div>

      {/* Asks (Sell orders) */}
      <div className="flex-1 overflow-auto">
        <div className="px-4 space-y-[2px] mb-2">
          {asks.slice().reverse().map((ask, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-[#f6465d]">{parseFloat(ask.price).toFixed(2)}</div>
              <div>{parseFloat(ask.quantity).toFixed(5)}</div>
              <div>{ask.total}</div>
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className="sticky z-10 px-4 py-2 text-sm font-medium border-y text-center bg-black/10">
          {currentPrice}
        </div>

        {/* Bids (Buy orders) */}
        <div className="px-4 space-y-[2px] mt-2">
          {bids.map((bid, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-[#0ecb81]">{parseFloat(bid.price).toFixed(2)}</div>
              <div>{parseFloat(bid.quantity).toFixed(5)}</div>
              <div>{bid.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
