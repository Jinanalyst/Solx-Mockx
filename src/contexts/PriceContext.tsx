'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface PriceData {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  high24h: number;
  low24h: number;
  lastUpdate: number;
}

interface PriceContextType {
  prices: { [key: string]: PriceData };
  getPrice: (symbol: string) => number;
  getVolume: (symbol: string) => number;
  getChange24h: (symbol: string) => number;
  getHigh24h: (symbol: string) => number;
  getLow24h: (symbol: string) => number;
}

const PriceContext = createContext<PriceContextType>({
  prices: {},
  getPrice: () => 0,
  getVolume: () => 0,
  getChange24h: () => 0,
  getHigh24h: () => 0,
  getLow24h: () => 0,
});

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<{ [key: string]: PriceData }>({});

  useEffect(() => {
    const symbols = ['BTCUSDT'];
    let ws: WebSocket;

    const connectWebSocket = () => {
      // Connect to Binance WebSocket for 24hr ticker
      const streams = symbols.map(symbol => `${symbol.toLowerCase()}@ticker`).join('/');
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setPrices(prev => ({
          ...prev,
          [data.s]: {
            symbol: data.s,
            price: parseFloat(data.c),
            volume: parseFloat(data.v),
            change24h: parseFloat(data.P),
            high24h: parseFloat(data.h),
            low24h: parseFloat(data.l),
            lastUpdate: data.E,
          }
        }));
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setTimeout(connectWebSocket, 5000);
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting...');
        setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const getPrice = (symbol: string): number => {
    return prices[symbol]?.price || 0;
  };

  const getVolume = (symbol: string): number => {
    return prices[symbol]?.volume || 0;
  };

  const getChange24h = (symbol: string): number => {
    return prices[symbol]?.change24h || 0;
  };

  const getHigh24h = (symbol: string): number => {
    return prices[symbol]?.high24h || 0;
  };

  const getLow24h = (symbol: string): number => {
    return prices[symbol]?.low24h || 0;
  };

  return (
    <PriceContext.Provider value={{ 
      prices, 
      getPrice, 
      getVolume,
      getChange24h,
      getHigh24h,
      getLow24h,
    }}>
      {children}
    </PriceContext.Provider>
  );
}

export const usePrice = () => useContext(PriceContext);
