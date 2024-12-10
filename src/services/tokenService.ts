'use client';

import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import TokenService from './tokenService';

const SOLX_TOKEN_ADDRESS = '2k42cRS5yBmgXGiEGwebC8Y5BQvWH4xr5UKP5TijysTP';
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

export interface TokenInfo {
  price: number;
  totalSupply: number;
  circulatingSupply: number;
  marketCap: number;
  holders: number;
  volume24h: number;
  change24h: number;
}

export async function getSolxTokenInfo(): Promise<TokenInfo> {
  try {
    const tokenService = TokenService.getInstance();
    const solxTokenInfo = await tokenService.getTokenInfo(SOLX_TOKEN_ADDRESS);
    if (!solxTokenInfo) {
      throw new Error('Failed to fetch token info');
    }

    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const tokenPublicKey = new PublicKey(SOLX_TOKEN_ADDRESS);

    // Get token supply
    const tokenSupply = await connection.getTokenSupply(tokenPublicKey);
    const totalSupply = Number(tokenSupply.value.amount) / Math.pow(10, tokenSupply.value.decimals);

    // Get token accounts
    const tokenAccounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
      filters: [
        {
          dataSize: 165,
        },
        {
          memcmp: {
            offset: 0,
            bytes: tokenPublicKey.toBase58(),
          },
        },
      ],
    });

    // Calculate holders
    const holders = tokenAccounts.length;

    // Calculate token metrics
    const price = solxTokenInfo.current_price;
    const circulatingSupply = solxTokenInfo.circulating_supply || totalSupply * 0.875; // Fallback to 87.5% if not available
    const marketCap = price * circulatingSupply;
    const volume24h = solxTokenInfo.total_volume || 0;
    const change24h = solxTokenInfo.price_change_percentage_24h || 0;

    return {
      price,
      totalSupply,
      circulatingSupply,
      marketCap,
      holders,
      volume24h,
      change24h,
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    // Return default values in case of error
    return {
      price: 0,
      totalSupply: 0,
      circulatingSupply: 0,
      marketCap: 0,
      holders: 0,
      volume24h: 0,
      change24h: 0,
    };
  }
}

// Function to format large numbers with K, M, B suffixes
export function formatNumber(num: number): string {
  if (num === 0) return '0';
  if (!num) return 'N/A';

  const absNum = Math.abs(num);
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (absNum >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (absNum >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}
