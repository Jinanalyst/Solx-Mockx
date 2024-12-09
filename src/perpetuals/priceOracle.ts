import { Connection, PublicKey } from '@solana/web3.js';
import { PythConnection, getPythProgramKeyForCluster } from '@pythnetwork/client';
import BN from 'bn.js';

export class PriceOracle {
  private static instance: PriceOracle;
  private pythConnection: PythConnection;
  
  private constructor(
    private connection: Connection,
    private pythProgramKey: PublicKey
  ) {
    this.pythConnection = new PythConnection(connection, pythProgramKey);
  }

  static getInstance(connection: Connection): PriceOracle {
    if (!PriceOracle.instance) {
      const pythProgramKey = getPythProgramKeyForCluster('mainnet-beta');
      PriceOracle.instance = new PriceOracle(connection, pythProgramKey);
    }
    return PriceOracle.instance;
  }

  async initialize(): Promise<void> {
    await this.pythConnection.start();
  }

  async getPrice(assetPair: string): Promise<BN> {
    try {
      const priceFeeds = await this.pythConnection.getPriceFeeds();
      const priceFeed = priceFeeds.find(feed => feed.symbol === assetPair);
      
      if (!priceFeed) {
        throw new Error(`Price feed not found for ${assetPair}`);
      }

      const price = priceFeed.getPrice();
      
      if (!price) {
        throw new Error(`No price available for ${assetPair}`);
      }

      // Convert to BN with appropriate decimals
      return new BN(Math.floor(price.price * 10 ** 6));
    } catch (error) {
      console.error('Failed to fetch price:', error);
      throw error;
    }
  }

  async getConfidence(assetPair: string): Promise<number> {
    try {
      const priceFeeds = await this.pythConnection.getPriceFeeds();
      const priceFeed = priceFeeds.find(feed => feed.symbol === assetPair);
      
      if (!priceFeed) {
        throw new Error(`Price feed not found for ${assetPair}`);
      }

      const price = priceFeed.getPrice();
      
      if (!price) {
        throw new Error(`No price available for ${assetPair}`);
      }

      return price.confidence;
    } catch (error) {
      console.error('Failed to fetch confidence:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    await this.pythConnection.stop();
  }
}
