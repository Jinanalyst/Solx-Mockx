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
  { asset: 'BTC', symbol: 'BTC', free: 1, locked: 0 },
  { asset: 'USDT', symbol: 'USDT', free: 100000, locked: 0 },
];

export interface MockTradingContextType {
  positions: MockPosition[];
  balances: MockBalance[];
  orders: MockOrder[];
  trades: MockTrade[];
  orderBook: OrderBook | undefined;
  performance: MockUser['performance'];
  selectedMarket: string;
  currentPrice: number;
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
  const [selectedMarket] = useState<string>('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [performance, setPerformance] = useState<MockUser['performance']>({
    totalPnL: 0,
    winRate: 0,
    totalTrades: 0,
    averageProfit: 0,
    averageLoss: 0,
  });

  const mockTradingService = MockTradingService.getInstance();

  // Update price every second
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const data = await response.json();
        setCurrentPrice(parseFloat(data.price));
      } catch (error) {
        console.error('Error fetching price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 1000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const placeOrder = useCallback(async (
    pair: string,
    side: OrderSide,
    type: OrderType,
    amount: number,
    price: number,
    leverage?: number
  ): Promise<MockOrder> => {
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
  }, [userId, refreshData]);

  const closePosition = useCallback(async (positionId: string) => {
    await mockTradingService.closePosition(userId, positionId);
    refreshData();
  }, [userId, refreshData]);

  const updateBalance = useCallback((
    symbol: string,
    amount: number,
    type: 'add' | 'subtract',
    balanceType: 'free' | 'locked'
  ) => {
    mockTradingService.updateBalance(userId, symbol, amount, type, balanceType);
    refreshData();
  }, [userId, refreshData]);

  const value = {
    positions,
    balances,
    orders,
    trades,
    orderBook,
    performance,
    selectedMarket,
    currentPrice,
    placeOrder,
    closePosition,
    refreshData,
    updateBalance,
  };

  return (
    <MockTradingContext.Provider value={value}>
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
