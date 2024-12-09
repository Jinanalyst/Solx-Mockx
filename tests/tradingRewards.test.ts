import { describe, it, expect } from 'vitest';
import { TradingRewardsCalculator } from '../src/utils/tradingRewards';

describe('TradingRewardsCalculator', () => {
  const calculator = TradingRewardsCalculator.getInstance();

  describe('Leveraged Rewards Calculation', () => {
    it('should calculate higher fees for leveraged positions', () => {
      const lowLeverage = calculator.calculateLeveragedRewards({
        notionalValue: 1000,
        leverage: 1,
        isLong: true,
      });

      const highLeverage = calculator.calculateLeveragedRewards({
        notionalValue: 1000,
        leverage: 10,
        isLong: true,
      });

      expect(highLeverage.tradingFee).toBeGreaterThan(lowLeverage.tradingFee);
    });

    it('should calculate increased rewards for profitable leveraged trades', () => {
      const lowLeverage = calculator.calculateLeveragedRewards({
        notionalValue: 100,
        leverage: 1,
        isLong: true,
        isPnL: true,
      });

      const highLeverage = calculator.calculateLeveragedRewards({
        notionalValue: 100,
        leverage: 5,
        isLong: true,
        isPnL: true,
      });

      expect(highLeverage.solxReward).toBeGreaterThan(lowLeverage.solxReward);
    });

    it('should not award MOCKX for losses', () => {
      const result = calculator.calculateLeveragedRewards({
        notionalValue: -50,
        leverage: 5,
        isLong: true,
        isPnL: true,
      });

      expect(result.solxReward).toBe(0);
    });

    it('should require higher profit threshold for leveraged positions', () => {
      const smallProfit = calculator.calculateLeveragedRewards({
        notionalValue: 0.05, // Small profit below threshold
        leverage: 5,
        isLong: true,
        isPnL: true,
      });

      const largeProfit = calculator.calculateLeveragedRewards({
        notionalValue: 1, // Large profit above threshold
        leverage: 5,
        isLong: true,
        isPnL: true,
      });

      expect(smallProfit.solxReward).toBe(0);
      expect(largeProfit.solxReward).toBeGreaterThan(0);
    });
  });
});
