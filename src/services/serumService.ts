import { Connection, PublicKey } from '@solana/web3.js';
import { Market } from '@project-serum/serum';
import { TokenInfo } from '@solana/spl-token-registry';

export interface SerumMarketInfo {
  address: string;
  name: string;
  programId: string;
  baseMint: string;
  quoteMint: string;
  baseVault: string;
  quoteVault: string;
  bidsAddress: string;
  asksAddress: string;
  eventQueue: string;
}

export interface MarketData {
  marketAddress: string;
  baseSymbol: string;
  quoteSymbol: string;
  price: number;
  size: number;
  volume24h: number;
  change24h: number;
  bestBid: number;
  bestAsk: number;
}

class SerumService {
  private static instance: SerumService;
  private connection: Connection;
  private markets: Map<string, Market> = new Map();
  private marketData: Map<string, MarketData> = new Map();
  private updateInterval = 1000; // 1 second

  private constructor() {
    this.connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com');
    this.startPolling();
  }

  public static getInstance(): SerumService {
    if (!SerumService.instance) {
      SerumService.instance = new SerumService();
    }
    return SerumService.instance;
  }

  private async loadMarket(marketAddress: string, programId: string): Promise<Market | null> {
    try {
      const market = await Market.load(
        this.connection,
        new PublicKey(marketAddress),
        {},
        new PublicKey(programId)
      );
      this.markets.set(marketAddress, market);
      return market;
    } catch (error) {
      console.error(`Error loading market ${marketAddress}:`, error);
      return null;
    }
  }

  public async getMarketPrice(marketAddress: string): Promise<number | null> {
    try {
      const market = this.markets.get(marketAddress) || 
                    await this.loadMarket(marketAddress, 'SERUM_DEX_PROGRAM_ID');
      if (!market) return null;

      const bids = await market.loadBids(this.connection);
      const asks = await market.loadAsks(this.connection);
      
      const bestBid = bids.getBestPrice();
      const bestAsk = asks.getBestPrice();
      
      if (!bestBid || !bestAsk) return null;
      
      return (bestBid + bestAsk) / 2;
    } catch (error) {
      console.error(`Error getting market price for ${marketAddress}:`, error);
      return null;
    }
  }

  public async getOrderBook(marketAddress: string) {
    try {
      const market = this.markets.get(marketAddress) || 
                    await this.loadMarket(marketAddress, 'SERUM_DEX_PROGRAM_ID');
      if (!market) return null;

      const bids = await market.loadBids(this.connection);
      const asks = await market.loadAsks(this.connection);

      return {
        bids: bids.getL2(20),
        asks: asks.getL2(20)
      };
    } catch (error) {
      console.error(`Error getting order book for ${marketAddress}:`, error);
      return null;
    }
  }

  public async getRecentTrades(marketAddress: string, limit: number = 100) {
    try {
      const market = this.markets.get(marketAddress) || 
                    await this.loadMarket(marketAddress, 'SERUM_DEX_PROGRAM_ID');
      if (!market) return null;

      const fills = await market.loadFills(this.connection, limit);
      return fills;
    } catch (error) {
      console.error(`Error getting recent trades for ${marketAddress}:`, error);
      return null;
    }
  }

  private startPolling() {
    setInterval(async () => {
      for (const [marketAddress, market] of this.markets) {
        try {
          const [bids, asks] = await Promise.all([
            market.loadBids(this.connection),
            market.loadAsks(this.connection)
          ]);

          const bestBid = bids.getBestPrice();
          const bestAsk = asks.getBestPrice();

          if (bestBid && bestAsk) {
            const currentPrice = (bestBid + bestAsk) / 2;
            const previousData = this.marketData.get(marketAddress);
            
            if (previousData) {
              const change24h = ((currentPrice - previousData.price) / previousData.price) * 100;
              
              this.marketData.set(marketAddress, {
                ...previousData,
                price: currentPrice,
                bestBid,
                bestAsk,
                change24h
              });
            }
          }
        } catch (error) {
          console.error(`Error updating market data for ${marketAddress}:`, error);
        }
      }
    }, this.updateInterval);
  }

  public getMarketData(marketAddress: string): MarketData | null {
    return this.marketData.get(marketAddress) || null;
  }

  public getAllMarketData(): MarketData[] {
    return Array.from(this.marketData.values());
  }
}

export const serumService = SerumService.getInstance();
