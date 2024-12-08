import { PublicKey } from '@solana/web3.js';
import { QuoteResponse, SwapRoute, SwapTransaction, ApiError } from '../types/api';
import { quoteCache, jupiterLimiter, fetchWithRetry, handleApiError } from './api';

const JUPITER_API_URL = process.env.NEXT_PUBLIC_JUPITER_API_URL || 'https://quote-api.jup.ag/v6';
const DEFAULT_SLIPPAGE = Number(process.env.NEXT_PUBLIC_JUPITER_SLIPPAGE_BPS) || 50;

export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = DEFAULT_SLIPPAGE
): Promise<QuoteResponse> {
  try {
    // Validate input and output mints
    try {
      new PublicKey(inputMint);
      new PublicKey(outputMint);
    } catch {
      throw new ApiError('INVALID_RESPONSE', 'Invalid token mint address');
    }

    // Check cache for recent quote
    const cacheKey = `${inputMint}-${outputMint}-${amount}-${slippageBps}`;
    const cachedQuote = quoteCache.get(cacheKey);
    if (cachedQuote) {
      return cachedQuote;
    }

    // Check rate limit
    await jupiterLimiter.checkLimit();

    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: 'false',
      asLegacyTransaction: 'false',
    });

    const response = await fetchWithRetry(
      `${JUPITER_API_URL}/quote?${params.toString()}`
    );

    const data: QuoteResponse = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new ApiError('INSUFFICIENT_LIQUIDITY', 'No routes found for swap');
    }

    // Cache the quote
    quoteCache.set(cacheKey, data);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getJupiterSwap(
  route: SwapRoute,
  userPublicKey: string
): Promise<SwapTransaction> {
  try {
    // Validate public key
    try {
      new PublicKey(userPublicKey);
    } catch {
      throw new ApiError('INVALID_RESPONSE', 'Invalid user public key');
    }

    // Check rate limit
    await jupiterLimiter.checkLimit();

    const response = await fetchWithRetry(
      `${JUPITER_API_URL}/swap`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route,
          userPublicKey,
          wrapUnwrapSOL: true,
          computeUnitPriceMicroLamports: 'auto',
          asLegacyTransaction: false,
        }),
      }
    );

    const data: SwapTransaction = await response.json();
    if (!data.swapTransaction) {
      throw new ApiError('TRANSACTION_FAILED', 'Failed to create swap transaction');
    }

    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getJupiterTokens() {
  try {
    // Check cache
    const cachedTokens = quoteCache.get('jupiter_tokens');
    if (cachedTokens) {
      return cachedTokens;
    }

    // Check rate limit
    await jupiterLimiter.checkLimit();

    const response = await fetchWithRetry('https://token.jup.ag/all');
    const data = await response.json();

    // Cache the tokens
    quoteCache.set('jupiter_tokens', data);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

export function calculatePriceImpact(route: SwapRoute): number {
  return parseFloat(route.priceImpactPct.toFixed(2));
}

export function formatJupiterAmount(amount: string): number {
  return parseInt(amount) / Math.pow(10, 9); // Convert from lamports to SOL
}
