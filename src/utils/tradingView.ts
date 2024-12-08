export interface TradingPair {
  base: string;
  quote: string;
  description?: string;
}

export function formatTradingPair(base: string, quote: string): string {
  // Format for TradingView (e.g., "BINANCE:BTCUSDT")
  return `BINANCE:${base}${quote}`;
}

export const DEFAULT_TRADING_PAIRS: TradingPair[] = [
  { base: 'BTC', quote: 'USDT', description: 'Bitcoin/USDT' },
  { base: 'ETH', quote: 'USDT', description: 'Ethereum/USDT' },
  { base: 'SOL', quote: 'USDT', description: 'Solana/USDT' },
  { base: 'SOLX', quote: 'USDT', description: 'SOLX/USDT' },
  { base: 'MOCKX', quote: 'USDT', description: 'MOCKX/USDT' },
];

export function getTradingPairs(): Promise<TradingPair[]> {
  // In the future, this will fetch from your API
  return Promise.resolve(DEFAULT_TRADING_PAIRS);
}
