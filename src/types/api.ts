export interface TokenPrice {
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  last_updated: string;
}

export interface TokenMetadata {
  id: string;
  symbol: string;
  name: string;
  image: string;
  market_cap: number;
  market_cap_rank: number;
}

export interface TokenData extends TokenPrice, TokenMetadata {}

export interface SwapRoute {
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  marketInfos: MarketInfo[];
  slippageBps: number;
  otherAmountThreshold: string;
  swapMode: string;
}

export interface MarketInfo {
  id: string;
  label: string;
  inputMint: string;
  outputMint: string;
  notEnoughLiquidity: boolean;
  inAmount: string;
  outAmount: string;
  lpFee: {
    amount: string;
    mint: string;
    pct: number;
  };
  platformFee: {
    amount: string;
    mint: string;
    pct: number;
  };
}

export interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  routes: SwapRoute[];
  contextSlot: number;
}

export interface SwapTransaction {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

export type ApiErrorCode = 
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE'
  | 'TOKEN_NOT_FOUND'
  | 'INSUFFICIENT_LIQUIDITY'
  | 'TRANSACTION_FAILED';

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
