import { v4 as uuidv4 } from 'uuid';
import {
  MockOrder,
  MockPosition,
  MockBalance,
  MockTrade,
  OrderBook,
  MockUser,
  OrderSide,
  OrderType,
} from '@/types/mockTrading';
import { FeeCalculator } from '@/utils/feeCalculator';

export class MockTradingService {
  private static instance: MockTradingService;
  private users: Map<string, MockUser> = new Map();
  private orderBooks: Map<string, OrderBook> = new Map();
  private feeCalculator: FeeCalculator;

  private constructor() {
    this.feeCalculator = FeeCalculator.getInstance();
    this.initializeOrderBooks();
  }

  public static getInstance(): MockTradingService {
    if (!MockTradingService.instance) {
      MockTradingService.instance = new MockTradingService();
    }
    return MockTradingService.instance;
  }

  private initializeOrderBooks() {
    // Initialize with some mock data for MockX/USDT pair
    const mockOrderBook: OrderBook = {
      bids: Array.from({ length: 20 }, (_, i) => ({
        price: 10 - i * 0.1,
        amount: Math.random() * 1000,
        total: 0,
        orders: Math.floor(Math.random() * 10) + 1,
      })),
      asks: Array.from({ length: 20 }, (_, i) => ({
        price: 10 + i * 0.1,
        amount: Math.random() * 1000,
        total: 0,
        orders: Math.floor(Math.random() * 10) + 1,
      })),
      lastUpdateId: Date.now(),
    };

    // Calculate totals
    mockOrderBook.bids.forEach((bid, i) => {
      bid.total = bid.amount * bid.price + (i > 0 ? mockOrderBook.bids[i - 1].total : 0);
    });
    mockOrderBook.asks.forEach((ask, i) => {
      ask.total = ask.amount * ask.price + (i > 0 ? mockOrderBook.asks[i - 1].total : 0);
    });

    this.orderBooks.set('MOCKX/USDT', mockOrderBook);
  }

  public createUser(userId: string): MockUser {
    const newUser: MockUser = {
      id: userId,
      balances: [
        { asset: 'MOCKX', free: 100, locked: 0 },
        { asset: 'USDT', free: 1000, locked: 0 },
      ],
      positions: [],
      orders: [],
      trades: [],
      performance: {
        totalPnL: 0,
        winRate: 0,
        totalTrades: 0,
        averageProfit: 0,
        averageLoss: 0,
      },
    };
    this.users.set(userId, newUser);
    return newUser;
  }

  public placeOrder(
    userId: string,
    pair: string,
    side: OrderSide,
    type: OrderType,
    amount: number,
    price: number,
    leverage: number = 1
  ): MockOrder {
    const user = this.users.get(userId) || this.createUser(userId);
    const orderBook = this.orderBooks.get(pair);
    
    if (!orderBook) {
      throw new Error(`Order book not found for pair ${pair}`);
    }

    // Create new order
    const order: MockOrder = {
      id: uuidv4(),
      userId,
      pair,
      side,
      type,
      price,
      amount,
      filled: 0,
      status: 'open',
      leverage,
      timestamp: Date.now(),
    };

    // Calculate required margin and fees
    const totalPositionSize = amount * price * leverage;
    const fee = this.feeCalculator.calculateTradingFee({
      baseSize: amount,
      leverage,
      assetPrice: price,
    });

    // Check if user has sufficient balance
    const [baseAsset, quoteAsset] = pair.split('/');
    const requiredAsset = side === 'buy' ? quoteAsset : baseAsset;
    const requiredAmount = side === 'buy' ? 
      (totalPositionSize / leverage) + fee.totalFee : 
      amount;

    const balance = user.balances.find(b => b.asset === requiredAsset);
    if (!balance || balance.free < requiredAmount) {
      throw new Error(`Insufficient ${requiredAsset} balance`);
    }

    // Lock the required balance
    balance.free -= requiredAmount;
    balance.locked += requiredAmount;

    // Add order to user's orders
    user.orders.push(order);

    // If market order, execute immediately
    if (type === 'market') {
      this.executeOrder(order);
    }

    return order;
  }

  private executeOrder(order: MockOrder) {
    const user = this.users.get(order.userId);
    if (!user) return;

    const orderBook = this.orderBooks.get(order.pair);
    if (!orderBook) return;

    const [baseAsset, quoteAsset] = order.pair.split('/');
    const matchingOrders = order.side === 'buy' ? orderBook.asks : orderBook.bids;
    
    let remainingAmount = order.amount;
    let totalCost = 0;
    let averagePrice = 0;

    // Match with orders in the book
    for (const matchingOrder of matchingOrders) {
      if (remainingAmount <= 0) break;

      const matchAmount = Math.min(remainingAmount, matchingOrder.amount);
      const matchPrice = matchingOrder.price;

      // Create trade
      const trade: MockTrade = {
        id: uuidv4(),
        orderId: order.id,
        userId: order.userId,
        pair: order.pair,
        side: order.side,
        price: matchPrice,
        amount: matchAmount,
        fee: matchAmount * matchPrice * 0.001, // 0.1% fee
        timestamp: Date.now(),
      };

      // Update totals
      totalCost += matchAmount * matchPrice;
      remainingAmount -= matchAmount;
      order.filled += matchAmount;

      // Add trade to user's history
      user.trades.push(trade);
    }

    // Calculate average price
    averagePrice = totalCost / order.filled;

    // Update order status
    order.status = remainingAmount === 0 ? 'filled' : 'open';

    // Create position
    if (order.filled > 0) {
      const position: MockPosition = {
        id: uuidv4(),
        userId: order.userId,
        pair: order.pair,
        side: order.side,
        entryPrice: averagePrice,
        amount: order.filled,
        leverage: order.leverage,
        liquidationPrice: this.calculateLiquidationPrice(averagePrice, order.leverage, order.side === 'buy'),
        unrealizedPnL: 0,
        timestamp: Date.now(),
      };

      user.positions.push(position);
    }

    // Update user balances
    this.updateBalances(user, order, averagePrice);
  }

