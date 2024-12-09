import { SUPPORTED_TOKENS } from '@/config/trading';

// Map our token symbols to Coingecko IDs
const COINGECKO_ID_MAP: { [key: string]: string } = {
  SOL: 'solana',
  USDC: 'usd-coin',
  BONK: 'bonk',
  JUP: 'jupiter',
  ORCA: 'orca',
  MNGO: 'mango-markets',
};

export interface TokenPrice {
  symbol: string;
  currentPrice: number;
  high24h: number;
  low24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  totalVolume: number;
  lastUpdated: string;
}

export async function fetchTokenPrices(): Promise<{ [key: string]: TokenPrice }> {
  try {
    // Get all token IDs we want to fetch
    const ids = Object.values(COINGECKO_ID_MAP).join(',');
    
    // Fetch data from Coingecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices from Coingecko');
    }

    const data = await response.json();
    
    // Process the response into our format
    const prices: { [key: string]: TokenPrice } = {};
    
    // Reverse map to get our symbol from Coingecko ID
    const reverseIdMap = Object.entries(COINGECKO_ID_MAP).reduce((acc, [symbol, id]) => {
      acc[id] = symbol;
      return acc;
    }, {} as { [key: string]: string });

    data.forEach((coin: any) => {
      const symbol = reverseIdMap[coin.id];
      if (symbol) {
        prices[symbol] = {
          symbol,
          currentPrice: coin.current_price,
          high24h: coin.high_24h,
          low24h: coin.low_24h,
          priceChange24h: coin.price_change_24h,
          priceChangePercentage24h: coin.price_change_percentage_24h,
          marketCap: coin.market_cap,
          totalVolume: coin.total_volume,
          lastUpdated: coin.last_updated,
        };
      }
    });

    return prices;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return {};
  }
}

// Calculate the price for a trading pair
export function calculatePairPrice(
  prices: { [key: string]: TokenPrice },
  baseCurrency: string,
  quoteCurrency: string
): number | null {
  const basePrice = prices[baseCurrency]?.currentPrice;
  const quotePrice = prices[quoteCurrency]?.currentPrice;

  if (basePrice === undefined || quotePrice === undefined) {
    return null;
  }

  // If quote is USDC or USDT, just return base price
  if (quoteCurrency === 'USDC' || quoteCurrency === 'USDT') {
    return basePrice;
  }

  return basePrice / quotePrice;
}

// Format price with appropriate decimals
export function formatPrice(price: number): string {
  if (price >= 1) {
    return price.toFixed(2);
  } else if (price >= 0.0001) {
    return price.toFixed(4);
  } else {
    return price.toFixed(8);
  }
}

// Get price from API for a specific token
export async function getPriceFromAPI(symbol: string): Promise<number> {
  try {
    const prices = await fetchTokenPrices();
    return prices[symbol]?.currentPrice || 0;
  } catch (error) {
    console.error(`Error getting price for ${symbol}:`, error);
    return 0;
  }
}
