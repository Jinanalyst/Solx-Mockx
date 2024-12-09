import { describe, it, beforeEach, expect } from 'vitest';
import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { setupTest } from './setup';
import { PerpetualContract } from '../src/perpetuals/perpetualContract';
import { TradeDirection, OrderParams } from '../src/perpetuals/types';

describe('PerpetualContract', () => {
  let perpetualContract: PerpetualContract;
  let provider: any;
  let wallet: any;

  beforeEach(async () => {
    const setup = await setupTest();
    provider = setup.provider;
    wallet = setup.wallet;
    perpetualContract = PerpetualContract.getInstance(setup.connection, provider);
  });

  describe('Position Management', () => {
    it('should open a long position', async () => {
      const params: OrderParams = {
        size: new BN(1_000_000_000), // 1 SOL
        price: new BN(50_000_000), // $50
        leverage: 5,
        direction: TradeDirection.Long,
        collateral: new BN(200_000_000), // 0.2 SOL
      };

      const txId = await perpetualContract.openPosition(params);
      expect(txId).toBeTruthy();
    });

    it('should close a position', async () => {
      // First open a position
      const params: OrderParams = {
        size: new BN(1_000_000_000),
        price: new BN(50_000_000),
        leverage: 5,
        direction: TradeDirection.Long,
        collateral: new BN(200_000_000),
      };

      await perpetualContract.openPosition(params);

      // Then close it
      const txId = await perpetualContract.closePosition(wallet.publicKey);
      expect(txId).toBeTruthy();
    });

    it('should reject position with insufficient collateral', async () => {
      const params: OrderParams = {
        size: new BN(1_000_000_000),
        price: new BN(50_000_000),
        leverage: 10,
        direction: TradeDirection.Long,
        collateral: new BN(1_000), // Very small collateral
      };

      await expect(perpetualContract.openPosition(params)).rejects.toThrow();
    });

    it('should reject position with excessive leverage', async () => {
      const params: OrderParams = {
        size: new BN(1_000_000_000),
        price: new BN(50_000_000),
        leverage: 100, // Excessive leverage
        direction: TradeDirection.Long,
        collateral: new BN(200_000_000),
      };

      await expect(perpetualContract.openPosition(params)).rejects.toThrow();
    });
  });

  describe('Funding Rate', () => {
    it('should calculate funding rate correctly', async () => {
      const fundingRate = await perpetualContract.updateFundingRate();
      expect(fundingRate.rate).toBeDefined();
      expect(fundingRate.timestamp).toBeDefined();
    });

    it('should apply funding payments correctly', async () => {
      // Open a position
      const params: OrderParams = {
        size: new BN(1_000_000_000),
        price: new BN(50_000_000),
        leverage: 5,
        direction: TradeDirection.Long,
        collateral: new BN(200_000_000),
      };

      await perpetualContract.openPosition(params);

      // Update funding rate
      await perpetualContract.updateFundingRate();

      // Check position after funding
      const positions = await perpetualContract['getAllPositions']();
      const position = positions[0];
      expect(position.accumulatedFunding).toBeDefined();
    });
  });

  describe('Liquidation', () => {
    it('should liquidate underwater position', async () => {
      // Open a high leverage position
      const params: OrderParams = {
        size: new BN(1_000_000_000),
        price: new BN(50_000_000),
        leverage: 10,
        direction: TradeDirection.Long,
        collateral: new BN(100_000_000),
      };

      await perpetualContract.openPosition(params);

      // Simulate price drop
      // This would typically be done through the price oracle
      // For testing, we'll directly call checkLiquidations
      await perpetualContract.checkLiquidations();

      // Verify position was liquidated
      const positions = await perpetualContract['getAllPositions']();
      expect(positions.length).toBe(0);
    });

    it('should not liquidate healthy position', async () => {
      // Open a conservative position
      const params: OrderParams = {
        size: new BN(1_000_000_000),
        price: new BN(50_000_000),
        leverage: 2,
        direction: TradeDirection.Long,
        collateral: new BN(500_000_000),
      };

      await perpetualContract.openPosition(params);

      // Check liquidations
      await perpetualContract.checkLiquidations();

      // Verify position still exists
      const positions = await perpetualContract['getAllPositions']();
      expect(positions.length).toBe(1);
    });
  });
});
