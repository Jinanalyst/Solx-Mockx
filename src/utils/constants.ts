// API Constants
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.solx.com';
export const API_TIMEOUT = 30000; // 30 seconds

// Cache Constants
export const CACHE_TTL = 60 * 1000; // 1 minute
export const MARKET_DATA_REFRESH_INTERVAL = 10 * 1000; // 10 seconds

// Trading Constants
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const MAX_SLIPPAGE = 5; // 5%
export const MIN_TRADE_AMOUNT = 0.001;
export const DUST_THRESHOLD = 0.00001;

// Token Constants
export const NATIVE_SOL_MINT = 'So11111111111111111111111111111111111111112';
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// UI Constants
export const MOBILE_BREAKPOINT = 768;
export const DESKTOP_BREAKPOINT = 1024;
export const TOAST_DURATION = 5000;

// Network Constants
export const RPC_ENDPOINTS = {
  MAINNET: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
  DEVNET: 'https://api.devnet.solana.com',
};

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  INVALID_AMOUNT: 'Invalid amount',
  NETWORK_ERROR: 'Network error occurred',
  TRANSACTION_FAILED: 'Transaction failed',
} as const;
