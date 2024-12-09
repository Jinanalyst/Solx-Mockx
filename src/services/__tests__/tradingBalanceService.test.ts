import { describe, it, expect, beforeEach } from 'vitest';
import { tradingBalanceService } from '../tradingBalanceService';

describe('TradingBalanceService', () => {
  const testWalletAddress = '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8';

  beforeEach(async () => {
    // Initialize a fresh balance for each test
    await tradingBalanceService.initializeUserBalance(testWalletAddress);
  });

  describe('Balance Management', () => {
    it('should initialize user balance correctly', async () => {
      const solxBalance = await tradingBalanceService.getBalance(testWalletAddress, 'solx');
      const mockxBalance = await tradingBalanceService.getBalance(testWalletAddress, 'mockx');
      
      expect(solxBalance).toBe(0);
      expect(mockxBalance).toBe(0);
    });

    it('should track SOLX/USDT trades correctly', async () => {
      // Test buying SOLX
      const buyAmount = 100;
      const buyPrice = 10;
      const success = await tradingBalanceService.executeTrade(
        testWalletAddress,
        'SOLX',
        'USDT',
        buyAmount,
        buyPrice,
        true
      );

      expect(success).toBe(true);
      
      const solxBalance = await tradingBalanceService.getBalance(testWalletAddress, 'solx');
      expect(solxBalance).toBe(buyAmount);

      // Test selling SOLX
      const sellAmount = 50;
      const sellPrice = 12;
      const sellSuccess = await tradingBalanceService.executeTrade(
        testWalletAddress,
        'SOLX',
        'USDT',
        sellAmount,
        sellPrice,
        false
      );

      expect(sellSuccess).toBe(true);
      
      const updatedSolxBalance = await tradingBalanceService.getBalance(testWalletAddress, 'solx');
      expect(updatedSolxBalance).toBe(buyAmount - sellAmount);
    });

    it('should prevent trades with insufficient balance', async () => {
      // Try to sell more than available
      const sellAmount = 100;
      const sellPrice = 10;
      const sellSuccess = await tradingBalanceService.executeTrade(
        testWalletAddress,
        'SOLX',
        'USDT',
        sellAmount,
        sellPrice,
        false
      );

      expect(sellSuccess).toBe(false);
    });
  });

  describe('Token Balance Caching', () => {
    it('should cache token balances', async () => {
      // First call should cache the balance
      await tradingBalanceService.getBalance(testWalletAddress, 'USDT');
      
      // Clear cache to test cache invalidation
      tradingBalanceService.clearCache();
      
      // Should fetch fresh balance
      const balance = await tradingBalanceService.getBalance(testWalletAddress, 'USDT');
      expect(typeof balance).toBe('number');
    });
  });

  describe('Multiple Trading Pairs', () => {
    it('should handle MOCKX trades independently of SOLX trades', async () => {
      // Buy SOLX
      await tradingBalanceService.executeTrade(
        testWalletAddress,
        'SOLX',
        'USDT',
        100,
        10,
        true
      );

      // Buy MOCKX
      await tradingBalanceService.executeTrade(
        testWalletAddress,
        'MOCKX',
        'USDT',
        200,
        5,
        true
      );

      const solxBalance = await tradingBalanceService.getBalance(testWalletAddress, 'solx');
      const mockxBalance = await tradingBalanceService.getBalance(testWalletAddress, 'mockx');

      expect(solxBalance).toBe(100);
      expect(mockxBalance).toBe(200);
    });
  });
});
