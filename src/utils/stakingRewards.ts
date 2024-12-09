import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

export const STAKING_REWARDS_WALLET = new PublicKey('7xkf4DviZZkpWVEh53MrcQV6vGXGpESnNXgAvU6KpBUH');

// Base annual reward rate (APR)
const BASE_REWARD_RATE = 0.60; // 60% APR

// Additional reward rate tiers based on staking duration
const DURATION_REWARD_TIERS = [
  { months: 1, additionalRate: 0 },       // 60% APR for 1 month
  { months: 3, additionalRate: 0.10 },    // 70% APR for 3 months
  { months: 6, additionalRate: 0.20 },    // 80% APR for 6 months
  { months: 12, additionalRate: 0.40 },   // 100% APR for 12 months
];

// Additional reward rate based on staking amount
const AMOUNT_REWARD_TIERS = [
  { minAmount: 100, additionalRate: 0 },      // Base rate for 100-999 SOLX
  { minAmount: 1000, additionalRate: 0.10 },  // +10% for 1000-9999 SOLX
  { minAmount: 10000, additionalRate: 0.20 }, // +20% for 10000+ SOLX
];

export interface RewardCalculation {
  totalReward: number;       // Total reward in SOLX tokens
  annualRate: number;        // Applied annual reward rate as a decimal
  durationBonus: number;     // Additional rate from duration
  amountBonus: number;       // Additional rate from amount
  rewardInUSD: number;       // Reward converted to USD
}

export interface StakingParams {
  amount: number;            // Amount of SOLX tokens staked
  durationMonths: number;    // Staking duration in months
  tokenPrice: number;        // Current price of SOLX in USD
}

export class StakingRewardsCalculator {
  private static instance: StakingRewardsCalculator;
  private totalRewardsDistributed: number = 0;

  private constructor() {}

  public static getInstance(): StakingRewardsCalculator {
    if (!StakingRewardsCalculator.instance) {
      StakingRewardsCalculator.instance = new StakingRewardsCalculator();
    }
    return StakingRewardsCalculator.instance;
  }

  /**
   * Calculate reward rate based on staking duration
   */
  private calculateDurationBonus(durationMonths: number): number {
    const tier = DURATION_REWARD_TIERS.find(t => durationMonths <= t.months) || 
                DURATION_REWARD_TIERS[DURATION_REWARD_TIERS.length - 1];
    return tier.additionalRate;
  }

  /**
   * Calculate reward rate based on staking amount
   */
  private calculateAmountBonus(amount: number): number {
    const tier = AMOUNT_REWARD_TIERS.find(t => amount >= t.minAmount) || 
                AMOUNT_REWARD_TIERS[AMOUNT_REWARD_TIERS.length - 1];
    return tier.additionalRate;
  }

  /**
   * Calculate staking rewards for a position
   */
  public calculateReward(params: StakingParams): RewardCalculation {
    const { amount, durationMonths, tokenPrice } = params;
    
    // Calculate bonus rates
    const durationBonus = this.calculateDurationBonus(durationMonths);
    const amountBonus = this.calculateAmountBonus(amount);
    
    // Calculate total annual rate
    const annualRate = BASE_REWARD_RATE + durationBonus + amountBonus;
    
    // Calculate pro-rated reward for the staking period
    const proRatedMonths = Math.min(durationMonths, 12);
    const totalReward = amount * annualRate * (proRatedMonths / 12);
    
    // Calculate reward value in USD
    const rewardInUSD = totalReward * tokenPrice;

    // Update total rewards distributed
    this.totalRewardsDistributed += rewardInUSD;

    return {
      totalReward,
      annualRate,
      durationBonus,
      amountBonus,
      rewardInUSD
    };
  }

  /**
   * Convert reward amount to lamports for on-chain transfer
   */
  public rewardToLamports(reward: number): BN {
    return new BN(Math.floor(reward * 1e9));
  }

  /**
   * Get total rewards distributed in USD
   */
  public getTotalRewardsDistributed(): number {
    return this.totalRewardsDistributed;
  }

  /**
   * Format reward for display
   */
  public formatRewardForDisplay(reward: RewardCalculation): string {
    const annualRatePercent = (reward.annualRate * 100).toFixed(2);
    const durationBonusPercent = (reward.durationBonus * 100).toFixed(2);
    const amountBonusPercent = (reward.amountBonus * 100).toFixed(2);
    
    return `${annualRatePercent}% APR (Base: ${BASE_REWARD_RATE * 100}% + Duration: ${durationBonusPercent}% + Amount: ${amountBonusPercent}%) ≈ ${reward.totalReward.toFixed(4)} SOLX ($${reward.rewardInUSD.toFixed(2)})`;
  }
}
