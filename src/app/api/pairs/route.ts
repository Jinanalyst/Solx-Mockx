import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';

// Mock data for development
const mockPairs = [
  {
    label: 'SOL/USDC',
    value: 'sol-usdc',
    price: '68.45',
    change: '+2.5%',
    volume: '1.2M',
    isPositive: true,
    liquidity: '5.6M',
    dexId: 'raydium',
    pairAddress: Keypair.generate().publicKey.toString(),
    baseToken: {
      address: 'So11111111111111111111111111111111111111112',
      name: 'Solana',
      symbol: 'SOL'
    },
    quoteToken: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC'
    }
  },
  {
    label: 'BONK/USDC',
    value: 'bonk-usdc',
    price: '0.000012',
    change: '-1.2%',
    volume: '890K',
    isPositive: false,
    liquidity: '2.1M',
    dexId: 'raydium',
    pairAddress: Keypair.generate().publicKey.toString(),
    baseToken: {
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      name: 'Bonk',
      symbol: 'BONK'
    },
    quoteToken: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC'
    }
  },
  {
    label: 'JUP/USDC',
    value: 'jup-usdc',
    price: '0.85',
    change: '+5.2%',
    volume: '450K',
    isPositive: true,
    liquidity: '1.8M',
    dexId: 'raydium',
    pairAddress: Keypair.generate().publicKey.toString(),
    baseToken: {
      address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      name: 'Jupiter',
      symbol: 'JUP'
    },
    quoteToken: {
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USD Coin',
      symbol: 'USDC'
    }
  }
];

export async function GET() {
  try {
    // In production, fetch real pairs from DEX
    // const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
    // const pairs = await fetchPairsFromDEX(connection);
    
    return NextResponse.json(mockPairs);
  } catch (error) {
    console.error('Failed to fetch pairs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trading pairs' },
      { status: 500 }
    );
  }
}
