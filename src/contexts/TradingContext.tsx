'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP_LIMIT' | 'OCO';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'OPEN' | 'FILLED' | 'CANCELLED' | 'REJECTED';
export type PositionSide = 'LONG' | 'SHORT';

export interface OrderParams {
  market: string;
  side: OrderSide;
  type: OrderType;
  size: number;
  price?: number;
  stopPrice?: number;
  limitPrice?: number;
  leverage?: number;
  expiry?: number;
  postOnly?: boolean;
  reduceOnly?: boolean;
}

export interface Order extends OrderParams {
  id: string;
  status: OrderStatus;
  filledSize: number;
  remainingSize: number;
  avgFillPrice?: number;
  createdAt: number;
  updatedAt: number;
  clientId?: string;
}

export interface Position {
  market: string;
  side: PositionSide;
  size: number;
  notional: number;
  leverage: number;
  entryPrice: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  collateral: number;
  marginRatio: number;
  createdAt: number;
  updatedAt: number;
}

interface TradingContextType {
  // Order Management
  orders: Order[];
  positions: Position[];
  placeLimitOrder: (params: OrderParams) => Promise<string>;
  placeMarketOrder: (params: OrderParams) => Promise<string>;
  placeStopLimitOrder: (params: OrderParams) => Promise<string>;
  placeOCOOrder: (params: OrderParams) => Promise<string>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  cancelAllOrders: (market?: string) => Promise<boolean>;
  
  // Position Management
  getPosition: (market: string) => Position | null;
  closePosition: (market: string, size?: number) => Promise<string>;
  updateLeverage: (market: string, leverage: number) => Promise<boolean>;
  addCollateral: (market: string, amount: number) => Promise<boolean>;
  removeCollateral: (market: string, amount: number) => Promise<boolean>;
  
  // Market Data
  markPrice: { [market: string]: number };
  indexPrice: { [market: string]: number };
  fundingRate: { [market: string]: number };
  
  // Risk Management
  marginRatio: { [market: string]: number };
  availableBalance: number;
  totalCollateral: number;
  totalUnrealizedPnl: number;
  totalRealizedPnl: number;
  
  // Loading States
  isLoading: boolean;
  error: string | null;
}

const TradingContext = createContext<TradingContextType | null>(null);

export function TradingProvider({ children }: { children: ReactNode }) {
  const { publicKey, connection } = useWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [markPrice, setMarkPrice] = useState<{ [market: string]: number }>({});
  const [indexPrice, setIndexPrice] = useState<{ [market: string]: number }>({});
  const [fundingRate, setFundingRate] = useState<{ [market: string]: number }>({});
  const [marginRatio, setMarginRatio] = useState<{ [market: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    if (publicKey) {
      loadUserData();
      subscribeToUpdates();
    }
    return () => {
      // Cleanup subscriptions
    };
  }, [publicKey]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Load user orders and positions
      // This would interact with your Solana program
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    // Subscribe to WebSocket updates for orders, positions, and market data
  };

  const placeLimitOrder = async (params: OrderParams): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      // Validate parameters
      if (!params.price) throw new Error('Price is required for limit orders');
      
      // Create and send the transaction
      // This would interact with your Solana program
      
      return 'order-id';
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const placeMarketOrder = async (params: OrderParams): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      // Create and send the transaction
      // This would interact with your Solana program
      
      return 'order-id';
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const placeStopLimitOrder = async (params: OrderParams): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      // Validate parameters
      if (!params.stopPrice || !params.limitPrice) {
        throw new Error('Stop price and limit price are required for stop-limit orders');
      }
      
      // Create and send the transaction
      // This would interact with your Solana program
      
      return 'order-id';
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const placeOCOOrder = async (params: OrderParams): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      // Validate parameters
      if (!params.price || !params.stopPrice) {
        throw new Error('Price and stop price are required for OCO orders');
      }
      
      // Create and send the transaction
      // This would interact with your Solana program
      
      return 'order-id';
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      // Send cancel order transaction
      // This would interact with your Solana program
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const cancelAllOrders = async (market?: string): Promise<boolean> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      // Send cancel all orders transaction
      // This would interact with your Solana program
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getPosition = (market: string): Position | null => {
    return positions.find(p => p.market === market) || null;
  };

  const closePosition = async (market: string, size?: number): Promise<string> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      const position = getPosition(market);
      if (!position) throw new Error('No position found');
      
      // Create market order to close position
      return placeMarketOrder({
        market,
        side: position.side === 'LONG' ? 'SELL' : 'BUY',
        type: 'MARKET',
        size: size || position.size,
        reduceOnly: true,
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateLeverage = async (market: string, leverage: number): Promise<boolean> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      // Validate leverage
      if (leverage < 1 || leverage > 20) {
        throw new Error('Leverage must be between 1x and 20x');
      }
      
      // Send update leverage transaction
      // This would interact with your Solana program
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addCollateral = async (market: string, amount: number): Promise<boolean> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      // Send add collateral transaction
      // This would interact with your Solana program
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeCollateral = async (market: string, amount: number): Promise<boolean> => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      // Validate removal amount against position risk
      // Send remove collateral transaction
      // This would interact with your Solana program
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Calculate risk metrics
  const calculateRiskMetrics = () => {
    let totalUnrealized = 0;
    let totalRealized = 0;
    let totalCollateralValue = 0;

    positions.forEach(position => {
      totalUnrealized += position.unrealizedPnl;
      totalRealized += position.realizedPnl;
      totalCollateralValue += position.collateral;
    });

    return {
      totalUnrealizedPnl: totalUnrealized,
      totalRealizedPnl: totalRealized,
      totalCollateral: totalCollateralValue,
      availableBalance: totalCollateralValue + totalUnrealized,
    };
  };

  const riskMetrics = calculateRiskMetrics();

  return (
    <TradingContext.Provider
      value={{
        // Order Management
        orders,
        positions,
        placeLimitOrder,
        placeMarketOrder,
        placeStopLimitOrder,
        placeOCOOrder,
        cancelOrder,
        cancelAllOrders,
        
        // Position Management
        getPosition,
        closePosition,
        updateLeverage,
        addCollateral,
        removeCollateral,
        
        // Market Data
        markPrice,
        indexPrice,
        fundingRate,
        
        // Risk Management
        marginRatio,
        ...riskMetrics,
        
        // Loading States
        isLoading,
        error,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export function useTradingContext() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTradingContext must be used within a TradingProvider');
  }
  return context;
}
