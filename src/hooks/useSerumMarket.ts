import { useState, useEffect } from 'react';
import { serumService, MarketData } from '@/services/serumService';

export function useSerumMarket(marketAddress: string) {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [orderBook, setOrderBook] = useState<{ bids: number[][]; asks: number[][]; } | null>(null);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [orderBookData, tradesData] = await Promise.all([
          serumService.getOrderBook(marketAddress),
          serumService.getRecentTrades(marketAddress)
        ]);

        if (!mounted) return;

        if (orderBookData) {
          setOrderBook(orderBookData);
        }

        if (tradesData) {
          setRecentTrades(tradesData);
        }

        const data = serumService.getMarketData(marketAddress);
        if (data) {
          setMarketData(data);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [marketAddress]);

  return {
    marketData,
    orderBook,
    recentTrades,
    isLoading,
    error
  };
}
