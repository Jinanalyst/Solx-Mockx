import { useState, useEffect } from 'react';
import { fetchTokenPrices, calculatePairPrice, TokenPrice } from '@/services/priceService';
import { TRADING_PAIRS } from '@/config/trading';

export interface PairPrice {
  pair: string;
  price: number;
  basePrice: TokenPrice;
  quotePrice: TokenPrice;
  high24h: number;
  low24h: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
}

export function usePriceUpdates(updateInterval = 5000) {
  const [prices, setPrices] = useState<{ [key: string]: TokenPrice }>({});
  const [pairPrices, setPairPrices] = useState<{ [key: string]: PairPrice }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const updatePrices = async () => {
      try {
        const tokenPrices = await fetchTokenPrices();
        
        if (!mounted) return;

        setPrices(tokenPrices);

        // Calculate prices for all trading pairs
        const newPairPrices: { [key: string]: PairPrice } = {};

        TRADING_PAIRS.forEach(pair => {
          const [baseToken, quoteToken] = pair.name.split('/');
          const price = calculatePairPrice(tokenPrices, baseToken, quoteToken);

          if (price !== null && tokenPrices[baseToken] && tokenPrices[quoteToken]) {
            newPairPrices[pair.name] = {
              pair: pair.name,
              price,
              basePrice: tokenPrices[baseToken],
              quotePrice: tokenPrices[quoteToken],
              high24h: tokenPrices[baseToken].high24h / (quoteToken === 'USDC' ? 1 : tokenPrices[quoteToken].currentPrice),
              low24h: tokenPrices[baseToken].low24h / (quoteToken === 'USDC' ? 1 : tokenPrices[quoteToken].currentPrice),
              volume24h: tokenPrices[baseToken].totalVolume,
              priceChange24h: tokenPrices[baseToken].priceChange24h / (quoteToken === 'USDC' ? 1 : tokenPrices[quoteToken].currentPrice),
              priceChangePercentage24h: tokenPrices[baseToken].priceChangePercentage24h
            };
          }
        });

        setPairPrices(newPairPrices);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error('Failed to fetch prices'));
        setIsLoading(false);
      }
    };

    // Initial update
    updatePrices();

    // Set up interval for updates
    const interval = setInterval(updatePrices, updateInterval);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [updateInterval]);

  return {
    prices,
    pairPrices,
    isLoading,
    error
  };
}
