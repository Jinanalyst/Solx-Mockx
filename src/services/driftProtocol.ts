import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { DriftClient } from '@drift-labs/sdk';
import { UserAccount, PerpMarketAccount, StateAccount } from '@drift-labs/sdk';
import { DRIFT_PROGRAM_ID } from '../constants';

export class DriftProtocolService {
  private static instance: DriftProtocolService;
  private driftClient: DriftClient;
  
  private constructor(
    private connection: Connection,
    private authority: PublicKey
  ) {
    this.driftClient = new DriftClient({
      connection,
      wallet: {
        publicKey: authority,
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
      },
      programID: DRIFT_PROGRAM_ID,
      env: 'mainnet-beta',
    });
  }

  static getInstance(connection: Connection, authority: PublicKey): DriftProtocolService {
    if (!DriftProtocolService.instance) {
      DriftProtocolService.instance = new DriftProtocolService(connection, authority);
    }
    return DriftProtocolService.instance;
  }

  async initialize(): Promise<void> {
    await this.driftClient.subscribe();
  }

  async getFundingRate(marketIndex: number): Promise<{
    rate: BN;
    timestamp: BN;
  }> {
    const market = await this.driftClient.getPerpMarketAccount(marketIndex);
    return {
      rate: market.fundingRate,
      timestamp: market.lastFundingRateTs,
    };
  }

  async getMarketPrice(marketIndex: number): Promise<BN> {
    const market = await this.driftClient.getPerpMarketAccount(marketIndex);
    return market.amm.baseAssetReserve.div(market.amm.quoteAssetReserve);
  }

  async getUserPositions(userPublicKey: PublicKey): Promise<{
    marketIndex: number;
    baseAssetAmount: BN;
    quoteAssetAmount: BN;
    entryPrice: BN;
    leverage: number;
  }[]> {
    const userAccount = await this.driftClient.getUserAccount(userPublicKey);
    return userAccount.perpPositions.map(position => ({
      marketIndex: position.marketIndex,
      baseAssetAmount: position.baseAssetAmount,
      quoteAssetAmount: position.quoteAssetAmount,
      entryPrice: position.entryPrice,
      leverage: position.leverage,
    }));
  }

  async getMarketLiquidity(marketIndex: number): Promise<{
    baseReserve: BN;
    quoteReserve: BN;
    totalLongs: BN;
    totalShorts: BN;
  }> {
    const market = await this.driftClient.getPerpMarketAccount(marketIndex);
    return {
      baseReserve: market.amm.baseAssetReserve,
      quoteReserve: market.amm.quoteAssetReserve,
      totalLongs: market.amm.totalLongPositions,
      totalShorts: market.amm.totalShortPositions,
    };
  }

  async getMarketStats(marketIndex: number): Promise<{
    volume24h: BN;
    openInterest: BN;
    totalFees: BN;
    insuranceFund: BN;
  }> {
    const market = await this.driftClient.getPerpMarketAccount(marketIndex);
    const state = await this.driftClient.getStateAccount();
    
    return {
      volume24h: market.volume24h,
      openInterest: market.openInterest,
      totalFees: market.totalFees,
      insuranceFund: state.insuranceFund,
    };
  }

  async getOrderbook(marketIndex: number): Promise<{
    bids: { price: BN; size: BN }[];
    asks: { price: BN; size: BN }[];
  }> {
    const market = await this.driftClient.getPerpMarketAccount(marketIndex);
    const orderbook = await this.driftClient.getOrderBook(marketIndex);
    
    return {
      bids: orderbook.bids.map(bid => ({
        price: bid.price,
        size: bid.size,
      })),
      asks: orderbook.asks.map(ask => ({
        price: ask.price,
        size: ask.size,
      })),
    };
  }

  async getRecentTrades(marketIndex: number, limit: number = 100): Promise<{
    price: BN;
    size: BN;
    side: 'long' | 'short';
    timestamp: BN;
    fee: BN;
  }[]> {
    const trades = await this.driftClient.getTradeHistory({
      marketIndex,
      limit,
    });

    return trades.map(trade => ({
      price: trade.price,
      size: trade.baseAssetAmount,
      side: trade.taker.baseAssetAmount.gt(new BN(0)) ? 'long' : 'short',
      timestamp: trade.ts,
      fee: trade.takerFee,
    }));
  }

  async getRecentTrades(marketIndex: number): Promise<{
    price: BN;
    size: BN;
    side: 'long' | 'short';
    timestamp: BN;
  }[]> {
    const trades = await this.driftClient.getRecentTrades(marketIndex);
    return trades.map(trade => ({
      price: trade.price,
      size: trade.size,
      side: trade.side === 'buy' ? 'long' : 'short',
      timestamp: trade.timestamp,
    }));
  }

  async openPosition(
    marketIndex: number,
    size: BN,
    isLong: boolean,
    leverage: number,
    limitPrice?: BN
  ): Promise<string> {
    const tx = await this.driftClient.openPosition({
      marketIndex,
      baseAssetAmount: size,
      direction: isLong ? 'long' : 'short',
      leverage: new BN(leverage * 10000), // Convert to basis points
      price: limitPrice,
    });
    
    return tx.signature;
  }

  async closePosition(
    marketIndex: number,
    size: BN,
    limitPrice?: BN
  ): Promise<string> {
    const tx = await this.driftClient.closePosition({
      marketIndex,
      baseAssetAmount: size,
      price: limitPrice,
    });
    
    return tx.signature;
  }

  async updateLeverage(
    marketIndex: number,
    newLeverage: number
  ): Promise<string> {
    const tx = await this.driftClient.updateLeverage({
      marketIndex,
      leverage: new BN(newLeverage * 10000), // Convert to basis points
    });
    
    return tx.signature;
  }

  async addCollateral(
    marketIndex: number,
    amount: BN
  ): Promise<string> {
    const tx = await this.driftClient.addCollateral({
      marketIndex,
      amount,
    });
    
    return tx.signature;
  }

  async removeCollateral(
    marketIndex: number,
    amount: BN
  ): Promise<string> {
    const tx = await this.driftClient.removeCollateral({
      marketIndex,
      amount,
    });
    
    return tx.signature;
  }

  async calculatePnL(
    userPublicKey: PublicKey,
    marketIndex: number
  ): Promise<{
    unrealizedPnL: BN;
    realizedPnL: BN;
    fundingPnL: BN;
  }> {
    const userAccount = await this.driftClient.getUserAccount(userPublicKey);
    const position = userAccount.perpPositions.find(
      (p) => p.marketIndex === marketIndex
    );

    if (!position) {
      return {
        unrealizedPnL: new BN(0),
        realizedPnL: new BN(0),
        fundingPnL: new BN(0),
      };
    }

    return {
      unrealizedPnL: position.unrealizedPnl,
      realizedPnL: position.realizedPnl,
      fundingPnL: position.fundingPayment,
    };
  }

  stop(): void {
    this.driftClient.unsubscribe();
  }
}
