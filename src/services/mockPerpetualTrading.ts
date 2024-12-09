import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { Position, OrderParams, MarketState, TradeDirection } from '../perpetuals/types';
import { TradingRewardsCalculator } from '../utils/tradingRewards';
import { MockBalanceService } from './mockBalanceService';
import { binanceService } from './binance';

export class MockPerpetualTrading {
  private static instance: MockPerpetualTrading;
  private positions: Map<string, Position>;
  private mockPrice: BN;
  private mockFundingRate: BN;
  private rewardsCalculator: TradingRewardsCalculator;
  private balanceService: MockBalanceService;
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.positions = new Map();
    this.mockPrice = new BN(0);
    this.mockFundingRate = new BN(0.0001 * 1e6); // 0.01% funding rate
    this.rewardsCalculator = TradingRewardsCalculator.getInstance();
    this.balanceService = MockBalanceService.getInstance();
    this.initializePriceUpdates();
  }

  private async initializePriceUpdates() {
    // Get initial price
    const initialPrice = await binanceService.getCurrentPrice();
    this.mockPrice = new BN(Math.floor(initialPrice * 1e6)); // Convert to micro-units

    // Subscribe to price updates
    binanceService.subscribeToPriceUpdates('btcusdt', (price) => {
      this.mockPrice = new BN(Math.floor(price * 1e6)); // Convert to micro-units
    });
  }

  static getInstance(): MockPerpetualTrading {
    if (!MockPerpetualTrading.instance) {
      MockPerpetualTrading.instance = new MockPerpetualTrading();
    }
    return MockPerpetualTrading.instance;
  }

  async getBalance(user: PublicKey): Promise<BN> {
    return this.balanceService.getBalance(user);
  }

  async getMarketPrice(): Promise<BN> {
    return this.mockPrice;
  }

  async getFundingRate(): Promise<BN> {
    return this.mockFundingRate;
  }

  async openPosition(
    user: PublicKey,
    params: OrderParams
  ): Promise<{ positionId: string; mockxReward: number }> {
    const { size, leverage, direction, collateral } = params;
    const entryPrice = this.mockPrice;
    const positionSize = size.mul(new BN(leverage));
    const notionalValue = positionSize.mul(entryPrice).div(new BN(1e9));
    
    // Check if user has enough balance for collateral
    const userBalance = await this.balanceService.getBalance(user);
    if (userBalance.lt(collateral)) {
      throw new Error('Insufficient balance for collateral');
    }

    // Calculate fees based on leveraged position size
    const { tradingFee, solxReward } = this.rewardsCalculator.calculateLeveragedRewards({
      notionalValue: notionalValue.toNumber() / 1e9,
      leverage: leverage
    });

    // Deduct collateral from user's balance
    await this.balanceService.deductBalance(user, collateral);

    const positionId = Math.random().toString(36).substring(7);
    const position: Position = {
      id: positionId,
      owner: user,
      size: positionSize,
      collateral,
      entryPrice,
      leverage: new BN(leverage),
      direction,
      unrealizedPnl: new BN(0),
      liquidationPrice: this.calculateLiquidationPrice(entryPrice, leverage, direction),
      timestamp: new Date().getTime(),
    };

    this.positions.set(positionId, position);

    return {
      positionId,
      mockxReward: solxReward
    };
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
    const { solxReward, tradingFee } = this.rewardsCalculator.calculateLeveragedRewards({
      notionalValue: pnl.toNumber() / 1e9,
      leverage: position.leverage.toNumber(),
      isLong: position.direction === TradeDirection.Long,
      isPnL: true
    });

    // Return collateral and PnL to user's balance
    const returnAmount = position.collateral.add(pnl).sub(new BN(tradingFee * 1e6));
    await this.balanceService.updateBalance(position.owner, returnAmount);

    this.positions.delete(positionId);
    return { pnl, mockxReward: solxReward };
  }

  async getPositions(user: PublicKey): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(
      (position) => position.owner.equals(user)
    );
  }

  private calculateLiquidationPrice(price: BN, leverage: number, direction: TradeDirection): BN {
    const maintenanceMargin = 0.05; // 5%
    const multiplier = direction === TradeDirection.Long ? (1 - maintenanceMargin) : (1 + maintenanceMargin);
    return price.mul(new BN(Math.floor(multiplier * 1e9))).div(new BN(1e9));
  }
}
