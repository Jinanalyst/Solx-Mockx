import { CoinInfo, MarketPair, TokenPrice } from '@/types/market';
import axios, { AxiosError } from 'axios';
import { mockMarketData } from '@/mocks/marketData';

export class MarketDataService {
  private static instance: MarketDataService;
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private supportedVsCurrencies = ['usd', 'btc', 'eth'];
  private updateInterval = 30000; // 30 seconds
  private retryDelay = 5000; // 5 seconds
  private maxRetries = 3;
  private useMockData = false;

  private marketData: Map<string, CoinInfo> = new Map();
  private marketPairs: Map<string, MarketPair[]> = new Map();
  private tokenPrices: Map<string, TokenPrice> = new Map();
  private lastUpdate: number = 0;
  private subscribers: Set<() => void> = new Set();
  private updateTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.startPolling();
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private async fetchWithRetry<T>(
    url: string,
    options: { retries?: number; delay?: number } = {}
  ): Promise<T> {
    const { retries = this.maxRetries, delay = this.retryDelay } = options;
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.get<T>(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SolX DEX/1.0.0',
          },
          timeout: 10000, // 10 seconds
        });

        // Reset mock data flag on successful API call
        this.useMockData = false;
        return response.data;
      } catch (error) {
        lastError = error as Error;
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 429) {
          console.warn('Rate limit hit, switching to mock data');
          this.useMockData = true;
          return this.getMockData() as T;
        }

        console.warn(`Attempt ${i + 1}/${retries} failed:`, error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (this.useMockData) {
      return this.getMockData() as T;
    }

    throw lastError || new Error('Failed to fetch data');
  }

  private getMockData(): CoinInfo[] {
    return Object.values(mockMarketData);
  }

  private async updateMarketData() {
    try {
      const now = Date.now();
      if (now - this.lastUpdate < this.updateInterval) {
        return;
      }

      const data = await this.fetchWithRetry<CoinInfo[]>(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false`
      );

      this.marketData.clear();
      data.forEach(coin => {
        this.marketData.set(coin.id, coin);
      });

      this.lastUpdate = now;
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to update market data:', error);
      if (!this.useMockData) {
        this.useMockData = true;
        const mockData = this.getMockData();
        mockData.forEach(coin => {
          this.marketData.set(coin.id, coin);
        });
        this.notifySubscribers();
      }
    }
  }

  private startPolling() {
    const poll = async () => {
      await this.updateMarketData();
      this.updateTimeout = setTimeout(poll, this.updateInterval);
    };

    poll();
  }

  public getAllMarketData(): CoinInfo[] {
    return Array.from(this.marketData.values());
  }

  public getAllMarketPairs(): Record<string, MarketPair[]> {
    const pairs: Record<string, MarketPair[]> = {};
    this.marketPairs.forEach((value, key) => {
      pairs[key] = value;
    });
    return pairs;
  }

  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  public async getTokenPrice(tokenId: string): Promise<TokenPrice | null> {
    try {
      if (this.useMockData) {
        const mockPrice = (mockMarketData as any)[tokenId];
        return mockPrice ? { usd: mockPrice.usd } : null;
      }

      const data = await this.fetchWithRetry<any>(
        `${this.baseUrl}/simple/price?ids=${tokenId}&vs_currencies=usd`
      );
      return data[tokenId] || null;
    } catch (error) {
      console.error('Failed to get token price:', error);
      return null;
    }
  }

  public async searchCoins(query: string): Promise<CoinInfo[]> {
    if (this.useMockData) {
      return Object.entries(mockMarketData)
        .filter(([id]) => id.includes(query.toLowerCase()))
        .map(([id, data]) => ({
          id,
          symbol: id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          current_price: data.usd,
          price_change_24h: data.usd_24h_change,
          market_cap: data.market_cap,
        } as CoinInfo));
    }

    try {
      const data = await this.fetchWithRetry<any>(
        `${this.baseUrl}/search?query=${query}`
      );
      return data.coins || [];
    } catch (error) {
      console.error('Failed to search coins:', error);
      return [];
    }
  }

  public getTopMarketPairs(limit: number = 10): MarketPair[] {
    const allPairs = Array.from(this.marketPairs.values()).flat();
    return allPairs
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, limit);
  }

  public async getHistoricalPrices(coinId: string, days: number = 7): Promise<any> {
    try {
      if (this.useMockData) {
        // Return mock historical data
        const mockHistoricalData = [];
        const now = Date.now();
        const interval = (days * 24 * 60 * 60 * 1000) / 100; // 100 data points
        
        for (let i = 0; i < 100; i++) {
          const timestamp = now - (99 - i) * interval;
          const price = mockMarketData[coinId]?.current_price * (0.9 + Math.random() * 0.2);
          if (price) {
            mockHistoricalData.push([timestamp, price]);
          }
        }
        
        return mockHistoricalData;
      }

      const data = await this.fetchWithRetry<any>(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );

      return data.prices;
    } catch (error) {
      console.error('Failed to get historical prices:', error);
      return null;
    }
  }
}
