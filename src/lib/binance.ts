import axios from 'axios';

class BinanceClient {
  private baseUrl = 'https://api.binance.com/api/v3';

  async getSOLPairs() {
    try {
      // Get exchange information to find all SOL pairs
      const response = await axios.get(`${this.baseUrl}/exchangeInfo`);
      const pairs = response.data.symbols.filter((symbol: any) => {
        // Get pairs where either base or quote asset is SOL
        return (
          (symbol.baseAsset === 'SOL' || symbol.quoteAsset === 'SOL') &&
          symbol.status === 'TRADING' &&
          !symbol.isSpotTradingAllowed
        );
      });

      // Get 24hr ticker price change for filtered pairs
      const tickerPromises = pairs.map((pair: any) =>
        axios.get(`${this.baseUrl}/ticker/24hr?symbol=${pair.symbol}`)
      );
      
      const tickerResponses = await Promise.all(tickerPromises);
      const pairsWithPriceData = pairs.map((pair: any, index: number) => ({
        ...pair,
        priceData: tickerResponses[index].data
      }));

      return pairsWithPriceData;
    } catch (error) {
      console.error('Binance API error:', error);
      return [];
    }
  }

  async getKlines(symbol: string, interval: string = '1d', limit: number = 100) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Binance Klines API error:', error);
      return [];
    }
  }
}

export const binanceClient = new BinanceClient();

export interface BinancePair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
  priceData: {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    lastPrice: string;
    volume: string;
    quoteVolume: string;
  };
}

export const BINANCE_INTERVALS = {
  '1m': '1m',
  '3m': '3m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '6h': '6h',
  '8h': '8h',
  '12h': '12h',
  '1d': '1d',
  '3d': '3d',
  '1w': '1w',
  '1M': '1M',
} as const;
