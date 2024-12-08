import { PublicKey } from '@solana/web3.js';
import { Time } from 'lightweight-charts';

export const MAINNET_PROGRAM_ID = {
  OPENBOOK_MARKET: new PublicKey('srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX'),
  SERUM_MARKET: new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'),
};

export const RPC_ENDPOINTS = {
  MAINNET: 'https://api.mainnet-beta.solana.com',
  MAINNET_GENESYS: 'https://ssc-dao.genesysgo.net',
};

// Common token mints on Mainnet
export const TOKEN_MINTS = {
  SOL: new PublicKey('So11111111111111111111111111111111111111112'),
  USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  RAY: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'),
  SRM: new PublicKey('SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'),
  WSOL: new PublicKey('So11111111111111111111111111111111111111112'),
  BONK: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
  JUP: new PublicKey('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'),
  ORCA: new PublicKey('orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'),
  MNGO: new PublicKey('MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'),
} as const;

export interface RaydiumPriceData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const API_CONFIG = {
  JUPITER_API_URL: 'https://price.jup.ag/v4',
  SERUM_RPC_ENDPOINT: 'https://api.mainnet-beta.solana.com',
  RAYDIUM_API_URL: 'https://api.raydium.io/v2',
  BIRDEYE_API_KEY: process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || 'your-api-key-here'
};

export const JUPITER_ENDPOINTS = {
  quote: '/quote',
  swap: '/swap',
  price: '/price'
};

export const RAYDIUM_ENDPOINTS = {
  pairs: '/pairs',
  markets: '/markets',
  chart: (baseSymbol: string, interval: string, from: number, to: number) =>
    `${API_CONFIG.RAYDIUM_API_URL}/chart?baseSymbol=${baseSymbol}&interval=${interval}&from=${from}&to=${to}`,
};

export const API_ENDPOINTS = {
  jupiter: {
    quote: `${API_CONFIG.JUPITER_API_URL}${JUPITER_ENDPOINTS.quote}`,
    swap: `${API_CONFIG.JUPITER_API_URL}${JUPITER_ENDPOINTS.swap}`,
    price: `${API_CONFIG.JUPITER_API_URL}${JUPITER_ENDPOINTS.price}`,
  },
  raydium: RAYDIUM_ENDPOINTS,
};

export const RAYDIUM_POOLS = {
  'SOL/USDC': {
    id: 'SOL_USDC_POOL',
    baseMint: TOKEN_MINTS.SOL,
    quoteMint: TOKEN_MINTS.USDC,
    lpMint: new PublicKey('8HoQnePLqPj4M7PUDzfw8e3Ymdwgc7NLGnaTUapubyvu'),
    version: 4,
    programId: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
  },
  'RAY/USDC': {
    id: 'RAY_USDC_POOL',
    baseMint: TOKEN_MINTS.RAY,
    quoteMint: TOKEN_MINTS.USDC,
    lpMint: new PublicKey('FbC6K13MzHvN42bXrtGaWsvZY9fxrackRSZcBGfjPc7m'),
    version: 4,
    programId: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'),
  },
};

export const SERUM_MARKETS = {
  'SOL/USDC': {
    address: new PublicKey('9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'),
    programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    baseMint: TOKEN_MINTS.SOL,
    quoteMint: TOKEN_MINTS.USDC,
  },
  'RAY/USDC': {
    address: new PublicKey('2xiv8A5xrJ7RnGdxXB42uFEkYHJjszEhaJyKKt4WaLep'),
    programId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
    baseMint: TOKEN_MINTS.RAY,
    quoteMint: TOKEN_MINTS.USDC,
  },
};
