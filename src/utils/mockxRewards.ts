import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

// Contract address for MOCKX rewards
export const MOCKX_REWARDS_CONTRACT = new PublicKey('Hr3p3tS5e3SaRLW9pJrnPHYmfx9po18c1crwd1ZNSyYE');

// Fixed trading fee in SOL
export const FIXED_TRADING_FEE = 0.0005;

// Minimum profit threshold for rewards in SOL
export const MIN_PROFIT_FOR_REWARD = 0.1;

// MOCKX reward multiplier (1 SOL profit = 15 MOCKX reward)
export const MOCKX_REWARD_MULTIPLIER = 15;

// LP reward multiplier (additional reward for liquidity providers)
export const LP_REWARD_MULTIPLIER = 1.5;

export interface MockxFeeConfig {
  baseFee: number;           // Fixed fee per trade in SOL
  profitThreshold: number;   // Minimum profit required for rewards in SOL
  rewardRate: number;        // Base rate for MOCKX rewards
  mockxMultiplier: number;   // Multiplier for converting SOL profit to MOCKX rewards
  lpMultiplier: number;      // Additional multiplier for LP rewards
}

export const DEFAULT_MOCKX_CONFIG: MockxFeeConfig = {
  baseFee: FIXED_TRADING_FEE,
  profitThreshold: MIN_PROFIT_FOR_REWARD,
  rewardRate: 0.1,           // 10% of profit converted to MOCKX
  mockxMultiplier: MOCKX_REWARD_MULTIPLIER,
  lpMultiplier: LP_REWARD_MULTIPLIER
};

export interface MockxRewardCalculation {
  tradingFee: number;       // Fixed trading fee in SOL
  profit: number;          // Total profit in SOL
  mockxReward: number;     // Base reward amount in MOCKX tokens
  lpReward: number;        // Additional LP reward in MOCKX tokens
  totalReward: number;     // Total MOCKX rewards (base + LP)
  netProfit: number;       // Profit after fees in SOL
}

export class MockxRewardsCalculator {
  private static instance: MockxRewardsCalculator;
  private feeConfig: MockxFeeConfig;

  private constructor(config: MockxFeeConfig = DEFAULT_MOCKX_CONFIG) {
    this.feeConfig = config;
  }

  public static getInstance(config?: MockxFeeConfig): MockxRewardsCalculator {
    if (!MockxRewardsCalculator.instance) {
      MockxRewardsCalculator.instance = new MockxRewardsCalculator(config);
    }
    return MockxRewardsCalculator.instance;
  }

  /**
   * Calculate trading fees and potential MOCKX rewards
   */
  public calculateFeesAndRewards(profitInSol: number, isLiquidityProvider: boolean = false): MockxRewardCalculation {
    // Always charge the fixed trading fee
    const tradingFee = this.feeConfig.baseFee;

    // Calculate base MOCKX reward if profit exceeds threshold
    let mockxReward = 0;
    if (profitInSol >= this.feeConfig.profitThreshold) {
      mockxReward = profitInSol * this.feeConfig.rewardRate * this.feeConfig.mockxMultiplier;
    }

    // Calculate additional LP reward if applicable
    const lpReward = isLiquidityProvider ? mockxReward * (this.feeConfig.lpMultiplier - 1) : 0;
    
    // Calculate total MOCKX reward
    const totalReward = mockxReward + lpReward;

    // Calculate net profit in SOL (only fees deducted, MOCKX is additional)
    const netProfit = profitInSol - tradingFee;

    return {
      tradingFee,
      profit: profitInSol,
      mockxReward,
      lpReward,
      totalReward,
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
  public formatFeesAndRewards(calculation: MockxRewardCalculation, isLiquidityProvider: boolean = false): string {
    let output = `Trading Fee: ${calculation.tradingFee} SOL\n` +
                `Profit: ${calculation.profit} SOL\n` +
                `MOCKX Reward: ${calculation.mockxReward} MOCKX`;
    
    if (isLiquidityProvider) {
      output += `\nLP Bonus: ${calculation.lpReward} MOCKX\n` +
                `Total MOCKX: ${calculation.totalReward} MOCKX`;
    }
    
    output += `\nNet Profit: ${calculation.netProfit} SOL`;
    
    return output;
  }

  /**
   * Check if a trade qualifies for MOCKX rewards
   */
  public isEligibleForReward(profitInSol: number): boolean {
    return profitInSol >= this.feeConfig.profitThreshold;
  }

  /**
   * Get the rewards contract address
   */
  public getRewardsContract(): PublicKey {
    return MOCKX_REWARDS_CONTRACT;
  }

  /**
   * Calculate potential MOCKX rewards for a given profit
   */
  public calculateMockxReward(profitInSol: number, isLiquidityProvider: boolean = false): number {
    if (profitInSol < this.feeConfig.profitThreshold) return 0;
    
    const baseReward = profitInSol * this.feeConfig.rewardRate * this.feeConfig.mockxMultiplier;
    if (!isLiquidityProvider) return baseReward;
    
    return baseReward * this.feeConfig.lpMultiplier;
  }
}
