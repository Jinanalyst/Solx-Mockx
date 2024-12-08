import { Connection, PublicKey } from '@solana/web3.js';
import { TRADING_PAIRS, SUPPORTED_TOKENS } from '../config/trading';
import type { MarketData, OrderBook, Trade, Ticker, TradingPair } from '../types/trading';

class TradingService {
  private connection: Connection;
  private marketDataCache: Map<string, MarketData>;
  private orderBookCache: Map<string, OrderBook>;
  private recentTradesCache: Map<string, Trade[]>;

  constructor() {
    this.connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com');
    this.marketDataCache = new Map();
    this.orderBookCache = new Map();
    this.recentTradesCache = new Map();
  }

  // Get all available trading pairs
  async getTradingPairs(): Promise<TradingPair[]> {
    return TRADING_PAIRS.map(pair => ({
      ...pair,
      baseMint: pair.baseMint,
      quoteMint: pair.quoteMint
    }));
  }

  // Get market data for a specific pair
  async getMarketData(pairName: string): Promise<MarketData | null> {
    const pair = TRADING_PAIRS.find(p => p.name === pairName);
    if (!pair) return null;

    // In a real implementation, you would fetch this data from your backend
    // For now, we'll return mock data
    const mockData: MarketData = {
      pair: pairName,
      lastPrice: 100,
      high24h: 105,
      low24h: 95,
      volume24h: 1000000,
      change24h: 2.5,
      baseVolume24h: 10000,
      quoteVolume24h: 1000000,
      timestamp: Date.now(),
      popularity: pair.popularity || 0,
      fee: pair.fee || 0
    };

    this.marketDataCache.set(pairName, mockData);
    return mockData;
  }

  // Helper method to convert string address to PublicKey
  private toPublicKey(address: string): PublicKey {
    try {
      return new PublicKey(address);
    } catch (error) {
      console.error(`Invalid public key: ${address}`, error);
      throw error;
    }
  }

  // Helper method to get PublicKey for a trading pair
  private getPairPublicKeys(pair: TradingPair): { base: PublicKey, quote: PublicKey } {
    return {
      base: this.toPublicKey(pair.baseMint),
      quote: this.toPublicKey(pair.quoteMint)
    };
  }

  // Get order book for a specific pair
  async getOrderBook(pairName: string): Promise<OrderBook | null> {
    const pair = TRADING_PAIRS.find(p => p.name === pairName);
    if (!pair) return null;

    // Mock order book data
    const mockOrderBook: OrderBook = {
      pair: pairName,
      bids: [
        { price: 99.5, size: 100, total: 9950 },
        { price: 99.0, size: 200, total: 19800 },
        { price: 98.5, size: 300, total: 29550 },
      ],
      asks: [
        { price: 100.5, size: 150, total: 15075 },
        { price: 101.0, size: 250, total: 25250 },
        { price: 101.5, size: 350, total: 35525 },
      ],
      timestamp: Date.now(),
    };

    this.orderBookCache.set(pairName, mockOrderBook);
    return mockOrderBook;
  }

  // Get recent trades for a specific pair
  async getRecentTrades(pairName: string): Promise<Trade[]> {
    const pair = TRADING_PAIRS.find(p => p.name === pairName);
    if (!pair) return [];

    // Mock recent trades
    const mockTrades: Trade[] = [
      {
        pair: pairName,
        price: 100.2,
        size: 50,
        side: 'buy',
        timestamp: Date.now() - 1000,
      },
      {
        pair: pairName,
        price: 100.1,
        size: 30,
        side: 'sell',
        timestamp: Date.now() - 2000,
      },
    ];

    this.recentTradesCache.set(pairName, mockTrades);
    return mockTrades;
  }

  // Get ticker information for all pairs
  async getTickers(): Promise<Ticker[]> {
    return Promise.all(
      TRADING_PAIRS.map(async (pair) => {
        const marketData = await this.getMarketData(pair.name);
        return {
          pair: pair.name,
          bid: (marketData?.lastPrice || 0) - 0.1,
          ask: (marketData?.lastPrice || 0) + 0.1,
          lastPrice: marketData?.lastPrice || 0,
          volume24h: marketData?.volume24h || 0,
          high24h: marketData?.high24h || 0,
          low24h: marketData?.low24h || 0,
          change24h: marketData?.change24h || 0,
          timestamp: Date.now(),
        };
      })
    );
  }

  // Subscribe to market updates (WebSocket in real implementation)
  subscribeToMarketUpdates(pairName: string, callback: (data: MarketData) => void) {
    // In a real implementation, this would set up a WebSocket connection
    // For now, we'll just update the data every 5 seconds
    const interval = setInterval(async () => {
      const marketData = await this.getMarketData(pairName);
      if (marketData) {
        callback(marketData);
      }
    }, 5000);

    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  // Subscribe to order book updates (WebSocket in real implementation)
  subscribeToOrderBook(pairName: string, callback: (data: OrderBook) => void) {
    const interval = setInterval(async () => {
      const orderBook = await this.getOrderBook(pairName);
      if (orderBook) {
        callback(orderBook);
      }
    }, 1000);

    return () => clearInterval(interval);
  }
}

export const tradingService = new TradingService();
