'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { MockTradingService } from '@/services/mockTradingService';
import {
  MockOrder,
  MockPosition,
  MockTrade,
  OrderBook,
  MockUser,
  OrderSide,
  OrderType,
} from '@/types/mockTrading';

export interface MockBalance {
  token: string;
  balance: number;
  usdValue: number;
}

interface MockTradingContextType {
  positions: MockPosition[];
  balances: MockBalance[];
  orders: MockOrder[];
  trades: MockTrade[];
  orderBook: OrderBook | undefined;
  performance: MockUser['performance'];
  selectedMarket: string;
  placeOrder: (
    pair: string,
    side: OrderSide,
    type: OrderType,
    amount: number,
    price: number,
    leverage?: number
  ) => Promise<MockOrder>;
  closePosition: (positionId: string) => Promise<void>;
  refreshData: () => void;
}

const MockTradingContext = createContext<MockTradingContextType | undefined>(undefined);

export function MockTradingProvider({ children }: { children: ReactNode }) {
  const [userId] = useState(() => 'mock-user-' + Math.random().toString(36).substr(2, 9));
  const [positions, setPositions] = useState<MockPosition[]>([]);
  const [balances, setBalances] = useState<MockBalance[]>([]);
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [trades, setTrades] = useState<MockTrade[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook>();
  const [selectedMarket, setSelectedMarket] = useState<string>('SOL/USDC');
  const [performance, setPerformance] = useState<MockUser['performance']>({
    totalPnL: 0,
    winRate: 0,
    totalTrades: 0,
    averageProfit: 0,
    averageLoss: 0,
  });

  const mockTradingService = MockTradingService.getInstance();

  const refreshData = useCallback(() => {
    try {
      const userData = mockTradingService.getUserData(userId);
      setPositions(userData.positions);
      setBalances(userData.balances);
      setOrders(userData.orders);
      setTrades(userData.trades);
      setPerformance(userData.performance);
      setOrderBook(mockTradingService.getOrderBook(selectedMarket));
    } catch (error) {
      console.error('Error refreshing mock trading data:', error);
    }
  }, [userId, selectedMarket]);

  const placeOrder = useCallback(async (
    pair: string,
    side: OrderSide,
    type: OrderType,
    amount: number,
    price: number,
    leverage?: number
  ): Promise<MockOrder> => {
    try {
      const order = await mockTradingService.placeOrder(
        userId,
        pair,
        side,
        type,
        amount,
        price,
        leverage
      );
      refreshData();
      return order;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }, [userId, refreshData]);

  const closePosition = useCallback(async (positionId: string): Promise<void> => {
    try {
      await mockTradingService.closePosition(userId, positionId);
      refreshData();
    } catch (error) {
      console.error('Error closing position:', error);
      throw error;
    }
  }, [userId, refreshData]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return (
    <MockTradingContext.Provider value={{
      positions,
      balances,
      orders,
      trades,
      orderBook,
      performance,
      selectedMarket,
      placeOrder,
      closePosition,
      refreshData,
    }}>
      {children}
    </MockTradingContext.Provider>
  );
}

export function useMockTrading() {
  const context = useContext(MockTradingContext);
  if (context === undefined) {
    throw new Error('useMockTrading must be used within a MockTradingProvider');
  }
  return context;
}
