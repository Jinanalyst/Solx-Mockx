import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export const SOLX_TOKEN_ADDRESS = new PublicKey('2k42cRS5yBmgXGiEGwebC8Y5BQvWH4xr5UKP5TijysTP');
export const REWARDS_WALLET = new PublicKey('6zkf4DviZZkpWVEh53MrcQV6vGXGpESnNXgAvU6KpBUH');

const DECIMALS = 9; // SOLX token decimals
const BASE_REWARD_RATE = 0.01; // 1% base reward rate
const FEE_RATE = 0.001; // 0.1% trading fee

export interface TradeDetails {
  positionSize: number;  // In USD
  leverage: number;
  profitLoss: number;    // In USD
  duration: number;      // Trade duration in seconds
}

export interface RewardsResult {
  tradingFee: number;    // In USD
  baseReward: number;    // In SOLX
  bonusReward: number;   // In SOLX
  netRewardSolx: number; // Total reward in SOLX
}

export class RewardsCalculator {
  private static instance: RewardsCalculator;
  private totalFeesCollected: number = 0;

  private constructor() {}

  public static getInstance(): RewardsCalculator {
    if (!RewardsCalculator.instance) {
      RewardsCalculator.instance = new RewardsCalculator();
    }
    return RewardsCalculator.instance;
  }

  public calculateRewards(trade: TradeDetails, currentSolPrice: number): RewardsResult {
    // Calculate trading fee
    const tradingFee = trade.positionSize * FEE_RATE;
    this.totalFeesCollected += tradingFee;

    // Calculate base reward in SOLX
    const baseReward = (tradingFee / currentSolPrice) * BASE_REWARD_RATE;

    // Calculate bonus rewards based on factors like leverage and duration
    const leverageBonus = Math.min(trade.leverage / 10, 1); // Max bonus at 10x leverage
    const durationBonus = Math.min(trade.duration / (24 * 3600), 1); // Max bonus for 24h trades
    const profitBonus = trade.profitLoss > 0 ? 0.5 : 0; // 50% bonus for profitable trades

    const bonusMultiplier = 1 + (leverageBonus + durationBonus + profitBonus) / 3;
    const bonusReward = baseReward * bonusMultiplier;

    const netRewardSolx = baseReward + bonusReward;

    return {
      tradingFee,
      baseReward,
      bonusReward,
      netRewardSolx,
    };
  }

  public solxToTokenUnits(solx: number): BN {
    return new BN(Math.floor(solx * Math.pow(10, DECIMALS)));
  }

  public tokenUnitsToSolx(units: BN): number {
    return units.toNumber() / Math.pow(10, DECIMALS);
  }

  public getTotalFeesCollected(): number {
    return this.totalFeesCollected;
  }
}
