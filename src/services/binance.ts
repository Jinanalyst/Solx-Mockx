import { API_CONFIG } from '../config/api';

export interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteVolume: string;
  trades: number;
  buyBaseVolume: string;
  buyQuoteVolume: string;
}

export interface OrderBookData {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

class BinanceService {
  private static instance: BinanceService | null = null;
  private baseUrl = 'https://api.binance.com/api/v3';
  private wsUrl = 'wss://stream.binance.com:9443/ws';
  private ws: WebSocket | null = null;
  private priceListeners: Map<string, Set<(price: number) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentPrice: number | null = null;

  private constructor() {
    this.initializeWebSocket();
  }

  public static getInstance(): BinanceService {
    if (!BinanceService.instance) {
      BinanceService.instance = new BinanceService();
    }
    return BinanceService.instance;
  }

  private initializeWebSocket() {
    try {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.close();
      }

      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Subscribe to BTCUSDT ticker stream
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            method: 'SUBSCRIBE',
            params: ['btcusdt@ticker'],
            id: 1
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.e === '24hrTicker' && data.s === 'BTCUSDT') {
            const price = parseFloat(data.c);
            if (!isNaN(price)) {
              this.currentPrice = price;
              const listeners = this.priceListeners.get('btcusdt');
              if (listeners) {
                listeners.forEach(listener => listener(price));
              }
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      this.ws.onerror = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.initializeWebSocket(), 5000);
        }
      };

      this.ws.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.initializeWebSocket(), 5000);
        }
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  async getCurrentPrice(): Promise<number> {
    if (this.currentPrice !== null) {
      return this.currentPrice;
    }

    try {
      const response = await fetch(`${this.baseUrl}/ticker/price?symbol=BTCUSDT`);
      const data = await response.json();
      const price = parseFloat(data.price);
      this.currentPrice = price;
      return price;
    } catch (error) {
      console.error('Error fetching current price:', error);
      throw error;
    }
  }

  subscribeToPriceUpdates(symbol: string, callback: (price: number) => void) {
    const normalizedSymbol = symbol.toLowerCase();
    if (!this.priceListeners.has(normalizedSymbol)) {
      this.priceListeners.set(normalizedSymbol, new Set());
    }
    this.priceListeners.get(normalizedSymbol)?.add(callback);

    // Send initial price if available
    if (this.currentPrice !== null) {
      callback(this.currentPrice);
    }
  }

  unsubscribeFromPriceUpdates(symbol: string, callback: (price: number) => void) {
    const normalizedSymbol = symbol.toLowerCase();
    this.priceListeners.get(normalizedSymbol)?.delete(callback);
  }
}

export const binanceService = BinanceService.getInstance();
