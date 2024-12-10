'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TokenInfo } from '@solana/spl-token-registry';
import { toast } from '@/components/ui/use-toast';

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
  process.env.NEXT_PUBLIC_RPC_ENDPOINT,
  'https://rpc.ankr.com/solana',
  'https://api.mainnet-beta.solana.com',
].filter(Boolean) as string[];

const connectionConfig = {
  commitment: 'confirmed' as const,
  wsEndpoint: process.env.NEXT_PUBLIC_WS_ENDPOINT,
  confirmTransactionInitialTimeout: 60000,
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected, select, disconnect: solanaDisconnect } = useSolanaWallet();
  const { connection: solanaConnection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [currentEndpointIndex, setCurrentEndpointIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const rotateEndpoint = useCallback(() => {
    const nextIndex = (currentEndpointIndex + 1) % RPC_ENDPOINTS.length;
    setCurrentEndpointIndex(nextIndex);
    return RPC_ENDPOINTS[nextIndex];
  }, [currentEndpointIndex]);

  const createConnection = useCallback((endpoint: string) => {
    if (!endpoint) {
      console.error('Invalid RPC endpoint');
      return null;
    }

    try {
      const conn = new Connection(endpoint, connectionConfig);
      return conn;
    } catch (error) {
      console.error('Failed to create connection:', error);
      return null;
    }
  }, []);

  const retryWithFallback = useCallback(async <T,>(operation: (conn: Connection) => Promise<T>): Promise<T> => {
    let lastError;
    const maxRetries = RPC_ENDPOINTS.length * 2;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (!connection) {
          throw new Error('No connection available');
        }
        return await operation(connection);
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error?.message || error);
        
        if (
          error?.message?.includes('403') ||
          error?.message?.includes('429') ||
          error?.message?.includes('Access forbidden') ||
          error?.message?.includes('Too many requests') ||
          error?.message?.includes('timeout')
        ) {
          const newEndpoint = rotateEndpoint();
          const newConnection = createConnection(newEndpoint);
          if (newConnection) {
            setConnection(newConnection);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }, [connection, rotateEndpoint, createConnection]);

  const getTokenAccountInfo = useCallback(async (
    connection: Connection,
    walletAddress: PublicKey
  ): Promise<TokenAccount[]> => {
    try {
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
  }, [retryWithFallback]);

  const connect = useCallback(async () => {
    try {
      if (connected) {
        throw new Error('Wallet is already connected');
      }
      await select('Phantom' as WalletName);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, [connected, select]);

  const disconnect = useCallback(async () => {
    try {
      if (!connected) {
        throw new Error('Wallet is not connected');
      }
      await solanaDisconnect();
      setBalances([]);
      setBalance(0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect wallet';
      toast({
        title: 'Disconnect Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, [connected, solanaDisconnect]);

  const fetchTokenList = useCallback(async (): Promise<TokenInfo[]> => {
    try {
      const response = await fetch('https://token.jup.ag/all');
      if (!response.ok) {
        throw new Error('Failed to fetch token list');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching token list:', error);
      return [];
    }
  }, []);

  const fetchTokenPrice = useCallback(async (symbol: string): Promise<number> => {
    try {
      if (!symbol) return 0;
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
      if (!response.ok) {
        throw new Error('Failed to fetch token price');
      }
      const data = await response.json();
      return parseFloat(data.price) || 0;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      return 0;
    }
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!connection || !publicKey) {
      setBalances([]);
      return;
    }

    setIsLoadingBalances(true);
    try {
      const tokenAccounts = await getTokenAccountInfo(connection, new PublicKey(publicKey));
      const tokenList = await fetchTokenList();
      
      if (!tokenList || tokenList.length === 0) {
        throw new Error('Failed to fetch token list');
      }
      
      const tokenInfoMap = new Map(tokenList.map(token => [token.address, token]));
      
      const tokenBalances = await Promise.allSettled(
        tokenAccounts.map(async (account) => {
          const tokenInfo = account.account.data.parsed.info;
          if (!tokenInfo) return null;

          const mintAddress = tokenInfo.mint;
          const tokenMetadata = tokenInfoMap.get(mintAddress);
          
          if (!tokenMetadata) return null;

          try {
            const [price, balance] = await Promise.all([
              fetchTokenPrice(tokenMetadata.symbol),
              Number(tokenInfo.tokenAmount.uiAmountString)
            ]);
            
            if (isNaN(price) || isNaN(balance)) {
              throw new Error(`Invalid price or balance for ${tokenMetadata.symbol}`);
            }
            
            return {
              mint: mintAddress,
              symbol: tokenMetadata.symbol,
              balance,
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

      const validBalances = tokenBalances
        .filter((result): result is PromiseFulfilledResult<TokenBalance> => 
          result.status === 'fulfilled' && result.value !== null && result.value.balance > 0
        )
        .map(result => result.value)
        .sort((a, b) => b.usdValue - a.usdValue);

      setBalances(validBalances);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh balances';
      toast({
        title: 'Balance Refresh Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setBalances([]);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [connection, publicKey, getTokenAccountInfo, fetchTokenList, fetchTokenPrice]);

  const getTokenBalance = useCallback((mintAddress: string) => {
    return balances.find(b => b.mint === mintAddress);
  }, [balances]);

  // Initialize connection
  useEffect(() => {
    if (!isInitialized && RPC_ENDPOINTS[currentEndpointIndex]) {
      const conn = createConnection(RPC_ENDPOINTS[currentEndpointIndex]);
      if (conn) {
        setConnection(conn);
        setIsInitialized(true);
      } else {
        const newEndpoint = rotateEndpoint();
        const newConn = createConnection(newEndpoint);
        if (newConn) {
          setConnection(newConn);
          setIsInitialized(true);
        }
      }
    }
  }, [currentEndpointIndex, isInitialized, createConnection, rotateEndpoint]);

  // Update balance when connection or wallet changes
  useEffect(() => {
    if (publicKey && connection) {
      retryWithFallback((conn) => conn.getBalance(publicKey))
        .then((bal) => {
          setBalance(bal / 1e9);
        })
        .catch((error) => {
          console.error('Failed to fetch balance:', error);
          setBalance(0);
        });
    } else {
      setBalance(0);
    }
  }, [publicKey, connection, retryWithFallback]);

  // Refresh balances when wallet connection changes
  useEffect(() => {
    if (connected) {
      refreshBalances();
    } else {
      setBalances([]);
    }
  }, [connected, refreshBalances]);

  const contextValue = {
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
  };

  return (
    <WalletContext.Provider value={contextValue}>
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
