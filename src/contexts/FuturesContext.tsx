'use client';

import React, { createContext, useContext, useReducer, useEffect, useMemo, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { websocketService } from '@/services/websocketService';
import { FuturesPosition } from '@/utils/futuresCalculations';
import RewardsService from '@/services/rewardsService';

export interface Position extends FuturesPosition {
  id: string;
  pair: string;
  stopLoss: number | null;
  takeProfit: number | null;
  timestamp: number;
  entryPrice: number;
  exitPrice?: number;
  tradeSize: number;
  leverage: number;
  side: 'long' | 'short';
}

interface TradeDetails {
  entryPrice: number;
  exitPrice: number;
  tradeSize: number;
  side: 'long' | 'short';
  timestamp: number;
  walletAddress: string;
  pnl?: number;
  roi?: number;
}

interface FuturesState {
  positions: Position[];
  openOrders: any[];
  marginBalance: number;
  availableBalance: number;
  totalRewardsEarned: number;
  totalFeesCollected: number;
}

type FuturesAction =
  | { type: 'OPEN_POSITION'; payload: Position }
  | { type: 'CLOSE_POSITION'; payload: string }
  | { type: 'UPDATE_POSITION'; payload: Partial<Position> & { id: string } }
  | { type: 'SET_STOP_LOSS'; payload: { positionId: string; price: number } }
  | { type: 'SET_TAKE_PROFIT'; payload: { positionId: string; price: number } }
  | { type: 'UPDATE_MARGIN_BALANCE'; payload: number }
  | { type: 'UPDATE_AVAILABLE_BALANCE'; payload: number }
  | { type: 'UPDATE_REWARDS'; payload: { rewards: number; fees: number } };

const initialState: FuturesState = {
  positions: [],
  openOrders: [],
  marginBalance: 0,
  availableBalance: 0,
  totalRewardsEarned: 0,
  totalFeesCollected: 0,
};

const FuturesContext = createContext<{
  state: FuturesState;
  openPosition: (position: Omit<Position, 'id' | 'timestamp'>) => Promise<void>;
  closePosition: (positionId: string) => Promise<void>;
  setStopLoss: (positionId: string, price: number) => Promise<void>;
  setTakeProfit: (positionId: string, price: number) => Promise<void>;
} | null>(null);

function futuresReducer(state: FuturesState, action: FuturesAction): FuturesState {
  switch (action.type) {
    case 'OPEN_POSITION':
      return {
        ...state,
        positions: [...state.positions, action.payload],
      };
    case 'CLOSE_POSITION':
      return {
        ...state,
        positions: state.positions.filter((p) => p.id !== action.payload),
      };
    case 'UPDATE_POSITION':
      return {
        ...state,
        positions: state.positions.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload } : p
        ),
      };
    case 'SET_STOP_LOSS':
      return {
        ...state,
        positions: state.positions.map((p) =>
          p.id === action.payload.positionId
            ? { ...p, stopLoss: action.payload.price }
            : p
        ),
      };
    case 'SET_TAKE_PROFIT':
      return {
        ...state,
        positions: state.positions.map((p) =>
          p.id === action.payload.positionId
            ? { ...p, takeProfit: action.payload.price }
            : p
        ),
      };
    case 'UPDATE_MARGIN_BALANCE':
      return {
        ...state,
        marginBalance: action.payload,
      };
    case 'UPDATE_AVAILABLE_BALANCE':
      return {
        ...state,
        availableBalance: action.payload,
      };
    case 'UPDATE_REWARDS':
      return {
        ...state,
        totalRewardsEarned: state.totalRewardsEarned + action.payload.rewards,
        totalFeesCollected: action.payload.fees,
      };
    default:
      return state;
  }
}

