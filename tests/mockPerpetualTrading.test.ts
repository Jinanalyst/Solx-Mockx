import { describe, it, expect, beforeEach } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { MockPerpetualTrading } from '../src/services/mockPerpetualTrading';
import { TradeDirection } from '../src/perpetuals/types';

describe('MockPerpetualTrading', () => {
  let mockTrading: MockPerpetualTrading;
  let testUser: PublicKey;

  beforeEach(() => {
    mockTrading = MockPerpetualTrading.getInstance();
    testUser = new PublicKey('11111111111111111111111111111111');
  });

  describe('Position Management', () => {
    it('should open a long position with leverage', async () => {
      const { positionId, mockxReward } = await mockTrading.openPosition(testUser, {
        size: new BN(1e9), // 1 SOL
        leverage: 5,
        direction: TradeDirection.Long,
        collateral: new BN(0.2e9), // 0.2 SOL collateral
      });

      expect(positionId).toBeDefined();
      expect(mockxReward).toBeGreaterThan(0);

      const positions = await mockTrading.getPositions(testUser);
      expect(positions.length).toBe(1);
      expect(positions[0].leverage).toBe(5);
      expect(positions[0].size.eq(new BN(5e9))).toBe(true); // 5x leveraged size
    });

    it('should close a position and calculate PnL', async () => {
      // Open a position first
      const { positionId } = await mockTrading.openPosition(testUser, {
        size: new BN(1e9),
        leverage: 3,
        direction: TradeDirection.Long,
        collateral: new BN(0.33e9),
      });

      // Simulate price increase
      mockTrading.setMockPrice(new BN(25 * 1e9)); // Price increases to $25

      // Close position
      const { pnl, mockxReward } = await mockTrading.closePosition(positionId);

      expect(pnl.gt(new BN(0))).toBe(true);
      expect(mockxReward).toBeGreaterThan(0);
    });

    it('should calculate higher fees for leveraged positions', async () => {
      const { positionId: lowLevPos } = await mockTrading.openPosition(testUser, {
        size: new BN(1e9),
        leverage: 1,
        direction: TradeDirection.Long,
        collateral: new BN(1e9),
      });

      const { positionId: highLevPos } = await mockTrading.openPosition(testUser, {
        size: new BN(1e9),
        leverage: 10,
        direction: TradeDirection.Long,
        collateral: new BN(0.1e9),
      });

      const positions = await mockTrading.getPositions(testUser);
      const lowLevPosition = positions.find(p => p.id === lowLevPos);
      const highLevPosition = positions.find(p => p.id === highLevPos);

      expect(highLevPosition!.fee.gt(lowLevPosition!.fee)).toBe(true);
    });
  });

  describe('Market Data', () => {
    it('should provide market price', async () => {
      const price = await mockTrading.getMarketPrice();
      expect(price.gt(new BN(0))).toBe(true);
    });

    it('should provide funding rate', async () => {
      const rate = await mockTrading.getFundingRate();
      expect(rate.gt(new BN(0))).toBe(true);
    });
  });
});
