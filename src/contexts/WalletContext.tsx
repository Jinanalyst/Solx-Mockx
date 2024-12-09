'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TokenInfo } from '@solana/spl-token-registry';

interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
  usdValue: number;
  logoURI?: string;
}

interface TokenAmount {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
}

interface TokenAccountInfo {
  isNative: boolean;
  mint: string;
  owner: string;
  state: string;
  tokenAmount: TokenAmount;
}

interface ParsedAccountData {
  program: string;
  parsed: {
    info: TokenAccountInfo;
    type: string;
  };
  space: number;
}

interface TokenAccount {
  account: {
    data: ParsedAccountData;
    executable: boolean;
    lamports: number;
    owner: string;
    rentEpoch: number;
  };
  pubkey: string;
}

interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  connection: Connection | null;
  balances: TokenBalance[];
  isLoadingBalances: boolean;
  refreshBalances: () => Promise<void>;
  getTokenBalance: (mintAddress: string) => TokenBalance | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const RPC_ENDPOINTS = [
  'https://solana-mainnet.g.alchemy.com/v2/demo',
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
];

// Mock data for development
const MOCK_BALANCES: TokenBalance[] = [
  {
    mint: 'SOL',
    symbol: 'SOL',
    balance: 0,
    decimals: 9,
    usdValue: 0,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  }
];

export function WalletProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected, select, disconnect: solanaDisconnect } = useSolanaWallet();
  const { connection: solanaConnection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [currentEndpointIndex, setCurrentEndpointIndex] = useState(0);

  const rotateEndpoint = () => {
    console.log('Rotating to next RPC endpoint...');
    setCurrentEndpointIndex((prev) => (prev + 1) % RPC_ENDPOINTS.length);
    return RPC_ENDPOINTS[(currentEndpointIndex + 1) % RPC_ENDPOINTS.length];
  };

  const createConnection = (endpoint: string) => {
    console.log('Creating connection to:', endpoint);
    return new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
        });
      },
    });
  };

  useEffect(() => {
    const conn = createConnection(RPC_ENDPOINTS[currentEndpointIndex]);
    setConnection(conn);
  }, [currentEndpointIndex]);

  const retryWithFallback = async <T,>(operation: (conn: Connection) => Promise<T>): Promise<T> => {
    let lastError;
    const maxRetries = RPC_ENDPOINTS.length * 2; // Try each endpoint twice
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (!connection) {
          throw new Error('No connection available');
        }
        return await operation(connection);
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error?.message || error);
        
        // Check for various error conditions that require endpoint rotation
        if (
          error?.message?.includes('403') ||
          error?.message?.includes('429') ||
          error?.message?.includes('Access forbidden') ||
          error?.message?.includes('Too many requests') ||
          error?.message?.includes('timeout')
        ) {
          const newEndpoint = rotateEndpoint();
          console.log(`Switching to fallback RPC endpoint: ${newEndpoint}`);
          // Add a small delay before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }
    console.error('All RPC endpoints failed');
    throw lastError;
  };

  useEffect(() => {
    if (publicKey) {
      retryWithFallback((conn) => conn.getBalance(publicKey))
        .then((bal) => {
          setBalance(bal / 1e9);
        })
        .catch((error) => {
          console.error('Failed to fetch balance:', error);
        });
    }
  }, [publicKey]);

  const getTokenAccountInfo = async (
    connection: Connection,
    walletAddress: PublicKey
  ): Promise<TokenAccount[]> => {
    try {
      console.log('Fetching token accounts for:', walletAddress.toString());
      const response = await retryWithFallback((conn) =>
        conn.getParsedTokenAccountsByOwner(walletAddress, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        })
      );
      
      return response.value.map(account => ({
        account: {
          data: account.account.data,
          executable: account.account.executable,
          lamports: account.account.lamports,
          owner: account.account.owner.toString(),
          rentEpoch: account.account.rentEpoch,
        },
        pubkey: account.pubkey.toString(),
      }));
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      return [];
    }
  };

  const connect = async () => {
    try {
      await select('Phantom' as WalletName);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnect = async () => {
    try {
      await solanaDisconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const refreshBalances = async () => {
    if (!connection || !publicKey) {
      setBalances([]);
      return;
    }

    setIsLoadingBalances(true);
    try {
      // Fetch token accounts
      const tokenAccounts = await getTokenAccountInfo(connection, new PublicKey(publicKey));
      const tokenList = await fetchTokenList();
      
      // Create a map of token info for quick lookup
      const tokenInfoMap = new Map(tokenList.map(token => [token.address, token]));
      
      // Process token accounts
      const tokenBalances = await Promise.all(
        tokenAccounts.map(async (account) => {
          const tokenInfo = account.account.data.parsed.info;
          const mintAddress = tokenInfo.mint;
          const tokenMetadata = tokenInfoMap.get(mintAddress);
          
          if (!tokenMetadata) {
            return null;
          }

          try {
            const price = await fetchTokenPrice(tokenMetadata.symbol);
            const balance = Number(tokenInfo.tokenAmount.uiAmountString);
            
            return {
              mint: mintAddress,
              symbol: tokenMetadata.symbol,
              balance: balance,
              decimals: tokenInfo.tokenAmount.decimals,
              usdValue: balance * price,
              logoURI: tokenMetadata.logoURI
            };
          } catch (error) {
            console.error(`Error processing token ${tokenMetadata.symbol}:`, error);
            return null;
          }
        })
      );

      // Filter out null values and sort by USD value
      const validBalances = tokenBalances
        .filter((balance): balance is TokenBalance => balance !== null && balance.balance > 0)
        .sort((a, b) => b.usdValue - a.usdValue);

      setBalances(validBalances);
    } catch (error) {
      console.error('Error refreshing balances:', error);
      setBalances([]);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const getTokenBalance = (mintAddress: string) => {
    return balances.find(b => b.mint === mintAddress);
  };

  useEffect(() => {
    if (connected) {
      refreshBalances();
    } else {
      setBalances([]);
    }
  }, [connected, publicKey]);

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey: publicKey?.toBase58() || null,
        balance,
        connect,
        disconnect,
        connection,
        balances,
        isLoadingBalances,
        refreshBalances,
        getTokenBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Helper functions
async function fetchTokenList(): Promise<TokenInfo[]> {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json');
    if (!response.ok) {
      throw new Error('Failed to fetch token list');
    }
    const data = await response.json();
    return Array.isArray(data.tokens) ? data.tokens : [];
  } catch (error) {
    console.error('Error fetching token list:', error);
    return [];
  }
}

async function fetchTokenPrice(symbol: string): Promise<number> {
  if (!symbol) return 0;
  
  try {
    // Handle SOL separately
    if (symbol.toUpperCase() === 'SOL') {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      if (!response.ok) {
        throw new Error('Failed to fetch SOL price');
      }
      const data = await response.json();
      return data.solana?.usd || 0;
    }

    // For other tokens
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
    if (!response.ok) {
      throw new Error(`Failed to fetch price for ${symbol}`);
    }
    const data = await response.json();
    return data[symbol.toLowerCase()]?.usd || 0;
  } catch (error) {
    console.error(`Error fetching token price for ${symbol}:`, error);
    return 0;
  }
}