export function FuturesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(futuresReducer, {
    ...initialState,
    totalRewardsEarned: 0,
    totalFeesCollected: 0,
  });

  const rewardsService = useMemo(() => 
    RewardsService.getInstance('https://api.mainnet-beta.solana.com'),
    []
  );

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    websocketService.connect();

    // Subscribe to price updates
    const handlePriceUpdate = (data: any) => {
      // Check positions for stop loss and take profit triggers
      state.positions.forEach((position) => {
        const currentPrice = data.price;

        if (position.stopLoss !== null) {
          if (
            (position.side === 'long' && currentPrice <= position.stopLoss) ||
            (position.side === 'short' && currentPrice >= position.stopLoss)
          ) {
            closePosition(position.id);
          }
        }

        if (position.takeProfit !== null) {
          if (
            (position.side === 'long' && currentPrice >= position.takeProfit) ||
            (position.side === 'short' && currentPrice <= position.takeProfit)
          ) {
            closePosition(position.id);
          }
        }
      });
    };

    websocketService.subscribe('prices', handlePriceUpdate);

    return () => {
      websocketService.unsubscribe('prices', handlePriceUpdate);
      websocketService.disconnect();
    };
  }, [state.positions]);

  const openPosition = async (
    position: Omit<Position, 'id' | 'timestamp'>
  ) => {
    try {
      // Here you would typically make an API call to your backend
      const response = await fetch('/api/futures/position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(position),
      });

      if (!response.ok) throw new Error('Failed to open position');

      const newPosition = await response.json();
      dispatch({ type: 'OPEN_POSITION', payload: newPosition });
    } catch (error) {
      console.error('Error opening position:', error);
      throw error;
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      const position = state.positions.find(p => p.id === positionId);
      if (!position) throw new Error('Position not found');

      // Here you would typically make an API call to your backend
      const response = await fetch(`/api/futures/position/${positionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to close position');

      const closedPosition = await response.json();
      
      // Process rewards for the closed position
      const trade: TradeDetails = {
        entryPrice: position.entryPrice,
        exitPrice: closedPosition.exitPrice,
        tradeSize: position.tradeSize,
        side: position.side,
        timestamp: Date.now(),
        walletAddress: 'user_wallet_address', // Get this from user's connected wallet
      };

      // Get current SOL price from your price feed
      const currentSolPrice = closedPosition.exitPrice; // Or get from your price feed

      // Calculate additional trade details for rewards
      const tradeDetails = {
        positionSize: trade.tradeSize,
        leverage: position.leverage || 1,
        profitLoss: (trade.exitPrice - trade.entryPrice) * trade.tradeSize * (trade.side === 'long' ? 1 : -1),
        duration: (Date.now() - position.timestamp) / 1000, // Convert to seconds
      };

      // Process rewards
      const rewardsResult = await rewardsService.processTradeRewards(
        tradeDetails,
        currentSolPrice,
        new PublicKey('user_wallet_address') // Get this from user's connected wallet
      );

      // Update state with rewards info
      dispatch({
        type: 'UPDATE_REWARDS',
        payload: {
          rewards: rewardsResult.rewards,
          fees: rewardsService.getTotalFeesCollected(),
        },
      });

      dispatch({ type: 'CLOSE_POSITION', payload: positionId });
    } catch (error) {
      console.error('Error closing position:', error);
      throw error;
    }
  };

  const setStopLoss = async (positionId: string, price: number) => {
    try {
      // Here you would typically make an API call to your backend
      const response = await fetch(`/api/futures/position/${positionId}/sl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });

      if (!response.ok) throw new Error('Failed to set stop loss');

      dispatch({
        type: 'SET_STOP_LOSS',
        payload: { positionId, price },
      });
    } catch (error) {
      console.error('Error setting stop loss:', error);
      throw error;
    }
  };

  const setTakeProfit = async (positionId: string, price: number) => {
    try {
      // Here you would typically make an API call to your backend
      const response = await fetch(`/api/futures/position/${positionId}/tp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });

      if (!response.ok) throw new Error('Failed to set take profit');

      dispatch({
        type: 'SET_TAKE_PROFIT',
        payload: { positionId, price },
      });
    } catch (error) {
      console.error('Error setting take profit:', error);
      throw error;
    }
  };

  return (
    <FuturesContext.Provider
      value={{
        state,
        openPosition,
        closePosition,
        setStopLoss,
        setTakeProfit,
      }}
    >
      {children}
    </FuturesContext.Provider>
  );
}

export const useFutures = () => {
  const context = useContext(FuturesContext);
  if (!context) {
    throw new Error('useFutures must be used within a FuturesProvider');
  }
  return context;
};
