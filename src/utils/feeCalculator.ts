import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

export const PLATFORM_FEE_WALLET = new PublicKey('6zkf4DviZZkpWVEh53MrcQV6vGXGpESnNXgAvU6KpBUH');

// Base fee rate for standard leverage (1x-10x)
const BASE_FEE_RATE = 0.001; // 0.1%

// Additional fee rate per leverage tier
const LEVERAGE_FEE_TIERS = [
  { maxLeverage: 10, additionalFee: 0 },        // 0.1% total for 1-10x
  { maxLeverage: 25, additionalFee: 0.0005 },   // 0.15% total for 11-25x
  { maxLeverage: 50, additionalFee: 0.001 },    // 0.2% total for 26-50x
  { maxLeverage: 100, additionalFee: 0.002 },   // 0.3% total for 51-100x
];

export interface FeeCalculation {
  totalFee: number;          // Total fee in the asset's native units
  feeRate: number;           // Applied fee rate as a decimal
  leverageMultiplier: number; // Fee multiplier based on leverage
  totalPositionSize: number;  // Total position size including leverage
  feeInUSD: number;          // Fee converted to USD
}

export interface TradeParams {
  baseSize: number;          // Base asset amount (e.g., SOL amount)
  leverage: number;          // Selected leverage (e.g., 10 for 10x)
  assetPrice: number;        // Current price of the asset in USD
  isClosing?: boolean;       // Whether this is a position close
}

export class FeeCalculator {
  private static instance: FeeCalculator;
  private totalFeesCollected: number = 0;

  private constructor() {}

  public static getInstance(): FeeCalculator {
    if (!FeeCalculator.instance) {
      FeeCalculator.instance = new FeeCalculator();
    }
    return FeeCalculator.instance;
  }

  /**
   * Calculate the fee rate based on leverage
   */
  private calculateFeeRate(leverage: number): number {
    const tier = LEVERAGE_FEE_TIERS.find(t => leverage <= t.maxLeverage) || 
                LEVERAGE_FEE_TIERS[LEVERAGE_FEE_TIERS.length - 1];
    return BASE_FEE_RATE + tier.additionalFee;
  }

  /**
   * Calculate trading fees for a position
   */
  public calculateTradingFee(params: TradeParams): FeeCalculation {
    const { baseSize, leverage, assetPrice, isClosing = false } = params;
    
    // Calculate total position size with leverage
    const totalPositionSize = baseSize * leverage;
    
    // Get fee rate based on leverage
    const feeRate = this.calculateFeeRate(leverage);
    
    // Calculate total fee in the asset's native units
    const totalFee = totalPositionSize * feeRate;
    
    // Calculate fee in USD
    const feeInUSD = totalFee * assetPrice;

    // Update total fees collected
    if (!isClosing) {
      this.totalFeesCollected += feeInUSD;
    }

    return {
      totalFee,
      feeRate,
      leverageMultiplier: leverage,
      totalPositionSize,
      feeInUSD
    };
  }

  /**
   * Convert fee amount to lamports for on-chain transfer
   */
  public feeToLamports(fee: number): BN {
    return new BN(Math.floor(fee * 1e9));
  }

  /**
   * Get total fees collected in USD
   */
  public getTotalFeesCollected(): number {
    return this.totalFeesCollected;
  }

  /**
   * Format fee for display
   */
  public formatFeeForDisplay(fee: FeeCalculation): string {
    return `${(fee.feeRate * 100).toFixed(2)}% (${fee.totalFee.toFixed(4)} SOL ≈ $${fee.feeInUSD.toFixed(2)})`;
  }
}
