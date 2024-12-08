import { PublicKey } from '@solana/web3.js';

export interface TokenInfo {
  symbol: string;
  name: string;
  mint: PublicKey;
  decimals: number;
  logoURI?: string;
}

export interface TradingPair {
  name: string;
  baseMint: string;
  quoteMint: string;
  baseDecimals: number;
  quoteDecimals: number;
  popularity?: number;  // Added for popularity sorting
  fee?: number;        // Added for fee sorting
  source?: string;     // Added to track the source of the trading pair (e.g., 'Raydium', 'Serum')
}

export interface MarketData {
  pair: string;
  lastPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  change24h: number;
  baseVolume24h: number;
  quoteVolume24h: number;
  timestamp: number;
  popularity: number;    // Added for popularity metric
  fee: number;          // Trading fee percentage
}

export type SortField = 'price' | 'change' | 'volume' | 'popularity' | 'fee';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  search: string;
  quoteCurrency: string;
  minVolume?: number;
  maxFee?: number;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

export interface OrderBook {
  pair: string;
  bids: PriceLevel[];
  asks: PriceLevel[];
  timestamp: number;
}

export interface PriceLevel {
  price: number;
  size: number;
  total: number;
}

export interface Trade {
  pair: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
  txid?: string;
}

export interface Ticker {
  pair: string;
  bid: number;
  ask: number;
  lastPrice: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  change24h: number;
  timestamp: number;
}
