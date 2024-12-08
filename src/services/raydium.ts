import { API_ENDPOINTS, RaydiumPriceData } from '../config/api';
import { Time } from 'lightweight-charts';

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
      // For now, return mock data
      const now = Date.now();
      const mockData: RaydiumPriceData[] = Array.from({ length: 100 }, (_, i) => ({
        time: (now - (99 - i) * 60000) / 1000 as Time,
        open: 10 + Math.random(),
        high: 11 + Math.random(),
        low: 9 + Math.random(),
        close: 10 + Math.random(),
        volume: 1000000 * Math.random()
      }));
      return mockData;
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    }
  }
}

export const raydiumService = RaydiumService.getInstance();
