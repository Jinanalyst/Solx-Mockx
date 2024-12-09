import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { TradeDirection } from './types';

export class VirtualAMM {
  private static instance: VirtualAMM;
  
  private constructor(
    private baseReserve: BN,
    private quoteReserve: BN,
    private k: BN // constant product
  ) {}

  static getInstance(baseReserve: BN, quoteReserve: BN): VirtualAMM {
    if (!VirtualAMM.instance) {
      const k = baseReserve.mul(quoteReserve);
      VirtualAMM.instance = new VirtualAMM(baseReserve, quoteReserve, k);
    }
    return VirtualAMM.instance;
  }

  getPrice(): BN {
    return this.quoteReserve.div(this.baseReserve);
  }

  getSlippage(size: BN, direction: TradeDirection): BN {
    const newBaseReserve = direction === TradeDirection.Long
      ? this.baseReserve.sub(size)
      : this.baseReserve.add(size);

    const newQuoteReserve = this.k.div(newBaseReserve);
    const newPrice = newQuoteReserve.div(newBaseReserve);
    const currentPrice = this.getPrice();

    return direction === TradeDirection.Long
      ? newPrice.sub(currentPrice)
      : currentPrice.sub(newPrice);
  }

  calculateTradeAmount(size: BN, direction: TradeDirection): {
    outputAmount: BN;
    priceImpact: BN;
  } {
    try {
      // Calculate new reserves after trade
      const newBaseReserve = direction === TradeDirection.Long
        ? this.baseReserve.sub(size)
        : this.baseReserve.add(size);

      const newQuoteReserve = this.k.div(newBaseReserve);
      
      // Calculate output amount
      const outputAmount = direction === TradeDirection.Long
        ? this.quoteReserve.sub(newQuoteReserve)
        : newQuoteReserve.sub(this.quoteReserve);

      // Calculate price impact
      const oldPrice = this.getPrice();
      const newPrice = newQuoteReserve.div(newBaseReserve);
      const priceImpact = direction === TradeDirection.Long
        ? newPrice.sub(oldPrice).mul(new BN(100)).div(oldPrice)
        : oldPrice.sub(newPrice).mul(new BN(100)).div(oldPrice);

      return {
        outputAmount,
        priceImpact
      };
    } catch (error) {
      console.error('Failed to calculate trade amount:', error);
      throw error;
    }
  }

  updateReserves(baseReserve: BN, quoteReserve: BN): void {
    this.baseReserve = baseReserve;
    this.quoteReserve = quoteReserve;
    this.k = baseReserve.mul(quoteReserve);
  }

  getLiquidity(): {
    baseReserve: BN;
    quoteReserve: BN;
    k: BN;
  } {
    return {
      baseReserve: this.baseReserve,
      quoteReserve: this.quoteReserve,
      k: this.k
    };
  }

  calculateLiquidityValue(lpTokenAmount: BN, totalLpSupply: BN): {
    baseAmount: BN;
    quoteAmount: BN;
  } {
    const baseAmount = this.baseReserve.mul(lpTokenAmount).div(totalLpSupply);
    const quoteAmount = this.quoteReserve.mul(lpTokenAmount).div(totalLpSupply);

    return {
      baseAmount,
      quoteAmount
    };
  }
}
