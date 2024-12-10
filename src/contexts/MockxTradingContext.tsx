'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { MockxRewardsCalculator } from '@/utils/mockxRewards';

interface Position {
  id: string;
  pair: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  unrealizedPnl: number;
  liquidationPrice: number;
  isLiquidityProvider: boolean;
  lpRewards: number;
}

interface MockxTradingContextType {
  positions: Position[];
  isLoading: boolean;
  openPosition: (position: Omit<Position, 'id' | 'unrealizedPnl' | 'liquidationPrice' | 'lpRewards'>) => void;
  closePosition: (id: string) => void;
  updatePositions: () => void;
}

const MockxTradingContext = createContext<MockxTradingContextType | undefined>(undefined);

export function MockxTradingProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { publicKey } = useWallet();

  const calculatePnL = (position: Position) => {
    const priceDiff = position.markPrice - position.entryPrice;
    const multiplier = position.side === 'long' ? 1 : -1;
    return position.size * priceDiff * multiplier;
  };

  const calculateLiquidationPrice = (position: Position) => {
    const margin = position.size * position.entryPrice / position.leverage;
    const liquidationThreshold = 0.8; // 80% of margin
    const direction = position.side === 'long' ? -1 : 1;
    
    return position.entryPrice + (direction * (margin * liquidationThreshold) / Math.abs(position.size));
  };

  const openPosition = (newPosition: Omit<Position, 'id' | 'unrealizedPnl' | 'liquidationPrice' | 'lpRewards'>) => {
    const id = Math.random().toString(36).substring(7);
    const liquidationPrice = calculateLiquidationPrice({
      ...newPosition,
      id,
      unrealizedPnl: 0,
      liquidationPrice: 0,
      lpRewards: 0,
    });

    setPositions(prev => [...prev, {
      ...newPosition,
      id,
      unrealizedPnl: 0,
      liquidationPrice,
      lpRewards: 0,
    }]);
  };

  const closePosition = (id: string) => {
    setPositions(prev => prev.filter(pos => pos.id !== id));
  };

  const updatePositions = () => {
    setPositions(prev => prev.map(pos => {
      const updatedMarkPrice = pos.markPrice * (1 + (Math.random() - 0.5) * 0.002); // Simulate price movement
      const updatedPosition = {
        ...pos,
        markPrice: updatedMarkPrice,
      };
      const pnl = calculatePnL(updatedPosition);
      
      // Update LP rewards if applicable
      let lpRewards = pos.lpRewards;
      if (pos.isLiquidityProvider) {
        const rewardsCalculator = MockxRewardsCalculator.getInstance();
        const { lpReward } = rewardsCalculator.calculateFeesAndRewards(pnl, true);
        lpRewards += lpReward;
      }

      return {
        ...updatedPosition,
        unrealizedPnl: pnl,
        lpRewards,
      };
    }));
  };

  useEffect(() => {
    const interval = setInterval(updatePositions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!publicKey) {
      setPositions([]);
    }
  }, [publicKey]);

  return (
    <MockxTradingContext.Provider value={{
      positions,
      isLoading,
      openPosition,
      closePosition,
      updatePositions,
    }}>
      {children}
    </MockxTradingContext.Provider>
  );
}

export function useMockxTrading() {
  const context = useContext(MockxTradingContext);
  if (context === undefined) {
    throw new Error('useMockxTrading must be used within a MockxTradingProvider');
  }
  return context;
}
