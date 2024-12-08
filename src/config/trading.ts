import { PublicKey } from '@solana/web3.js';
import { FeeCalculator } from '@/utils/feeCalculator';

// Token addresses as strings for safer SSR
const TOKEN_ADDRESSES = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  ORCA: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
  MNGO: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',
  MOCKX: 'Hr3p3tS5e3SaRLW9pJrnPHYmfx9po18c1crwd1ZNSyYE'
} as const;

// Create PublicKeys only on client side
export const SUPPORTED_TOKENS = {
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    mint: TOKEN_ADDRESSES.SOL,
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: TOKEN_ADDRESSES.USDC,
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  BONK: {
    symbol: 'BONK',
    name: 'Bonk',
    mint: TOKEN_ADDRESSES.BONK,
    decimals: 5,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png'
  },
  JUP: {
    symbol: 'JUP',
    name: 'Jupiter',
    mint: TOKEN_ADDRESSES.JUP,
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN/logo.png'
  },
  ORCA: {
    symbol: 'ORCA',
    name: 'Orca',
    mint: TOKEN_ADDRESSES.ORCA,
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png'
  },
  MNGO: {
    symbol: 'MNGO',
    name: 'Mango',
    mint: TOKEN_ADDRESSES.MNGO,
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac/logo.png'
  },
  MOCKX: {
    symbol: 'MOCKX',
    name: 'MockX',
    mint: TOKEN_ADDRESSES.MOCKX,
    decimals: 9,
    logoURI: ''
  }
} as const;

export const TRADING_CONFIG = {
  // Leverage settings
  maxLeverage: 20,
  minLeverage: 1,
  defaultLeverage: 10,
  leverageStep: 1,
  
  // Position limits
  minPositionSize: 0.1, // Minimum position size in SOL
  maxPositionSize: 1000, // Maximum position size in SOL
  
  // Fee settings
  feeCalculator: FeeCalculator.getInstance(),
  
  // Margin requirements
  maintenanceMargin: 0.05, // 5% maintenance margin
  initialMargin: 0.1,      // 10% initial margin requirement
  
  // Price impact settings
  maxPriceImpact: 0.01,    // 1% max price impact
  
  // Liquidation settings
  liquidationThreshold: 0.075, // 7.5% equity threshold for liquidation
  
  // Order types supported
  orderTypes: ['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'] as const,
  
  // Time in force options
  timeInForce: ['GTC', 'IOC', 'FOK'] as const,

  // Additional settings
  minOrderSize: 0.1,
  tickSize: 0.01,
  tradingPairs: ['BTC/USDC', 'ETH/USDC', 'SOL/USDC']
} as const;

export type OrderType = typeof TRADING_CONFIG.orderTypes[number];
export type TimeInForce = typeof TRADING_CONFIG.timeInForce[number];

// Helper function to calculate required margin
export const calculateRequiredMargin = (positionSize: number, leverage: number): number => {
  return positionSize / leverage;
};

// Helper function to calculate liquidation price
export const calculateLiquidationPrice = (
  entryPrice: number,
  leverage: number,
  isLong: boolean
): number => {
  const maintenanceMargin = TRADING_CONFIG.maintenanceMargin;
  if (isLong) {
    return entryPrice * (1 - (1 / leverage) + maintenanceMargin);
  } else {
    return entryPrice * (1 + (1 / leverage) - maintenanceMargin);
  }
};

