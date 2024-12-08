import { API_CONFIG, BINANCE_ENDPOINTS } from '../config/api';

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
  private baseUrl: string;
  private wsUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BINANCE_API_URL;
    this.wsUrl = API_CONFIG.BINANCE_WEBSOCKET_URL;
  }

  async getPairPrice(baseSymbol: string, quoteSymbol: string = 'SOL'): Promise<number> {
    try {
      const symbol = `${baseSymbol}${quoteSymbol}`.toUpperCase();
      const response = await fetch(`${this.baseUrl}${BINANCE_ENDPOINTS.ticker}?symbol=${symbol}`);
      const data = await response.json();
      return parseFloat(data.lastPrice);
    } catch (error) {
      console.error(`Error fetching ${baseSymbol}/${quoteSymbol} price:`, error);
      throw error;
    }
  }

  subscribeToPairTicker(baseSymbol: string, quoteSymbol: string = 'SOL', onMessage: (data: any) => void): WebSocket {
    const ws = new WebSocket(this.wsUrl);
    const symbol = `${baseSymbol}${quoteSymbol}`.toLowerCase();
    const subscribeMsg = {
      method: 'SUBSCRIBE',
      params: [
        `${symbol}@ticker`,
        `${symbol}@depth20`,
        `${symbol}@kline_1m`
      ],
      id: 1
    };

    ws.onopen = () => {
      ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }

  async getKlines(baseSymbol: string, quoteSymbol: string = 'SOL', interval: string = '1d', limit: number = 100): Promise<KlineData[]> {
    try {
      const symbol = `${baseSymbol}${quoteSymbol}`.toUpperCase();
      const response = await fetch(
        `${this.baseUrl}${BINANCE_ENDPOINTS.klines}?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      const data = await response.json();
      
      return data.map((item: any[]) => ({
        openTime: item[0],
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
        volume: item[5],
        closeTime: item[6],
        quoteVolume: item[7],
        trades: item[8],
        buyBaseVolume: item[9],
        buyQuoteVolume: item[10]
      }));
    } catch (error) {
      console.error(`Error fetching ${baseSymbol}/${quoteSymbol} klines:`, error);
      throw error;
    }
  }

  async getOrderBook(baseSymbol: string, quoteSymbol: string = 'SOL', limit: number = 20): Promise<OrderBookData> {
    try {
      const symbol = `${baseSymbol}${quoteSymbol}`.toUpperCase();
      const response = await fetch(
        `${this.baseUrl}${BINANCE_ENDPOINTS.depth}?symbol=${symbol}&limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${baseSymbol}/${quoteSymbol} order book:`, error);
      throw error;
    }
  }

  async getAvailablePairs(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/exchangeInfo`);
      const data = await response.json();
      return data.symbols
        .filter((symbol: any) => symbol.quoteAsset === 'SOL')
        .map((symbol: any) => symbol.baseAsset);
    } catch (error) {
      console.error('Error fetching available pairs:', error);
      throw error;
    }
  }
}

export const binanceService = new BinanceService();
