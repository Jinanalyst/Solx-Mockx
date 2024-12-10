'use client';

import { CoinInfo, MarketPair, TokenPrice } from '@/types/market';
import axios, { AxiosError } from 'axios';
import { mockMarketData } from '@/mocks/marketData';
import { logger } from './loggingService';
import { PublicKey } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { MOCK_MODE } from '@/utils/constants';

interface CoinGeckoResponse {
  [key: string]: {
    usd?: number;
    btc?: number;
    eth?: number;
  };
}

export class MarketDataService {
  private static instance: MarketDataService;
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private supportedVsCurrencies = ['usd', 'btc', 'eth'];
  private updateInterval = 30000; // 30 seconds
  private retryDelay = 5000; // 5 seconds
  private maxRetries = 3;
  private useMockData = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
  private rateLimitResetTime: number | null = null;
  private connection: Connection;

  private marketData: Map<string, CoinInfo> = new Map();
  private marketPairs: Map<string, MarketPair[]> = new Map();
  private tokenPrices: Map<string, TokenPrice> = new Map();
  private lastUpdate: number = 0;
  private subscribers: Set<() => void> = new Set();
  private updateTimeout: NodeJS.Timeout | null = null;
  private cachedResponses: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
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
      return this.getMockData(url) as T;
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

        // Reset rate limit on successful API call
        if (!this.useMockData) {
          this.rateLimitResetTime = null;
        }
        
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
          return this.getMockData(url) as T;
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
      return this.getMockData(url) as T;
    }

    throw lastError || new Error('Failed to fetch data');
  }

  private getMockData(url: string): any {
    logger.debug('Using mock market data', { url });
    
    if (url.includes('/coins/markets')) {
      return mockMarketData;
    }
    
    if (url.includes('/simple/price')) {
      const tokenId = url.split('ids=')[1]?.split('&')[0];
      const mockCoin = mockMarketData.find(coin => coin.id === tokenId);
      if (!mockCoin) return {};
      
      return {
        [tokenId]: {
          usd: mockCoin.current_price,
          btc: mockCoin.current_price / 40000,
          eth: mockCoin.current_price / 2000,
        }
      };
    }
    
    if (url.includes('/search')) {
      const query = url.split('query=')[1];
      if (!query) return { coins: [] };
      
      return {
        coins: mockMarketData.filter(coin => 
          coin.name.toLowerCase().includes(query.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(query.toLowerCase())
        )
      };
    }
    
    if (url.includes('/market_chart')) {
      const now = Date.now();
      return {
        prices: Array.from({ length: 100 }, (_, i) => [
          now - (100 - i) * 86400000,
          Math.random() * 1000 + 30000
        ])
      };
    }
    
    return [];
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

      if (!this.marketData.size) {
        const mockData = this.getMockData(`${this.baseUrl}/coins/markets`);
        mockData.forEach((coin: CoinInfo) => {
          this.marketData.set(coin.id, coin);
        });
        this.notifySubscribers();
      }
    }
  }

  private startPolling() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    const poll = async () => {
      await this.updateMarketData();
      this.updateTimeout = setTimeout(poll, this.updateInterval);
    };

    poll().catch(error => {
      logger.error('Error in polling market data', error);
    });
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
      if (MOCK_MODE) {
        const mockData = mockMarketData.find(coin => coin.id === tokenId.toLowerCase());
        if (!mockData) return null;
        
        return {
          usd: mockData.current_price,
          last_updated_at: new Date(mockData.last_updated).getTime() / 1000
        };
      }

      const url = `${this.baseUrl}/simple/price?ids=${tokenId}&vs_currencies=${this.supportedVsCurrencies.join(',')}`;
      const response = await this.fetchWithRetry<CoinGeckoResponse>(url);
      
      if (!response[tokenId]) {
        logger.warn('Token price not found', { tokenId });
        return null;
      }

      const prices = response[tokenId];
      return {
        usd: prices.usd || 0,
        btc: prices.btc,
        eth: prices.eth,
        last_updated_at: Date.now(),
      };
    } catch (error) {
      logger.error('Failed to fetch token price', { error, tokenId });
      throw error;
    }
  }

  public async getTokenInfo(tokenId: string): Promise<CoinInfo | null> {
    try {
      if (MOCK_MODE) {
        const mockData = mockMarketData.find(coin => coin.id === tokenId.toLowerCase());
        return mockData || null;
      }

      const url = `${this.baseUrl}/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
      const response = await this.fetchWithRetry<CoinInfo>(url);
      
      if (!response) {
        logger.warn('Token info not found', { tokenId });
        return null;
      }

      return response;
    } catch (error) {
      logger.error('Failed to fetch token info', { error, tokenId });
      throw error;
    }
  }

  public async getTokenBalance(tokenId: string, walletAddress: PublicKey): Promise<number> {
    try {
      if (MOCK_MODE) {
        // Return mock balance based on token
        const mockBalances: { [key: string]: number } = {
          'So11111111111111111111111111111111111111112': 10, // SOL
          '2k42cRS5yBmgXGiEGwebC8Y5BQvWH4xr5UKP5TijysTP': 1000, // SOLX
          'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1000, // USDC
        };
        return mockBalances[tokenId] || 0;
      }

      // Get token mint address for the given token
      const tokenMint = new PublicKey(tokenId); // This needs to be updated with actual token mint mapping
      
      try {
        // Get associated token account
        const tokenAccount = await getAssociatedTokenAddress(tokenMint, walletAddress);
        const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
        return accountInfo.value.uiAmount || 0;
      } catch (error) {
        logger.warn('Token account not found, assuming zero balance', { 
          tokenId, 
          walletAddress: walletAddress.toBase58(),
          error: error instanceof Error ? error.message : String(error)
        });
        return 0;
      }
    } catch (error) {
      logger.error('Failed to fetch token balance', { 
        error: error instanceof Error ? error.message : String(error), 
        tokenId, 
        walletAddress: walletAddress.toBase58() 
      });
      throw error;
    }
  }

  public async getSolBalance(walletAddress: string): Promise<number> {
    try {
      if (MOCK_MODE) {
        return 10; // Mock SOL balance
      }

      const wallet = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(wallet);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      logger.error(`Error fetching SOL balance for ${walletAddress}:`, error);
      return 0;
    }
  }

  public async searchCoins(query: string): Promise<CoinInfo[]> {
    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}`;
      const response = await this.fetchWithRetry<{ coins: CoinInfo[] }>(url);
      return response.coins || [];
    } catch (error) {
      logger.error('Failed to search coins', { error, query });
      throw error;
    }
  }

  public async getHistoricalPrices(coinId: string, days: number = 1): Promise<any> {
    try {
      const url = `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
      return await this.fetchWithRetry(url);
    } catch (error) {
      logger.error('Failed to fetch historical prices', { error, coinId, days });
      throw error;
    }
  }

  public getTopMarketPairs(limit: number = 10): MarketPair[] {
    try {
      const allPairs = Array.from(this.marketPairs.values()).flat();
      return allPairs
        .sort((a, b) => b.volume - a.volume)
        .slice(0, limit);
    } catch (error) {
      logger.error('Failed to get top market pairs', { error, limit });
      return [];
    }
  }

  public cleanup() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    this.subscribers.clear();
    this.cachedResponses.clear();
  }
}
