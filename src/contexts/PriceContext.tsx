'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

interface PriceData {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  high24h: number;
  low24h: number;
  lastUpdate: number;
  bid: number;
  ask: number;
  openPrice: number;
}

interface PriceContextType {
  prices: { [key: string]: PriceData };
  getPrice: (symbol: string) => number;
  getVolume: (symbol: string) => number;
  getChange24h: (symbol: string) => number;
  getHigh24h: (symbol: string) => number;
  getLow24h: (symbol: string) => number;
  getBid: (symbol: string) => number;
  getAsk: (symbol: string) => number;
  getOpenPrice: (symbol: string) => number;
  isConnected: boolean;
}

const DEFAULT_PRICE_DATA: PriceData = {
  symbol: '',
  price: 0,
  volume: 0,
  change24h: 0,
  high24h: 0,
  low24h: 0,
  lastUpdate: 0,
  bid: 0,
  ask: 0,
  openPrice: 0,
};

const PriceContext = createContext<PriceContextType>({
  prices: {},
  getPrice: () => 0,
  getVolume: () => 0,
  getChange24h: () => 0,
  getHigh24h: () => 0,
  getLow24h: () => 0,
  getBid: () => 0,
  getAsk: () => 0,
  getOpenPrice: () => 0,
  isConnected: false,
});

const TRADING_PAIRS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'MATICUSDT',
  'AVAXUSDT',
] as const;

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const [prices, setPrices] = useState<{ [key: string]: PriceData }>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 5000;

  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      if (!data || !data.s || !data.c) {
        throw new Error('Invalid price data received');
      }

      setPrices(prev => ({
        ...prev,
        [data.s]: {
          symbol: data.s,
          price: parseFloat(data.c) || 0,
          volume: parseFloat(data.v) || 0,
          change24h: parseFloat(data.P) || 0,
          high24h: parseFloat(data.h) || 0,
          low24h: parseFloat(data.l) || 0,
          lastUpdate: data.E || Date.now(),
          bid: parseFloat(data.b) || 0,
          ask: parseFloat(data.a) || 0,
          openPrice: parseFloat(data.o) || 0,
        }
      }));
    } catch (error) {
      console.error('Error processing price data:', error);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      const streams = TRADING_PAIRS.map(symbol => 
        `${symbol.toLowerCase()}@ticker`
      ).join('/');

      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setRetryCount(0);
      };

      ws.onmessage = handleWebSocketMessage;

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        handleReconnect();
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        handleReconnect();
      };

      wsRef.current = ws;

      return () => {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      setIsConnected(false);
      handleReconnect();
    }
  }, [handleWebSocketMessage]);

  const handleReconnect = useCallback(() => {
    if (retryCount >= MAX_RETRIES) {
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to price feed after multiple attempts',
        variant: 'destructive',
      });
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      setRetryCount(prev => prev + 1);
      connectWebSocket();
    }, RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
  }, [retryCount, connectWebSocket]);

  // Initialize WebSocket connection
  useEffect(() => {
    const cleanup = connectWebSocket();
    return () => {
      if (cleanup) cleanup();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  const getPrice = useCallback((symbol: string): number => {
    return prices[symbol]?.price ?? DEFAULT_PRICE_DATA.price;
  }, [prices]);

  const getVolume = useCallback((symbol: string): number => {
    return prices[symbol]?.volume ?? DEFAULT_PRICE_DATA.volume;
  }, [prices]);

  const getChange24h = useCallback((symbol: string): number => {
    return prices[symbol]?.change24h ?? DEFAULT_PRICE_DATA.change24h;
  }, [prices]);

  const getHigh24h = useCallback((symbol: string): number => {
    return prices[symbol]?.high24h ?? DEFAULT_PRICE_DATA.high24h;
  }, [prices]);

  const getLow24h = useCallback((symbol: string): number => {
    return prices[symbol]?.low24h ?? DEFAULT_PRICE_DATA.low24h;
  }, [prices]);

  const getBid = useCallback((symbol: string): number => {
    return prices[symbol]?.bid ?? DEFAULT_PRICE_DATA.bid;
  }, [prices]);

  const getAsk = useCallback((symbol: string): number => {
    return prices[symbol]?.ask ?? DEFAULT_PRICE_DATA.ask;
  }, [prices]);

  const getOpenPrice = useCallback((symbol: string): number => {
    return prices[symbol]?.openPrice ?? DEFAULT_PRICE_DATA.openPrice;
  }, [prices]);

  const contextValue = {
    prices,
    getPrice,
    getVolume,
    getChange24h,
    getHigh24h,
    getLow24h,
    getBid,
    getAsk,
    getOpenPrice,
    isConnected,
  };

  return (
    <PriceContext.Provider value={contextValue}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrice() {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error('usePrice must be used within a PriceProvider');
  }
  return context;
}