  private calculateLiquidationPrice(
    entryPrice: number,
    leverage: number,
    isLong: boolean,
    maintenanceMargin: number = 0.05
  ): number {
    const liquidationPercent = 1 / leverage * maintenanceMargin;
    return isLong
      ? entryPrice * (1 - liquidationPercent)
      : entryPrice * (1 + liquidationPercent);
  }

  private updateBalances(user: MockUser, order: MockOrder, executionPrice: number) {
    const [baseAsset, quoteAsset] = order.pair.split('/');
    const baseBalance = user.balances.find(b => b.asset === baseAsset);
    const quoteBalance = user.balances.find(b => b.asset === quoteAsset);

    if (!baseBalance || !quoteBalance) return;

    const tradedAmount = order.filled;
    const tradedValue = tradedAmount * executionPrice;

    if (order.side === 'buy') {
      baseBalance.free += tradedAmount;
      quoteBalance.locked -= tradedValue;
    } else {
      baseBalance.locked -= tradedAmount;
      quoteBalance.free += tradedValue;
    }
  }

  public getOrderBook(pair: string): OrderBook | undefined {
    return this.orderBooks.get(pair);
  }

  public getUserPositions(userId: string): MockPosition[] {
    return this.users.get(userId)?.positions || [];
  }

  public getUserBalances(userId: string): MockBalance[] {
    return this.users.get(userId)?.balances || [];
  }

  public getUserPerformance(userId: string): MockUser['performance'] {
    const user = this.users.get(userId);
    if (!user) return {
      totalPnL: 0,
      winRate: 0,
      totalTrades: 0,
      averageProfit: 0,
      averageLoss: 0,
    };

    const trades = user.trades;
    const profits = trades.filter(t => t.price > 0).map(t => t.price * t.amount);
    const losses = trades.filter(t => t.price < 0).map(t => t.price * t.amount);

    return {
      totalPnL: profits.reduce((a, b) => a + b, 0) + losses.reduce((a, b) => a + b, 0),
      winRate: profits.length / trades.length,
      totalTrades: trades.length,
      averageProfit: profits.length ? profits.reduce((a, b) => a + b, 0) / profits.length : 0,
      averageLoss: losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0,
    };
  }

  public getUserOrders(userId: string): MockOrder[] {
    const user = this.users.get(userId);
    return user?.orders || [];
  }

  public getUserTrades(userId: string): MockTrade[] {
    const user = this.users.get(userId);
    return user?.trades || [];
  }

  public closePosition(userId: string, positionId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const positionIndex = user.positions.findIndex(p => p.id === positionId);
    if (positionIndex === -1) return false;

    const position = user.positions[positionIndex];
    const orderBook = this.orderBooks.get(position.pair);
    if (!orderBook) return false;

    // Get current market price from the order book
    const currentPrice = position.side === 'buy' 
      ? orderBook.bids[0]?.price 
      : orderBook.asks[0]?.price;

    if (!currentPrice) return false;

    // Calculate PnL
    const pnl = position.side === 'buy'
      ? (currentPrice - position.entryPrice) * position.amount * position.leverage
      : (position.entryPrice - currentPrice) * position.amount * position.leverage;

    // Create closing trade
    const closingTrade: MockTrade = {
      id: uuidv4(),
      orderId: uuidv4(), // Generate a new order ID for the closing trade
      userId,
      pair: position.pair,
      side: position.side === 'buy' ? 'sell' : 'buy',
      price: currentPrice,
      amount: position.amount,
      fee: position.amount * currentPrice * 0.001, // 0.1% fee
      timestamp: Date.now(),
    };

    // Update user balances
    const [baseAsset, quoteAsset] = position.pair.split('/');
    const baseBalance = user.balances.find(b => b.asset === baseAsset);
    const quoteBalance = user.balances.find(b => b.asset === quoteAsset);

    if (baseBalance && quoteBalance) {
      const tradedValue = position.amount * currentPrice;
      const fee = closingTrade.fee;

      if (position.side === 'buy') {
        baseBalance.free -= position.amount;
        quoteBalance.free += tradedValue - fee;
      } else {
        baseBalance.free += position.amount;
        quoteBalance.free -= tradedValue + fee;
      }
    }

    // Add closing trade to history
    user.trades.push(closingTrade);

    // Remove position
    user.positions.splice(positionIndex, 1);

    return true;
  }
}
