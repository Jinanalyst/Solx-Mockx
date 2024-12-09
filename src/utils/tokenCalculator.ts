import { BN } from '@project-serum/anchor';

export interface TokenAmounts {
  baseAmount: number;      // Amount in base token
  quoteAmount: number;     // Amount in quote token
  feeAmount: number;       // Fee amount in base token
  totalAmount: number;     // Total amount including fees
}

/**
 * Calculate token amounts for a trade including fees
 * @param baseAmount Amount of base token
 * @param price Price per token
 * @param feeRate Fee rate as decimal (e.g., 0.001 for 0.1%)
 * @param side 'buy' or 'sell'
 * @returns TokenAmounts object with calculated amounts
 */
export function calculateTokenAmount(
  baseAmount: number,
  price: number,
  feeRate: number,
  side: 'buy' | 'sell'
): TokenAmounts {
  const quoteAmount = baseAmount * price;
  const feeAmount = baseAmount * feeRate;
  
  // For buys, add fee to base amount
  // For sells, subtract fee from base amount
  const totalAmount = side === 'buy' 
    ? baseAmount + feeAmount 
    : baseAmount - feeAmount;

  return {
    baseAmount,
    quoteAmount,
    feeAmount,
    totalAmount
  };
}

/**
 * Convert token amount to lamports (1e9)
 * @param amount Amount to convert
 * @returns BN representing lamports
 */
export function toTokenLamports(amount: number): BN {
  return new BN(Math.floor(amount * 1e9));
}

/**
 * Convert lamports to token amount
 * @param lamports BN representing lamports
 * @returns Number representing token amount
 */
export function fromTokenLamports(lamports: BN): number {
  return lamports.toNumber() / 1e9;
}

/**
 * Format token amount for display
 * @param amount Amount to format
 * @param decimals Number of decimal places
 * @param symbol Token symbol
 * @returns Formatted string
 */
export function formatTokenAmount(
  amount: number,
  decimals: number = 4,
  symbol?: string
): string {
  const formatted = amount.toFixed(decimals);
  return symbol ? `${formatted} ${symbol}` : formatted;
}
