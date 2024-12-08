'use client';

import { useEffect, useState } from 'react';
import { getFTXWebSocket } from '@/lib/websocket/ftx';

export interface Balance {
  coin: string;
  total: number;
  free: number;
  availableForWithdrawal: number;
  usdValue: number;
  spotBorrow: number;
}

export interface Position {
  future: string;
  size: number;
  side: 'buy' | 'sell';
  netSize: number;
  longOrderSize: number;
  shortOrderSize: number;
  cost: number;
  entryPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  initialMarginRequirement: number;
  maintenanceMarginRequirement: number;
  openSize: number;
  collateralUsed: number;
  estimatedLiquidationPrice: number;
}

export interface Order {
  id: number;
  market: string;
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  price: number;
  size: number;
  filledSize: number;
  remainingSize: number;
  avgFillPrice: number;
  status: 'new' | 'open' | 'closed' | 'cancelled';
  createdAt: string;
  reduceOnly: boolean;
  ioc: boolean;
  postOnly: boolean;
  clientId: string;
}

export interface Trade {
  id: number;
  market: string;
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  price: number;
  size: number;
  fee: number;
  feeCurrency: string;
  liquidity: 'maker' | 'taker';
  time: string;
  orderId: number;
}

export interface UserTradingData {
  balances: Balance[];
  positions: Position[];
  openOrders: Order[];
  orderHistory: Order[];
  tradeHistory: Trade[];
  isLoading: boolean;
  error: Error | null;
}

export function useUserTradingData() {
  const [data, setData] = useState<UserTradingData>({
    balances: [],
    positions: [],
    openOrders: [],
    orderHistory: [],
    tradeHistory: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const ws = getFTXWebSocket();

    // Subscribe to balances
    ws.subscribe('balances', '', (balances) => {
      setData(prev => ({ ...prev, balances }));
    });

    // Subscribe to positions
    ws.subscribe('positions', '', (positions) => {
      setData(prev => ({ ...prev, positions }));
    });

    // Subscribe to orders
    ws.subscribe('orders', '', (orders) => {
      const { open, history } = orders;
      setData(prev => ({
        ...prev,
        openOrders: open,
        orderHistory: history,
      }));
    });

    // Subscribe to fills (trades)
    ws.subscribe('fills', '', (trades) => {
      setData(prev => ({ ...prev, tradeHistory: trades }));
    });

    // Mock data for development
    const mockData = {
      balances: [
        {
          coin: 'USD',
          total: 10000,
          free: 8000,
          availableForWithdrawal: 8000,
          usdValue: 10000,
          spotBorrow: 0,
        },
        {
          coin: 'SOL',
          total: 100,
          free: 80,
          availableForWithdrawal: 80,
          usdValue: 2000,
          spotBorrow: 0,
        },
      ],
      positions: [
        {
          future: 'SOL-PERP',
          size: 10,
          side: 'buy' as const,
          netSize: 10,
          longOrderSize: 10,
          shortOrderSize: 0,
          cost: 200,
          entryPrice: 20,
          unrealizedPnl: 50,
          realizedPnl: 100,
          initialMarginRequirement: 0.1,
          maintenanceMarginRequirement: 0.05,
          openSize: 10,
          collateralUsed: 20,
          estimatedLiquidationPrice: 15,
        },
      ],
      openOrders: [
        {
          id: 1,
          market: 'SOL/USD',
          type: 'limit' as const,
          side: 'buy' as const,
          price: 19.5,
          size: 5,
          filledSize: 0,
          remainingSize: 5,
          avgFillPrice: 0,
          status: 'open' as const,
          createdAt: new Date().toISOString(),
          reduceOnly: false,
          ioc: false,
          postOnly: true,
          clientId: '1',
        },
      ],
      orderHistory: [],
      tradeHistory: [
        {
          id: 1,
          market: 'SOL/USD',
          type: 'limit' as const,
          side: 'buy' as const,
          price: 20,
          size: 5,
          fee: 0.1,
          feeCurrency: 'USD',
          liquidity: 'maker' as const,
          time: new Date().toISOString(),
          orderId: 1,
        },
      ],
    };

    // Set mock data and loading state
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        ...mockData,
        isLoading: false,
      }));
    }, 1000);

    return () => {
      ws.unsubscribe('balances', '', () => {});
      ws.unsubscribe('positions', '', () => {});
      ws.unsubscribe('orders', '', () => {});
      ws.unsubscribe('fills', '', () => {});
    };
  }, []);

  return data;
}
