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
  MockBalance,
  MockTradingContextType,
} from '@/types/mockTrading';

const initialBalances: MockBalance[] = [
  { asset: 'SOLX', symbol: 'SOLX', free: 1000, locked: 0 },
  { asset: 'MOCKX', symbol: 'MOCKX', free: 5000, locked: 0 },
  { asset: 'USDC', symbol: 'USDC', free: 10000, locked: 0 },
];

export interface MockTradingContextType {
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
  updateBalance: (symbol: string, amount: number, type: 'add' | 'subtract', balanceType: 'free' | 'locked') => void;
}

const MockTradingContext = createContext<MockTradingContextType | undefined>(undefined);

export function MockTradingProvider({ children }: { children: ReactNode }) {
  const [userId] = useState(() => 'mock-user-' + Math.random().toString(36).substr(2, 9));
  const [positions, setPositions] = useState<MockPosition[]>([]);
  const [balances, setBalances] = useState<MockBalance[]>(initialBalances);
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
      setPositions(mockTradingService.getUserPositions(userId));
      setBalances(mockTradingService.getUserBalances(userId));
      setOrders(mockTradingService.getUserOrders(userId) || []);
      setTrades(mockTradingService.getUserTrades(userId) || []);
      setPerformance(mockTradingService.getUserPerformance(userId));
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

  const updateBalance = useCallback((symbol: string, amount: number, type: 'add' | 'subtract', balanceType: 'free' | 'locked') => {
    setBalances(prevBalances => {
      return prevBalances.map(balance => {
        if (balance.symbol === symbol) {
          const currentAmount = balance[balanceType];
          const newAmount = type === 'add' ? currentAmount + amount : currentAmount - amount;
          return {
            ...balance,
            [balanceType]: Math.max(0, newAmount)
          };
        }
        return balance;
      });
    });
  }, []);

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
      updateBalance,
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
