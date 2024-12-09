import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

// Contract address for SOLX rewards
export const SOLX_REWARDS_CONTRACT = new PublicKey('2k42cRS5yBmgXGiEGwebC8Y5BQvWH4xr5UKP5TijysTP');

// Fixed trading fee in SOL
export const FIXED_TRADING_FEE = 0.0005;

// Minimum profit threshold for rewards in SOL
export const MIN_PROFIT_FOR_REWARD = 0.1;

// SOLX reward multiplier (1 SOL profit = 10 SOLX reward)
export const SOLX_REWARD_MULTIPLIER = 10;

export interface TradingFeeConfig {
  baseFee: number;           // Fixed fee per trade in SOL
  profitThreshold: number;   // Minimum profit required for rewards in SOL
  rewardRate: number;        // Base rate for SOLX rewards
  solxMultiplier: number;    // Multiplier for converting SOL profit to SOLX rewards
}

export const DEFAULT_FEE_CONFIG: TradingFeeConfig = {
  baseFee: FIXED_TRADING_FEE,
  profitThreshold: MIN_PROFIT_FOR_REWARD,
  rewardRate: 0.1,          // 10% of profit converted to SOLX
  solxMultiplier: SOLX_REWARD_MULTIPLIER
};

export interface RewardCalculation {
  tradingFee: number;       // Fixed trading fee in SOL
  profit: number;          // Total profit in SOL
  solxReward: number;      // Reward amount in SOLX tokens
  netProfit: number;       // Profit after fees in SOL
}

export interface LeveragedRewardParams {
  notionalValue: number;    // Total position value in SOL
  leverage: number;         // Position leverage
  isLong: boolean;         // Long or short position
  isPnL?: boolean;         // Whether calculating for PnL (true) or entry (false)
}

export class TradingRewardsCalculator {
  private static instance: TradingRewardsCalculator;
  private feeConfig: TradingFeeConfig;

  private constructor(config: TradingFeeConfig = DEFAULT_FEE_CONFIG) {
    this.feeConfig = config;
  }

  public static getInstance(config?: TradingFeeConfig): TradingRewardsCalculator {
    if (!TradingRewardsCalculator.instance) {
      TradingRewardsCalculator.instance = new TradingRewardsCalculator(config);
    }
    return TradingRewardsCalculator.instance;
  }

  /**
   * Calculate trading fees and potential SOLX rewards
   */
  public calculateFeesAndRewards(profitInSol: number): RewardCalculation {
    // Always charge the fixed trading fee
    const tradingFee = this.feeConfig.baseFee;

    // Calculate SOLX reward if profit exceeds threshold
    let solxReward = 0;
    if (profitInSol >= this.feeConfig.profitThreshold) {
      // Convert profit to SOLX reward
      solxReward = profitInSol * this.feeConfig.rewardRate * this.feeConfig.solxMultiplier;
    }

    // Calculate net profit in SOL (only fees deducted, SOLX is additional)
    const netProfit = profitInSol - tradingFee;

    return {
      tradingFee,
      profit: profitInSol,
      solxReward,
      netProfit
    };
  }

  /**
   * Convert SOL amount to lamports
   */
  public toSolLamports(amount: number): BN {
    return new BN(Math.floor(amount * 1e9));
  }

  /**
   * Format fee and reward details for display
   */
  public formatFeesAndRewards(calculation: RewardCalculation): string {
    return `Trading Fee: ${calculation.tradingFee} SOL\n` +
           `Profit: ${calculation.profit} SOL\n` +
           `SOLX Reward: ${calculation.solxReward} SOLX\n` +
           `Net Profit: ${calculation.netProfit} SOL`;
  }

  /**
   * Check if a trade qualifies for SOLX rewards
   */
  public isEligibleForReward(profitInSol: number): boolean {
    return profitInSol >= this.feeConfig.profitThreshold;
  }

  /**
   * Get the rewards contract address
   */
  public getRewardsContract(): PublicKey {
    return SOLX_REWARDS_CONTRACT;
  }

  /**
   * Calculate potential SOLX rewards for a given profit
   */
  public calculateSolxReward(profitInSol: number): number {
    if (profitInSol < this.feeConfig.profitThreshold) return 0;
    return profitInSol * this.feeConfig.rewardRate * this.feeConfig.solxMultiplier;
  }

  public calculateLeveragedRewards(params: LeveragedRewardParams): RewardCalculation {
    const { notionalValue, leverage, isLong, isPnL = false } = params;
    
    // Base fee is increased with leverage
    const leveragedFee = this.feeConfig.baseFee * Math.sqrt(leverage);
    
    // Calculate trading fee based on notional value
    const tradingFee = notionalValue * leveragedFee;
    
    let profit = 0;
    let solxReward = 0;
    
    if (isPnL && notionalValue > 0) {
      profit = notionalValue;
      
      // Only award MOCKX if profit exceeds threshold * leverage
      if (profit >= this.feeConfig.profitThreshold * leverage) {
        // Increased rewards for leveraged profitable trades
        const baseReward = profit * this.feeConfig.rewardRate;
        solxReward = baseReward * Math.sqrt(leverage) * this.feeConfig.solxMultiplier;
      }
    }
    
    const netProfit = profit - tradingFee;
    
    return {
      tradingFee,
      profit,
      solxReward,
      netProfit
    };
  }
}
