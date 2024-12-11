import { Connection, PublicKey } from '@solana/web3.js';
import { mockMarketData } from '@/mocks/marketData';
import { CoinInfo, TokenPrice } from '@/types/market';
import { MOCK_MODE } from '@/utils/constants';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface MarketDataServiceOptions {
  rpcEndpoint?: string;
  cacheTimeout?: number;
}

class MarketDataService {
  private static instance: MarketDataService;
  private connection: Connection;
  private cache: Map<string, CacheEntry<TokenPrice | CoinInfo>>;
  private cacheTimeout: number;

  private constructor(options: MarketDataServiceOptions = {}) {
    this.connection = new Connection(options.rpcEndpoint || process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com');
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 60000; // 1 minute cache timeout
  }

  public static getInstance(options: MarketDataServiceOptions = {}): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService(options);
    }
    return MarketDataService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    return cached ? cached.data as T : null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public async getTokenPrice(tokenId: string): Promise<TokenPrice | null> {
    try {
      if (MOCK_MODE) {
        const mockData = mockMarketData.find(coin => coin.id === tokenId.toLowerCase());
        if (!mockData) return null;
        
        return {
          usd: mockData.current_price,
          last_updated_at: new Date(mockData.last_updated).getTime() / 1000
        };
      }

      const cacheKey = `price_${tokenId}`;
      if (this.isCacheValid(cacheKey)) {
        return this.getCachedData<TokenPrice>(cacheKey);
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_last_updated_at=true`
      );

      if (!response.ok) {
        console.error(`Failed to fetch price for ${tokenId}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      if (!data[tokenId]) {
        console.error(`No price data found for ${tokenId}`);
        return null;
      }

      const price: TokenPrice = {
        usd: data[tokenId].usd,
        last_updated_at: data[tokenId].last_updated_at
      };

      this.setCachedData(cacheKey, price);
      return price;
    } catch (error) {
      console.error(`Error fetching token price for ${tokenId}:`, error);
      return null;
    }
  }

  public async getTokenInfo(tokenId: string): Promise<CoinInfo | null> {
    try {
      if (MOCK_MODE) {
        const mockData = mockMarketData.find(coin => coin.id === tokenId.toLowerCase());
        return mockData || null;
      }

      const cacheKey = `info_${tokenId}`;
      if (this.isCacheValid(cacheKey)) {
        return this.getCachedData<CoinInfo>(cacheKey);
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      );

      if (!response.ok) {
        console.error(`Failed to fetch token info for ${tokenId}: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      
      const tokenInfo: CoinInfo = {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        image: data.image.large,
        current_price: data.market_data.current_price.usd,
        market_cap: data.market_data.market_cap.usd,
        market_cap_rank: data.market_cap_rank,
        fully_diluted_valuation: data.market_data.fully_diluted_valuation?.usd || data.market_data.market_cap.usd,
        total_volume: data.market_data.total_volume.usd,
        high_24h: data.market_data.high_24h.usd,
        low_24h: data.market_data.low_24h.usd,
        price_change_24h: data.market_data.price_change_24h,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h,
        market_cap_change_24h: data.market_data.market_cap_change_24h,
        market_cap_change_percentage_24h: data.market_data.market_cap_change_percentage_24h,
        circulating_supply: data.market_data.circulating_supply,
        total_supply: data.market_data.total_supply,
        max_supply: data.market_data.max_supply,
        last_updated: data.last_updated
      };

      this.setCachedData(cacheKey, tokenInfo);
      return tokenInfo;
    } catch (error) {
      console.error(`Error fetching token info for ${tokenId}:`, error);
      return null;
    }
  }
}

export default MarketDataService;
