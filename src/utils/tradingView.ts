export interface TradingPair {
  base: string;
  quote: string;
  description?: string;
}

export function formatTradingPair(base: string, quote: string): string {
  return `BINANCE:${base}${quote}`;
}

export const DEFAULT_TRADING_PAIRS: TradingPair[] = [
  { base: 'BTC', quote: 'USDT', description: 'Bitcoin/USDT' },
];

export function getTradingPairs(): Promise<TradingPair[]> {
  return Promise.resolve(DEFAULT_TRADING_PAIRS);
}
