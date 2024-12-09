import { describe, it, beforeEach, expect } from 'vitest';
import { BN } from '@project-serum/anchor';
import { VirtualAMM } from '../src/perpetuals/virtualAMM';
import { TradeDirection } from '../src/perpetuals/types';

describe('VirtualAMM', () => {
  let vamm: VirtualAMM;
  const initialBaseReserve = new BN(1_000_000_000_000); // 1000 SOL
  const initialQuoteReserve = new BN(50_000_000_000_000); // $50,000

  beforeEach(() => {
    vamm = VirtualAMM.getInstance(initialBaseReserve, initialQuoteReserve);
  });

  describe('Price Calculation', () => {
    it('should calculate initial price correctly', () => {
      const price = vamm.getPrice();
      // Expected price: 50,000 / 1000 = $50
      expect(price.toString()).toBe('50');
    });

    it('should calculate price impact for buy order', () => {
      const size = new BN(100_000_000_000); // 100 SOL
      const slippage = vamm.getSlippage(size, TradeDirection.Long);
      expect(slippage.toNumber()).toBeGreaterThan(0);
    });

    it('should calculate price impact for sell order', () => {
      const size = new BN(100_000_000_000); // 100 SOL
      const slippage = vamm.getSlippage(size, TradeDirection.Short);
      expect(slippage.toNumber()).toBeGreaterThan(0);
    });
  });

  describe('Trade Calculations', () => {
    it('should calculate long trade amount correctly', () => {
      const size = new BN(100_000_000_000); // 100 SOL
      const result = vamm.calculateTradeAmount(size, TradeDirection.Long);
      
      expect(result.outputAmount).toBeDefined();
      expect(result.priceImpact).toBeDefined();
      expect(result.priceImpact.toNumber()).toBeGreaterThan(0);
    });

    it('should calculate short trade amount correctly', () => {
      const size = new BN(100_000_000_000); // 100 SOL
      const result = vamm.calculateTradeAmount(size, TradeDirection.Short);
      
      expect(result.outputAmount).toBeDefined();
      expect(result.priceImpact).toBeDefined();
      expect(result.priceImpact.toNumber()).toBeGreaterThan(0);
    });

    it('should maintain constant product after trade', () => {
      const size = new BN(100_000_000_000); // 100 SOL
      const initialK = initialBaseReserve.mul(initialQuoteReserve);
      
      // Perform trade
      vamm.calculateTradeAmount(size, TradeDirection.Long);
      
      const { baseReserve, quoteReserve, k } = vamm.getLiquidity();
      const newK = baseReserve.mul(quoteReserve);
      
      expect(newK.toString()).toBe(initialK.toString());
    });
  });

  describe('Liquidity Management', () => {
    it('should calculate liquidity provider token value correctly', () => {
      const lpTokenAmount = new BN(1_000_000_000); // 1 LP token
      const totalLpSupply = new BN(10_000_000_000); // 10 LP tokens total
      
      const value = vamm.calculateLiquidityValue(lpTokenAmount, totalLpSupply);
      
      expect(value.baseAmount).toBeDefined();
      expect(value.quoteAmount).toBeDefined();
      
      // Should be 10% of reserves (1/10 of total supply)
      expect(value.baseAmount.toString()).toBe(initialBaseReserve.div(new BN(10)).toString());
      expect(value.quoteAmount.toString()).toBe(initialQuoteReserve.div(new BN(10)).toString());
    });

    it('should update reserves correctly', () => {
      const newBaseReserve = new BN(2_000_000_000_000); // 2000 SOL
      const newQuoteReserve = new BN(100_000_000_000_000); // $100,000
      
      vamm.updateReserves(newBaseReserve, newQuoteReserve);
      
      const { baseReserve, quoteReserve } = vamm.getLiquidity();
      expect(baseReserve.toString()).toBe(newBaseReserve.toString());
      expect(quoteReserve.toString()).toBe(newQuoteReserve.toString());
    });
  });
});
