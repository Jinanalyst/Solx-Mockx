import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { Position, OrderParams, MarketState, TradeDirection } from '../perpetuals/types';
import { TradingRewardsCalculator } from '../utils/tradingRewards';

export class MockPerpetualTrading {
  private static instance: MockPerpetualTrading;
  private positions: Map<string, Position>;
  private mockPrice: BN;
  private mockFundingRate: BN;
  private rewardsCalculator: TradingRewardsCalculator;

  private constructor() {
    this.positions = new Map();
    this.mockPrice = new BN(20 * 1e9); // $20 for SOL/USD
    this.mockFundingRate = new BN(0.0001 * 1e6); // 0.01% funding rate
    this.rewardsCalculator = TradingRewardsCalculator.getInstance();
  }

  static getInstance(): MockPerpetualTrading {
    if (!MockPerpetualTrading.instance) {
      MockPerpetualTrading.instance = new MockPerpetualTrading();
    }
    return MockPerpetualTrading.instance;
  }

  async openPosition(
    user: PublicKey,
    params: OrderParams
  ): Promise<{ positionId: string; mockxReward: number }> {
    const { size, leverage, direction, collateral } = params;
    const entryPrice = this.mockPrice;
    const positionSize = size.mul(new BN(leverage));
    const notionalValue = positionSize.mul(entryPrice).div(new BN(1e9));
    
    // Calculate fees based on leveraged position size
    const { tradingFee, solxReward } = this.rewardsCalculator.calculateLeveragedRewards({
      notionalValue: notionalValue.toNumber() / 1e9,
      leverage: Number(leverage),
      isLong: direction === TradeDirection.Long
    });

    const positionId = Math.random().toString(36).substring(7);
    const position: Position = {
      id: positionId,
      user,
      size: positionSize,
      entryPrice,
      leverage: Number(leverage),
      direction,
      collateral,
      liquidationPrice: this.calculateLiquidationPrice(entryPrice, leverage, direction),
      lastFundingTime: new BN(Date.now() / 1000),
      accumulatedFunding: new BN(0),
      unrealizedPnl: new BN(0),
      fee: new BN(tradingFee * 1e9)
    };

    this.positions.set(positionId, position);
    return { positionId, mockxReward: solxReward };
  }

  async closePosition(
    positionId: string
  ): Promise<{ pnl: BN; mockxReward: number }> {
    const position = this.positions.get(positionId);
    if (!position) throw new Error('Position not found');

    const exitPrice = this.mockPrice;
    const priceDiff = exitPrice.sub(position.entryPrice);
    const isProfit = (position.direction === TradeDirection.Long && priceDiff.gt(new BN(0))) ||
                    (position.direction === TradeDirection.Short && priceDiff.lt(new BN(0)));
    
    // Calculate PnL
    const pnl = position.size.mul(priceDiff.abs()).div(new BN(1e9));
    if (!isProfit) pnl.ineg();

    // Calculate rewards based on PnL and leverage
    const { solxReward } = this.rewardsCalculator.calculateLeveragedRewards({
      notionalValue: pnl.toNumber() / 1e9,
      leverage: position.leverage,
      isLong: position.direction === TradeDirection.Long,
      isPnL: true
    });

    this.positions.delete(positionId);
    return { pnl, mockxReward: solxReward };
  }

  private calculateLiquidationPrice(
    entryPrice: BN,
    leverage: number,
    direction: TradeDirection
  ): BN {
    const maintenanceMargin = 0.0625; // 6.25%
    const liquidationThreshold = 1 / leverage + maintenanceMargin;
    const multiplier = direction === TradeDirection.Long
      ? 1 - liquidationThreshold
      : 1 + liquidationThreshold;
    
    return entryPrice.mul(new BN(multiplier * 1e9)).div(new BN(1e9));
  }

  // Mock market data methods
  async getMarketPrice(): Promise<BN> {
    return this.mockPrice;
  }

  async getFundingRate(): Promise<BN> {
    return this.mockFundingRate;
  }

  async getPositions(user: PublicKey): Promise<Position[]> {
    return Array.from(this.positions.values())
      .filter(pos => pos.user.equals(user));
  }

  // For testing purposes
  setMockPrice(price: BN): void {
    this.mockPrice = price;
  }

  setMockFundingRate(rate: BN): void {
    this.mockFundingRate = rate;
  }
}
