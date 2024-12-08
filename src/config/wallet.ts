import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import type { WalletAdapter } from '@solana/wallet-adapter-base';

export const WALLET_ADAPTERS: { new (): WalletAdapter }[] = [
  PhantomWalletAdapter,
  SolflareWalletAdapter,
];

export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