export const TRADING_PAIRS = [
  {
    name: 'SOL/USDC',
    baseMint: TOKEN_ADDRESSES.SOL,
    quoteMint: TOKEN_ADDRESSES.USDC,
    baseDecimals: SUPPORTED_TOKENS.SOL.decimals,
    quoteDecimals: SUPPORTED_TOKENS.USDC.decimals,
    popularity: 100,
    fee: 0.0025,
    source: 'Raydium'
  },
  {
    name: 'BONK/USDC',
    baseMint: TOKEN_ADDRESSES.BONK,
    quoteMint: TOKEN_ADDRESSES.USDC,
    baseDecimals: SUPPORTED_TOKENS.BONK.decimals,
    quoteDecimals: SUPPORTED_TOKENS.USDC.decimals,
    popularity: 90,
    fee: 0.0025,
    source: 'Raydium'
  },
  {
    name: 'JUP/USDC',
    baseMint: TOKEN_ADDRESSES.JUP,
    quoteMint: TOKEN_ADDRESSES.USDC,
    baseDecimals: SUPPORTED_TOKENS.JUP.decimals,
    quoteDecimals: SUPPORTED_TOKENS.USDC.decimals,
    popularity: 85,
    fee: 0.0025,
    source: 'Raydium'
  },
  {
    name: 'ORCA/USDC',
    baseMint: TOKEN_ADDRESSES.ORCA,
    quoteMint: TOKEN_ADDRESSES.USDC,
    baseDecimals: SUPPORTED_TOKENS.ORCA.decimals,
    quoteDecimals: SUPPORTED_TOKENS.USDC.decimals,
    popularity: 80,
    fee: 0.0025,
    source: 'Raydium'
  },
  {
    name: 'BONK/SOL',
    baseMint: TOKEN_ADDRESSES.BONK,
    quoteMint: TOKEN_ADDRESSES.SOL,
    baseDecimals: SUPPORTED_TOKENS.BONK.decimals,
    quoteDecimals: SUPPORTED_TOKENS.SOL.decimals,
    popularity: 75,
    fee: 0.0025,
    source: 'Raydium'
  },
  {
    name: 'JUP/SOL',
    baseMint: TOKEN_ADDRESSES.JUP,
    quoteMint: TOKEN_ADDRESSES.SOL,
    baseDecimals: SUPPORTED_TOKENS.JUP.decimals,
    quoteDecimals: SUPPORTED_TOKENS.SOL.decimals,
    popularity: 70,
    fee: 0.0025,
    source: 'Raydium'
  },
  {
    name: 'MOCKX/USDC',
    baseMint: TOKEN_ADDRESSES.MOCKX,
    quoteMint: TOKEN_ADDRESSES.USDC,
    baseDecimals: SUPPORTED_TOKENS.MOCKX.decimals,
    quoteDecimals: SUPPORTED_TOKENS.USDC.decimals,
    minOrderSize: 0.1,
    tickSize: 0.01,
  },
  {
    name: 'MOCKX/SOL',
    baseMint: TOKEN_ADDRESSES.MOCKX,
    quoteMint: TOKEN_ADDRESSES.SOL,
    baseDecimals: SUPPORTED_TOKENS.MOCKX.decimals,
    quoteDecimals: SUPPORTED_TOKENS.SOL.decimals,
    minOrderSize: 0.1,
    tickSize: 0.01,
  },
] as const;

// Mock trading configuration
export const MOCK_TRADING_CONFIG = {
  // Initial mock balances
  initialBalances: {
    MOCKX: 1000,
    USDC: 10000,
    SOL: 100,
  },
  
  // Fee structure
  fees: {
    maker: 0.001, // 0.1%
    taker: 0.002, // 0.2%
  },
  
  // Leverage settings
  leverage: {
    max: 100,
    default: 1,
    step: 1,
  },
  
  // Position limits
  limits: {
    minSize: 0.1,
    maxSize: 10000,
    maxOpenPositions: 10,
  },
  
  // Price simulation settings
  priceSimulation: {
    volatility: 0.001, // 0.1% price movement
    updateInterval: 1000, // 1 second
  },
} as const;

// Trading view chart configuration
export const CHART_CONFIG = {
  symbol: 'MOCKX',
  interval: '1D',
  containerId: 'tradingview_chart',
  libraryPath: '/charting_library/',
  chartsStorageUrl: 'https://saveload.tradingview.com',
  chartsStorageApiVersion: '1.1',
  clientId: 'tradingview.com',
  userId: 'public_user',
  fullscreen: false,
  autosize: true,
} as const;
