'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { MarketDataService } from '@/services/marketDataService';
import { CoinInfo, MarketPair, TokenPrice } from '@/types/market';

interface MarketDataContextType {
  marketData: CoinInfo[];
  marketPairs: Record<string, MarketPair[]>;
  getTokenPrice: (tokenId: string) => Promise<TokenPrice | null>;
  searchCoins: (query: string) => Promise<CoinInfo[]>;
  getHistoricalPrices: (coinId: string, days?: number) => Promise<any>;
  getTopMarketPairs: (limit?: number) => MarketPair[];
  isLoading: boolean;
  error: Error | null;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export function MarketDataProvider({ children }: { children: ReactNode }) {
  const [marketData, setMarketData] = useState<CoinInfo[]>([]);
  const [marketPairs, setMarketPairs] = useState<Record<string, MarketPair[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const marketService = MarketDataService.getInstance();

  useEffect(() => {
    const updateMarketData = () => {
      try {
        setMarketData(marketService.getAllMarketData());
        setMarketPairs(marketService.getAllMarketPairs());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to update market data'));
      } finally {
        setIsLoading(false);
      }
    };

    // Initial update
    updateMarketData();

    // Subscribe to updates
    const unsubscribe = marketService.subscribe(updateMarketData);

    return () => {
      unsubscribe();
    };
  }, []);

  const getTokenPrice = async (tokenId: string) => {
    try {
      return await marketService.getTokenPrice(tokenId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch token price'));
      return null;
    }
  };

  const searchCoins = async (query: string) => {
    try {
      return await marketService.searchCoins(query);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search coins'));
      return [];
    }
  };

  const getHistoricalPrices = async (coinId: string, days: number = 7) => {
    try {
      return await marketService.getHistoricalPrices(coinId, days);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch historical prices'));
      return null;
    }
  };

  const getTopMarketPairs = (limit: number = 10) => {
    return marketService.getTopMarketPairs(limit);
  };

  return (
    <MarketDataContext.Provider
      value={{
        marketData,
        marketPairs,
        getTokenPrice,
        searchCoins,
        getHistoricalPrices,
        getTopMarketPairs,
        isLoading,
        error,
      }}
    >
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (context === undefined) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
}
