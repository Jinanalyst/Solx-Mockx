'use client';

import { useState, useEffect } from 'react';
import { formatNumber } from '@/lib/utils';
import { fetchTokenOrderbook } from '@/lib/api';

interface Order {
  price: number;
  size: number;
  total: number;
}

interface OrderbookProps {
  pair: {
    baseToken: {
      address: string;
      symbol: string;
    };
    priceUsd: number;
    value: string;
  } | null;
}

export function Orderbook({ pair }: OrderbookProps) {
  const [asks, setAsks] = useState<Order[]>([]);
  const [bids, setBids] = useState<Order[]>([]);
  const [spread, setSpread] = useState<number>(0);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceChangeDirection, setPriceChangeDirection] = useState<'up' | 'down' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  if (!pair) {
    return (
      <div className="h-full flex items-center justify-center bg-background rounded-lg border border-border">
        <span className="text-muted-foreground">Select a trading pair to view orderbook</span>
      </div>
    );
  }

  useEffect(() => {
    const fetchOrderbookData = async () => {
      try {
        setIsLoading(true);
        const orderbookData = await fetchTokenOrderbook(pair.baseToken.address);
        
        if (!orderbookData) {
          console.error('No orderbook data received');
          return;
        }

        // Process asks
        const processedAsks = orderbookData.asks.slice(0, 15).map((ask: any) => ({
          price: parseFloat(ask.price),
          size: parseFloat(ask.size),
          total: parseFloat(ask.price) * parseFloat(ask.size)
        }));

        // Process bids
        const processedBids = orderbookData.bids.slice(0, 15).map((bid: any) => ({
          price: parseFloat(bid.price),
          size: parseFloat(bid.size),
          total: parseFloat(bid.price) * parseFloat(bid.size)
        }));

        // Calculate spread
        if (processedAsks.length > 0 && processedBids.length > 0) {
          const lowestAsk = processedAsks[0].price;
          const highestBid = processedBids[0].price;
          const spreadValue = ((lowestAsk - highestBid) / lowestAsk) * 100;
          setSpread(spreadValue);

          // Update price direction based on mid price
          const midPrice = (lowestAsk + highestBid) / 2;
          if (lastPrice !== null) {
            setPriceChangeDirection(midPrice > lastPrice ? 'up' : 'down');
          }
          setLastPrice(midPrice);
        }

        setAsks(processedAsks);
        setBids(processedBids);
      } catch (error) {
        console.error('Error fetching orderbook:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderbookData();
    const interval = setInterval(fetchOrderbookData, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, [pair?.baseToken?.address, lastPrice]);

  return (
    <div className="h-full flex flex-col text-sm bg-background rounded-lg border border-border">
      <div className="border-b border-border p-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground font-medium">Orderbook</span>
          <span className="text-muted-foreground">
            Spread: {spread ? formatNumber(spread, 3) : '-'}%
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mt-2">
          <div>Price (USDC)</div>
          <div className="text-right">Size ({pair.baseToken.symbol})</div>
          <div className="text-right">Total (USDC)</div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Loading orderbook...</span>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Asks */}
          <div className="flex-1 overflow-y-auto">
            {asks.map((ask, i) => (
              <div
                key={i}
                className="grid grid-cols-3 gap-4 px-3 py-1 text-xs hover:bg-muted/50 relative group"
                style={{
                  background: `linear-gradient(to left, rgba(239, 68, 68, 0.05) ${Math.min(
                    (ask.total / Math.max(...asks.map((a) => a.total))) * 100,
                    100
                  )}%, transparent 0%)`,
                }}
              >
                <div className="text-red-500 font-medium">{formatNumber(ask.price, 6)}</div>
                <div className="text-right">{formatNumber(ask.size, 3)}</div>
                <div className="text-right">{formatNumber(ask.total, 2)}</div>
              </div>
            ))}
          </div>

          {/* Last price */}
          <div className={`px-3 py-2 border-y border-border font-semibold ${
            priceChangeDirection === 'up' ? 'text-green-500' : 
            priceChangeDirection === 'down' ? 'text-red-500' : ''
          }`}>
            {lastPrice ? formatNumber(lastPrice, 6) : '-'}
          </div>

          {/* Bids */}
          <div className="flex-1 overflow-y-auto">
            {bids.map((bid, i) => (
              <div
                key={i}
                className="grid grid-cols-3 gap-4 px-3 py-1 text-xs hover:bg-muted/50 relative group"
                style={{
                  background: `linear-gradient(to left, rgba(34, 197, 94, 0.05) ${Math.min(
                    (bid.total / Math.max(...bids.map((b) => b.total))) * 100,
                    100
                  )}%, transparent 0%)`,
                }}
              >
                <div className="text-green-500 font-medium">{formatNumber(bid.price, 6)}</div>
                <div className="text-right">{formatNumber(bid.size, 3)}</div>
                <div className="text-right">{formatNumber(bid.total, 2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
