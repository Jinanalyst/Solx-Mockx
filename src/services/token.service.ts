import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { defaultConnection, checkConnection, connections } from '@/config/rpc';

export interface TokenInfo {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  mint: string;
}

export class TokenService {
  private connection: Connection;
  private fallbackConnections: Connection[];

  constructor(connection: Connection = defaultConnection) {
    this.connection = connection;
    this.fallbackConnections = [
      connections.devnet,
      connections.mainnet,
      connections.testnet,
    ].filter(conn => conn !== connection);
  }

  private async withFallback<T>(operation: (conn: Connection) => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    try {
      // Try with primary connection first
      console.log('Attempting primary connection...');
      return await operation(this.connection);
    } catch (error) {
      console.error('Primary connection failed:', error);
      lastError = error;

      // Try each fallback connection
      for (const fallbackConn of this.fallbackConnections) {
        try {
          console.log('Testing fallback connection health...');
          const isHealthy = await checkConnection(fallbackConn);
          if (isHealthy) {
            console.log('Fallback connection is healthy, attempting operation...');
            const result = await operation(fallbackConn);
            this.connection = fallbackConn; // Update primary connection if fallback succeeds
            return result;
          }
        } catch (fallbackError) {
          console.error('Fallback connection failed:', fallbackError);
          lastError = fallbackError;
          continue;
        }
      }

      // If all connections fail, throw a detailed error
      throw new Error(`Failed to connect to any Solana network. Last error: ${lastError?.message || 'Unknown error'}`);
    }
  }

  async getTokenBalance(walletAddress: string, tokenMint: string): Promise<string> {
    return this.withFallback(async (conn) => {
      try {
        const wallet = new PublicKey(walletAddress);
        const mint = new PublicKey(tokenMint);

        const tokenAccounts = await conn.getParsedTokenAccountsByOwner(wallet, {
          programId: TOKEN_PROGRAM_ID,
        });

        const tokenAccount = tokenAccounts.value.find(
          (account) => account.account.data.parsed.info.mint === mint.toString()
        );

        if (!tokenAccount) {
          return '0';
        }

        return tokenAccount.account.data.parsed.info.tokenAmount.uiAmountString;
      } catch (error) {
        console.error('Error fetching token balance:', error);
        throw error;
      }
    });
  }

  async getSolBalance(walletAddress: string): Promise<string> {
    return this.withFallback(async (conn) => {
      try {
        const wallet = new PublicKey(walletAddress);
        const balance = await conn.getBalance(wallet);
        return (balance / 1e9).toString(); // Convert lamports to SOL
      } catch (error) {
        console.error('Error fetching SOL balance:', error);
        throw error;
      }
    });
  }

  // Mock price feed (replace with actual price feed integration)
  async getTokenPrice(tokenMint: string): Promise<number> {
    // In a real implementation, you would fetch prices from a reliable price feed
    const mockPrices: { [key: string]: number } = {
      'So11111111111111111111111111111111111111112': 100, // SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1, // USDC
    };

    return mockPrices[tokenMint] || 0;
  }

  async getTokenData(walletAddress: string): Promise<TokenInfo[]> {
    return this.withFallback(async (conn) => {
      try {
        console.log('Fetching token data for wallet:', walletAddress);
        
        // Check connection health first
        console.log('Checking connection health...');
        const isHealthy = await checkConnection(conn);
        if (!isHealthy) {
          throw new Error('Connection is unhealthy');
        }

        const tokens = [
          {
            symbol: 'SOL',
            name: 'Solana',
            mint: 'So11111111111111111111111111111111111111112',
          },
          {
            symbol: 'USDC',
            name: 'USD Coin',
            mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          },
        ];

        console.log('Fetching balances for tokens:', tokens.map(t => t.symbol).join(', '));
        
        const tokenData = await Promise.all(
          tokens.map(async (token) => {
            let balance;
            try {
              console.log(`Fetching balance for ${token.symbol}...`);
              if (token.symbol === 'SOL') {
                balance = await this.getSolBalance(walletAddress);
              } else {
                balance = await this.getTokenBalance(walletAddress, token.mint);
              }
              console.log(`${token.symbol} balance:`, balance);
            } catch (error) {
              console.error(`Error fetching balance for ${token.symbol}:`, error);
              balance = '0';
            }

            const price = await this.getTokenPrice(token.mint);
            console.log(`${token.symbol} price:`, price);

            return {
              ...token,
              balance,
              price,
            };
          })
        );

        console.log('Successfully fetched all token data:', tokenData);
        return tokenData;
      } catch (error) {
        console.error('Error in getTokenData:', error);
        throw error;
      }
    });
  }
}
