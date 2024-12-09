import { API_ENDPOINTS, RaydiumPriceData } from '../config/api';
import { Time } from 'lightweight-charts';
import axios from 'axios';

class RaydiumService {
  private static instance: RaydiumService;

  private constructor() {}

  public static getInstance(): RaydiumService {
    if (!RaydiumService.instance) {
      RaydiumService.instance = new RaydiumService();
    }
    return RaydiumService.instance;
  }

  async fetchPriceHistory(baseSymbol: string, quoteSymbol: string = 'USDT'): Promise<RaydiumPriceData[]> {
    try {
      if (baseSymbol === 'SOLX' || baseSymbol === 'MOCKX') {
        // For SOLX and MOCKX, fetch from our API
        const response = await axios.get(`${API_ENDPOINTS.PRICE_HISTORY}/${baseSymbol}${quoteSymbol}`);
        return response.data.map((item: any) => ({
          time: item.timestamp as Time,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseFloat(item.volume)
        }));
      } else {
        // For other tokens, fetch from Raydium API
        const response = await axios.get(`${API_ENDPOINTS.RAYDIUM}/pairs/${baseSymbol}${quoteSymbol}/kline`, {
          params: {
            resolution: '1D',
            from: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
            to: Math.floor(Date.now() / 1000)
          }
        });
        
        return response.data.data.map((item: any) => ({
          time: item.time as Time,
          open: parseFloat(item.open),
          high: parseFloat(item.high),
          low: parseFloat(item.low),
          close: parseFloat(item.close),
          volume: parseFloat(item.volume)
        }));
      }
    } catch (error) {
      console.error('Error fetching price history:', error);
      // Return simulated data as fallback
      const now = Date.now();
      const mockData: RaydiumPriceData[] = Array.from({ length: 100 }, (_, i) => {
        const basePrice = baseSymbol === 'SOLX' ? 10 : 5; // SOLX at $10, MOCKX at $5
        const rand = Math.random() * 0.2 - 0.1; // ±10% variation
        return {
          time: (now - (99 - i) * 60000) / 1000 as Time,
          open: basePrice * (1 + rand),
          high: basePrice * (1 + rand + 0.05),
          low: basePrice * (1 + rand - 0.05),
          close: basePrice * (1 + rand),
          volume: 1000000 * Math.random()
        };
      });
      return mockData;
    }
  }
}

export const raydiumService = RaydiumService.getInstance();
