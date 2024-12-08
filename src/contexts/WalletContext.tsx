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

export function WalletProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected, select, disconnect: solanaDisconnect } = useSolanaWallet();
  const { connection: solanaConnection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  useEffect(() => {
    const conn = new Connection(
      process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );
    setConnection(conn);
  }, []);

  useEffect(() => {
    if (publicKey) {
      solanaConnection.getBalance(publicKey).then((bal) => {
        setBalance(bal / 1e9); // Convert lamports to SOL
      });
    }
  }, [publicKey, solanaConnection]);

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

  const getTokenAccountInfo = async (
    connection: Connection,
    walletAddress: PublicKey
  ) => {
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletAddress,
        {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        }
      );

      return tokenAccounts.value;
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      return [];
    }
  };

  const refreshBalances = async () => {
    if (!connection || !publicKey) return;

    setIsLoadingBalances(true);
    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solUsdPrice = await fetchTokenPrice('SOL');

      // Fetch token balances
      const tokenAccounts = await getTokenAccountInfo(connection, publicKey);
      const tokenList = await fetchTokenList();

      const balances: TokenBalance[] = [
        {
          mint: 'SOL',
          symbol: 'SOL',
          balance: solBalance / 1e9,
          decimals: 9,
          usdValue: (solBalance / 1e9) * solUsdPrice,
          logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        },
      ];

      for (const account of tokenAccounts) {
        const parsedInfo = account.account.data.parsed.info;
        const mintAddress = parsedInfo.mint;
        const tokenInfo = tokenList.find(t => t.address === mintAddress);
        
        if (tokenInfo) {
          const price = await fetchTokenPrice(tokenInfo.symbol);
          const balance = parsedInfo.tokenAmount.uiAmount;

          balances.push({
            mint: mintAddress,
            symbol: tokenInfo.symbol,
            balance,
            decimals: tokenInfo.decimals,
            usdValue: balance * price,
            logoURI: tokenInfo.logoURI,
          });
        }
      }

      setBalances(balances);
    } catch (error) {
      console.error('Error refreshing balances:', error);
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
  }, [connected, connection]);

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
    const data = await response.json();
    return data.tokens;
  } catch (error) {
    console.error('Error fetching token list:', error);
    return [];
  }
}

async function fetchTokenPrice(symbol: string): Promise<number> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
    const data = await response.json();
    return data[symbol.toLowerCase()]?.usd || 0;
  } catch (error) {
    console.error('Error fetching token price:', error);
    return 0;
  }
}
