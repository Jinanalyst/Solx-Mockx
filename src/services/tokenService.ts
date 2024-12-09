import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

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

    // For price and market data, we would typically use a price feed or DEX API
    // For now, using placeholder values that you can replace with real data source
    const price = 0.01; // Replace with actual price feed
    const circulatingSupply = totalSupply * 0.875; // 87.5% of total supply
    const marketCap = price * circulatingSupply;
    const volume24h = 1000000; // Replace with actual 24h volume
    const change24h = -0.08; // Replace with actual 24h change

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
    console.error('Error fetching SOLX token info:', error);
    throw error;
  }
}

// Function to format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}
