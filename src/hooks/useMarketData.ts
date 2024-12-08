'use client';

import { useEffect, useState } from 'react';
import { getFTXWebSocket } from '@/lib/websocket/ftx';

export interface MarketData {
  price: number;
  size: number;
  side: 'buy' | 'sell';
  liquidation: boolean;
  time: string;
}

export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export function useMarketData(market: string) {
  const [trades, setTrades] = useState<MarketData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [ticker, setTicker] = useState<{
    bid: number;
    ask: number;
    last: number;
    change24h: number;
    volume24h: number;
  }>({
    bid: 0,
    ask: 0,
    last: 0,
    change24h: 0,
    volume24h: 0,
  });

  useEffect(() => {
    const ws = getFTXWebSocket();

    // Subscribe to trades
    ws.subscribe('trades', market, (data) => {
      setTrades(prevTrades => {
        const newTrades = [...data, ...prevTrades].slice(0, 100);
        return newTrades;
      });
    });

    // Subscribe to orderbook
    ws.subscribe('orderbook', market, (data) => {
      if (data.action === 'partial') {
        setOrderBook({
          bids: data.bids || [],
          asks: data.asks || [],
        });
      } else {
        setOrderBook(prev => {
          const updateLevels = (
            levels: OrderBookLevel[],
            updates: OrderBookLevel[],
            side: 'bids' | 'asks'
          ) => {
            const updatedLevels = [...levels];
            
            updates.forEach(update => {
              const index = updatedLevels.findIndex(level => level.price === update.price);
              
              if (update.size === 0) {
                if (index !== -1) {
                  updatedLevels.splice(index, 1);
                }
              } else if (index === -1) {
                updatedLevels.push(update);
                updatedLevels.sort((a, b) => 
                  side === 'bids' ? b.price - a.price : a.price - b.price
                );
              } else {
                updatedLevels[index] = update;
              }
            });

            return updatedLevels;
          };

          return {
            bids: updateLevels(prev.bids, data.bids || [], 'bids'),
            asks: updateLevels(prev.asks, data.asks || [], 'asks'),
          };
        });
      }
    });

    // Subscribe to ticker
    ws.subscribe('ticker', market, (data) => {
      setTicker({
        bid: data.bid,
        ask: data.ask,
        last: data.last,
        change24h: data.change24h,
        volume24h: data.volume24h,
      });
    });

    return () => {
      ws.unsubscribe('trades', market, () => {});
      ws.unsubscribe('orderbook', market, () => {});
      ws.unsubscribe('ticker', market, () => {});
    };
  }, [market]);

  return {
    trades,
    orderBook,
    ticker,
  };
}
