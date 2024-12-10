import { CoinInfo, MarketPair, TokenPrice } from '@/types/market';
import axios, { AxiosError } from 'axios';
import { mockMarketData } from '@/mocks/marketData';
import { logger } from './loggingService';
import { PublicKey } from '@solana/web3.js';

export class MarketDataService {
  private static instance: MarketDataService;
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private supportedVsCurrencies = ['usd', 'btc', 'eth'];
  private updateInterval = 30000; // 30 seconds
  private retryDelay = 5000; // 5 seconds
  private maxRetries = 3;
  private useMockData = false;
  private rateLimitResetTime: number | null = null;

  private marketData: Map<string, CoinInfo> = new Map();
  private marketPairs: Map<string, MarketPair[]> = new Map();
  private tokenPrices: Map<string, TokenPrice> = new Map();
  private lastUpdate: number = 0;
  private subscribers: Set<() => void> = new Set();
  private updateTimeout: NodeJS.Timeout | null = null;
  private cachedResponses: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

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
    options: { retries?: number; delay?: number; useCache?: boolean } = {}
  ): Promise<T> {
    const { retries = this.maxRetries, delay = this.retryDelay, useCache = true } = options;
    let lastError: Error | null = null;

    // Check cache first if enabled
    if (useCache) {
      const cached = this.cachedResponses.get(url);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        logger.debug('Using cached response', { url });
        return cached.data as T;
      }
    }

    // Check rate limit
    if (this.rateLimitResetTime && Date.now() < this.rateLimitResetTime) {
      logger.warn('Rate limit in effect, using mock data', {
        resetTime: new Date(this.rateLimitResetTime).toISOString(),
      });
      return this.getMockData() as T;
    }

    for (let i = 0; i < retries; i++) {
      try {
        logger.debug(`API request attempt ${i + 1}/${retries}`, { url });
        const response = await axios.get<T>(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SolX DEX/1.0.0',
          },
          timeout: 10000, // 10 seconds
        });

        // Cache the successful response
        if (useCache) {
          this.cachedResponses.set(url, {
            data: response.data,
            timestamp: Date.now(),
          });
        }

        // Reset mock data flag and rate limit on successful API call
        this.useMockData = false;
        this.rateLimitResetTime = null;
        
        logger.info('API request successful', {
          url,
          status: response.status,
          dataSize: JSON.stringify(response.data).length,
        });

        return response.data;
      } catch (error) {
        lastError = error as Error;
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 429) {
          const resetTime = axiosError.response.headers['x-ratelimit-reset'];
          this.rateLimitResetTime = resetTime 
            ? parseInt(resetTime) * 1000 
            : Date.now() + 60000; // Default to 1 minute if no reset time provided

          logger.warn('Rate limit hit, switching to mock data', {
            resetTime: new Date(this.rateLimitResetTime).toISOString(),
          });
          this.useMockData = true;
          return this.getMockData() as T;
        }

        logger.error(`API request failed (attempt ${i + 1}/${retries})`, {
          url,
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
        }, error);

        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (this.useMockData) {
      logger.info('Falling back to mock data after all retries failed');
      return this.getMockData() as T;
    }

    throw lastError || new Error('Failed to fetch data');
  }

  private getMockData(): CoinInfo[] {
    logger.debug('Using mock market data');
    return Object.values(mockMarketData);
  }

  private async updateMarketData() {
    try {
      const now = Date.now();
      if (now - this.lastUpdate < this.updateInterval) {
        return;
      }

      logger.info('Updating market data');
      const data = await this.fetchWithRetry<CoinInfo[]>(
        `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false`
      );

      this.marketData.clear();
      data.forEach(coin => {
        this.marketData.set(coin.id, coin);
      });

      this.lastUpdate = now;
      this.notifySubscribers();
      logger.info('Market data updated successfully', {
        coinsCount: data.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to update market data', {
        lastUpdateTime: new Date(this.lastUpdate).toISOString(),
      }, error as Error);

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
      logger.debug('Fetching token price', { tokenId });

      if (this.useMockData) {
        const mockPrice = (mockMarketData as any)[tokenId];
        return mockPrice ? { usd: mockPrice.usd } : null;
      }

      const data = await this.fetchWithRetry<any>(
        `${this.baseUrl}/simple/price?ids=${tokenId}&vs_currencies=usd`
      );

      const price = data[tokenId];
      if (price) {
        logger.info('Token price fetched successfully', {
          tokenId,
          price: price.usd,
        });
      } else {
        logger.warn('Token price not found', { tokenId });
      }

      return price || null;
    } catch (error) {
      logger.error('Failed to get token price', { tokenId }, error as Error);
      return null;
    }
  }

  public async searchCoins(query: string): Promise<CoinInfo[]> {
    try {
      logger.debug('Searching coins', { query });

      if (this.useMockData) {
        const results = Object.entries(mockMarketData)
          .filter(([id]) => id.includes(query.toLowerCase()))
          .map(([id, data]) => ({
            id,
            symbol: id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            current_price: data.usd,
            price_change_24h: data.usd_24h_change,
            market_cap: data.market_cap,
          } as CoinInfo));

        logger.info('Coin search completed (mock)', {
          query,
          resultsCount: results.length,
        });

        return results;
      }

      const data = await this.fetchWithRetry<any>(
        `${this.baseUrl}/search?query=${query}`
      );

      logger.info('Coin search completed', {
        query,
        resultsCount: data.coins?.length || 0,
      });

      return data.coins || [];
    } catch (error) {
      logger.error('Failed to search coins', { query }, error as Error);
      return [];
    }
  }

  public async getTokenBalance(tokenId: string, walletAddress: PublicKey): Promise<number> {
    try {
      logger.debug('Fetching token balance', { tokenId, walletAddress: walletAddress.toString() });

      // For mock implementation, return a random balance between 0 and 100
      if (this.useMockData) {
        const mockBalance = Math.random() * 100;
        logger.info('Using mock token balance', {
          tokenId,
          walletAddress: walletAddress.toString(),
          balance: mockBalance,
        });
        return mockBalance;
      }

      // TODO: Implement actual token balance fetching using Solana web3.js
      // This would involve:
      // 1. Getting the token mint address for the given tokenId
      // 2. Finding the associated token account for the wallet
      // 3. Fetching the token account balance
      const mockBalance = Math.random() * 100;
      
      logger.info('Token balance fetched successfully', {
        tokenId,
        walletAddress: walletAddress.toString(),
        balance: mockBalance,
      });

      return mockBalance;
    } catch (error) {
      logger.error('Failed to get token balance', 
        { tokenId, walletAddress: walletAddress.toString() }, 
        error as Error
      );
      return 0;
    }
  }

  public getTopMarketPairs(limit: number = 10): MarketPair[] {
    const allPairs = Array.from(this.marketPairs.values()).flat();
    return allPairs
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  }

  public async getHistoricalPrices(coinId: string, days: number = 7): Promise<any> {
    try {
      logger.debug('Fetching historical prices', { coinId, days });

      if (this.useMockData) {
        const mockHistoricalData = this.generateMockHistoricalData(days);
        logger.info('Using mock historical data', {
          coinId,
          days,
          dataPoints: mockHistoricalData.length,
        });
        return mockHistoricalData;
      }

      const data = await this.fetchWithRetry<any>(
        `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
      );

      logger.info('Historical prices fetched successfully', {
        coinId,
        days,
        dataPoints: data.prices?.length || 0,
      });

      return data;
    } catch (error) {
      logger.error('Failed to fetch historical prices', { coinId, days }, error as Error);
      return this.generateMockHistoricalData(days);
    }
  }

  private generateMockHistoricalData(days: number) {
    const mockData = [];
    const now = Date.now();
    const interval = (days * 24 * 60 * 60 * 1000) / 100; // 100 data points
    const basePrice = 100;
    
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (99 - i) * interval;
      const randomChange = (Math.random() - 0.5) * 5;
      const price = basePrice + randomChange;
      mockData.push([timestamp, price]);
    }

    return {
      prices: mockData,
      market_caps: mockData.map(([time, price]) => [time, price * 1000000]),
      total_volumes: mockData.map(([time, price]) => [time, price * 100000]),
    };
  }
}
