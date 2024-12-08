import { TokenPrice, TokenMetadata, ApiError } from '../types/api';
import { tokenPriceCache, tokenListCache, coingeckoLimiter, fetchWithRetry, handleApiError } from './api';

const COINGECKO_API_URL = process.env.NEXT_PUBLIC_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;

export async function getSolanaTokenPrice(tokenId: string): Promise<TokenPrice> {
  try {
    // Check cache first
    const cachedPrice = tokenPriceCache.get(tokenId);
    if (cachedPrice) {
      return cachedPrice;
    }

    // Check rate limit
    await coingeckoLimiter.checkLimit();

    const response = await fetchWithRetry(
      `${COINGECKO_API_URL}/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
    );

    const data = await response.json();
    
    if (!data[tokenId]) {
      throw new ApiError('TOKEN_NOT_FOUND', `Token ${tokenId} not found`);
    }

    const price: TokenPrice = {
      current_price: data[tokenId].usd,
      price_change_percentage_24h: data[tokenId].usd_24h_change || 0,
      high_24h: data[tokenId].usd_24h_high || 0,
      low_24h: data[tokenId].usd_24h_low || 0,
      total_volume: data[tokenId].usd_24h_vol || 0,
      last_updated: new Date().toISOString(),
    };

    // Cache the result
    tokenPriceCache.set(tokenId, price);
    return price;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getSolanaTokenList(): Promise<TokenMetadata[]> {
  try {
    // Check cache first
    const cachedList = tokenListCache.get('solana_tokens');
    if (cachedList) {
      return cachedList;
    }

    // Check rate limit
    await coingeckoLimiter.checkLimit();

    const response = await fetchWithRetry(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&platform_id=solana`
    );

    const data = await response.json();
    const tokens: TokenMetadata[] = data.map((token: any) => ({
      id: token.id,
      symbol: token.symbol.toUpperCase(),
      name: token.name,
      image: token.image,
      market_cap: token.market_cap || 0,
      market_cap_rank: token.market_cap_rank || 999999,
    }));

    // Cache the result for longer since token list changes less frequently
    tokenListCache.set('solana_tokens', tokens);
    return tokens;
  } catch (error) {
    return handleApiError(error);
  }
}
