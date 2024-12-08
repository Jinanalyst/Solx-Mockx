import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { Connection, clusterApiUrl } from '@solana/web3.js';

// Configure network and endpoint
export const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet' 
  ? WalletAdapterNetwork.Mainnet
  : WalletAdapterNetwork.Devnet;

export const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network);

// Create connection with custom WebSocket
export const getConnection = () => new Connection(endpoint, {
  commitment: 'confirmed',
  wsEndpoint: endpoint.replace('https', 'wss'),
});

// Initialize wallet adapters
export const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

// Error handler
export const onError = (error: WalletError) => {
  console.error('Wallet error:', error);
};
