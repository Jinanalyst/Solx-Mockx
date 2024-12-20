export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'open' | 'filled' | 'cancelled';

export interface MockOrder {
  id: string;
  userId: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  filled: number;
  status: OrderStatus;
  leverage: number;
  timestamp: number;
}

export interface MockPosition {
  id: string;
  userId: string;
  pair: string;
  side: OrderSide;
  entryPrice: number;
  amount: number;
  leverage: number;
  liquidationPrice: number;
  unrealizedPnL: number;
  timestamp: number;
}

export interface MockBalance {
  symbol: string;
  asset: string;
  free: number | BN;
  locked: number | BN;
}

export interface MockTrade {
  id: string;
  orderId: string;
  userId: string;
  pair: string;
  side: OrderSide;
  price: number;
  amount: number;
  fee: number;
  timestamp: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
  orders: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdateId: number;
}

export interface TradeHistory {
  trades: MockTrade[];
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  averageProfit: number;
  averageLoss: number;
}

export interface MockUser {
  id: string;
  balances: MockBalance[];
  positions: MockPosition[];
  orders: MockOrder[];
  trades: MockTrade[];
  performance: {
    totalPnL: number;
    winRate: number;
    totalTrades: number;
    averageProfit: number;
    averageLoss: number;
  };
}

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
