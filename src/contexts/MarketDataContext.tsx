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
import { PublicKey } from '@solana/web3.js';

interface MarketDataContextType {
  marketData: CoinInfo[];
  marketPairs: Record<string, MarketPair[]>;
  getTokenPrice: (tokenId: string) => Promise<TokenPrice | null>;
  getTokenBalance: (tokenId: string, walletAddress: PublicKey) => Promise<number>;
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
    return () => unsubscribe();
  }, []);

  const getTokenPrice = async (tokenId: string): Promise<TokenPrice | null> => {
    try {
      return await marketService.getTokenPrice(tokenId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get token price'));
      return null;
    }
  };

  const getTokenBalance = async (tokenId: string, walletAddress: PublicKey): Promise<number> => {
    try {
      return await marketService.getTokenBalance(tokenId, walletAddress);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get token balance'));
      return 0;
    }
  };

  const searchCoins = async (query: string): Promise<CoinInfo[]> => {
    try {
      return await marketService.searchCoins(query);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search coins'));
      return [];
    }
  };

  const getHistoricalPrices = async (coinId: string, days = 7) => {
    try {
      return await marketService.getHistoricalPrices(coinId, days);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get historical prices'));
      return [];
    }
  };

  const getTopMarketPairs = (limit = 10): MarketPair[] => {
    try {
      return marketService.getTopMarketPairs(limit);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get top market pairs'));
      return [];
    }
  };

  return (
    <MarketDataContext.Provider
      value={{
        marketData,
        marketPairs,
        getTokenPrice,
        getTokenBalance,
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
