import axios from 'axios';
import { API_CONFIG } from '../config/api';
import okxClient from './okx';

export interface TokenData {
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity?: number;
  marketCap?: number;
  symbol: string;
  name?: string;
  address?: string;
  dexId?: string;
  pairAddress?: string;
  baseToken?: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken?: {
    address: string;
    name: string;
    symbol: string;
  };
}

const USDC_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const API_BASE_URL = 'https://public-api.birdeye.so/v2';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-API-KEY': API_CONFIG.BIRDEYE_API_KEY
  }
});

export async function fetchAllSolanaPairs(): Promise<TokenData[]> {
  try {
    console.log('Fetching Solana pairs from Birdeye...');
    
    // Get top tokens by market cap
    const response = await axiosInstance.get('/market/token/list', {
      params: {
        offset: 0,
        limit: 100,
        sort_by: 'volume',
        sort_type: 'desc'
      }
    });
    
    if (!response.data?.success || !response.data?.data?.items?.length) {
      console.log('No tokens found in response:', response.data);
      return [];
    }

    const tokens = response.data.data.items;
    console.log('Total tokens before filtering:', tokens.length);

    // Filter and transform the data
    const filteredPairs = tokens
      .filter((token: any) => {
        const hasLiquidity = (token.liquidity || 0) > 10000;
        const hasValidPrice = !isNaN(parseFloat(token.price));
        return hasLiquidity && hasValidPrice;
      })
      .map((token: any) => ({
        symbol: token.symbol,
        name: token.name || token.symbol,
        price: parseFloat(token.price),
        priceChange24h: token.price_change_24h || 0,
        volume24h: token.volume_24h || 0,
        liquidity: token.liquidity || 0,
        marketCap: token.market_cap || 0,
        address: token.address,
        baseToken: {
          address: token.address,
          name: token.name || token.symbol,
          symbol: token.symbol
        },
        quoteToken: {
          address: USDC_ADDRESS,
          name: 'USD Coin',
          symbol: 'USDC'
        }
      }))
      .sort((a: any, b: any) => b.volume24h - a.volume24h);

    console.log('Filtered pairs:', filteredPairs.length);
    if (filteredPairs.length > 0) {
      console.log('First pair:', JSON.stringify(filteredPairs[0], null, 2));
    }
    
    return filteredPairs;
  } catch (error: any) {
    console.error('Error fetching Birdeye pairs:', error.response?.data || error.message);
    return [];
  }
}

export async function fetchTokenPrice(tokenAddress: string): Promise<number | null> {
  try {
    const response = await axiosInstance.get('/market/token/meta', {
      params: { address: tokenAddress }
    });
    
    if (response.data?.success && response.data?.data?.price) {
      return parseFloat(response.data.data.price);
    }
    return null;
  } catch (error: any) {
    console.error('Error fetching token price:', error.response?.data || error.message);
    return null;
  }
}

export async function fetchTokenOrderbook(tokenAddress: string): Promise<any> {
  try {
    // First get the pool address
    const poolResponse = await axiosInstance.get('/market/token/pools', {
      params: { token_address: tokenAddress }
    });

    const pool = poolResponse.data?.data?.items?.find((p: any) => 
      p.quote_mint === USDC_ADDRESS && p.pool_data?.liquidity > 0
    );

    if (!pool?.pool_address) {
      console.log('No suitable pool found for token');
      return null;
    }

    const response = await axiosInstance.get(`/market/pool/${pool.pool_address}/orderbook`);
    return response.data?.data || null;
  } catch (error: any) {
    console.error('Error fetching orderbook:', error.response?.data || error.message);
    return null;
  }
}

export async function fetchTokenOHLC(
  tokenAddress: string, 
  resolution: string = '1D'
): Promise<any> {
  try {
    const response = await axiosInstance.get(`/market/token/${tokenAddress}/ohlcv`, {
      params: {
        resolution,
        limit: 100
      }
    });
    
    return response.data?.data || null;
  } catch (error: any) {
    console.error('Error fetching OHLC data:', error.response?.data || error.message);
    return null;
  }
}

export async function fetchTokenMetadata(tokenAddress: string): Promise<any> {
  try {
    const response = await axiosInstance.get('/market/token/meta', {
      params: { address: tokenAddress }
    });
    
    return response.data?.data || null;
  } catch (error: any) {
    console.error('Error fetching token metadata:', error.response?.data || error.message);
    return null;
  }
}

export async function fetchPoolInfo(poolAddress: string): Promise<any> {
  try {
    const response = await axiosInstance.get(`/market/pool/${poolAddress}`);
    return response.data?.data || null;
  } catch (error: any) {
    console.error('Error fetching pool info:', error.response?.data || error.message);
    return null;
  }
}

// OKX Trading Functions
export async function placeOKXOrder(params: {
  instId: string;
  tdMode: 'cash' | 'cross' | 'isolated';
  side: 'buy' | 'sell';
  ordType: 'market' | 'limit' | 'post_only' | 'fok' | 'ioc';
  sz: string;
  px?: string;
  posSide?: 'long' | 'short' | 'net';
  reduceOnly?: boolean;
  tpTriggerPx?: string;
  tpOrdPx?: string;
  slTriggerPx?: string;
  slOrdPx?: string;
}) {
  return okxClient.placeOrder(params);
}

export async function getOKXOrderbook(instId: string) {
  return okxClient.getOrderbook(instId);
}

export async function getOKXAccountBalance() {
  return okxClient.getAccountBalance();
}

export async function getOKXPositions() {
  return okxClient.getPositions();
}

export async function getOKXOrderHistory() {
  return okxClient.getOrderHistory();
}

export async function getOKXInstruments() {
  return okxClient.getInstruments();
}
