import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface UserBalance {
  solx: number;
  mockx: number;
  usdt: number;
}

interface TokenConfig {
  mint: string;
  decimals: number;
}

const TOKENS: { [key: string]: TokenConfig } = {
  'USDT': {
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6
  },
  'USDC': {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6
  },
  'SOL': {
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9
  },
  'RAY': {
    mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 6
  },
  'SRM': {
    mint: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
    decimals: 6
  }
};

class TradingBalanceService {
  private static instance: TradingBalanceService;
  private connection: Connection;
  private userBalances: Map<string, UserBalance>;
  private tokenBalanceCache: Map<string, { balance: number; timestamp: number }>;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  private constructor() {
    this.connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com');
    this.userBalances = new Map();
    this.tokenBalanceCache = new Map();
  }

  public static getInstance(): TradingBalanceService {
    if (!TradingBalanceService.instance) {
      TradingBalanceService.instance = new TradingBalanceService();
    }
    return TradingBalanceService.instance;
  }

  private async getTokenBalance(walletAddress: string, tokenSymbol: string): Promise<number> {
    try {
      const cacheKey = `${walletAddress}-${tokenSymbol}`;
      const now = Date.now();
      const cached = this.tokenBalanceCache.get(cacheKey);

      if (cached && now - cached.timestamp < this.CACHE_DURATION) {
        return cached.balance;
      }

      const wallet = new PublicKey(walletAddress);
      const tokenConfig = TOKENS[tokenSymbol];

      if (!tokenConfig) {
        throw new Error(`Token ${tokenSymbol} not supported`);
      }

      if (tokenSymbol === 'SOL') {
        const balance = await this.connection.getBalance(wallet);
        const solBalance = balance / Math.pow(10, tokenConfig.decimals);
        this.tokenBalanceCache.set(cacheKey, { balance: solBalance, timestamp: now });
        return solBalance;
      }

      const tokenMint = new PublicKey(tokenConfig.mint);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID,
      });

      const tokenAccount = tokenAccounts.value.find(
        (account) => account.account.data.parsed.info.mint === tokenMint.toString()
      );

      const balance = tokenAccount ? 
        Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmount) : 0;

      this.tokenBalanceCache.set(cacheKey, { balance, timestamp: now });
      return balance;
    } catch (error) {
      console.error(`Error fetching ${tokenSymbol} balance:`, error);
      return 0;
    }
  }

  async getBalance(walletAddress: string, tokenSymbol: string): Promise<number> {
    // For SOLX and MOCKX, use internal balance tracking
    if (tokenSymbol.toLowerCase() === 'solx') {
      const balance = this.userBalances.get(walletAddress);
      return balance?.solx || 0;
    }
    if (tokenSymbol.toLowerCase() === 'mockx') {
      const balance = this.userBalances.get(walletAddress);
      return balance?.mockx || 0;
    }

    // For other tokens, get real balance
    return this.getTokenBalance(walletAddress, tokenSymbol.toUpperCase());
  }

  async executeTrade(
    walletAddress: string,
    baseToken: string,
    quoteToken: string,
    amount: number,
    price: number,
    isBuy: boolean
  ): Promise<boolean> {
    const cost = amount * price;

    // Handle SOLX/MOCKX trades
    if (baseToken === 'SOLX' || baseToken === 'MOCKX') {
      return this.executeInternalTrade(walletAddress, baseToken, amount, price, isBuy);
    }

    // For real token pairs, verify balances
    if (isBuy) {
      const quoteBalance = await this.getBalance(walletAddress, quoteToken);
      return quoteBalance >= cost;
    } else {
      const baseBalance = await this.getBalance(walletAddress, baseToken);
      return baseBalance >= amount;
    }
  }

  private async executeInternalTrade(
    walletAddress: string,
    token: 'SOLX' | 'MOCKX',
    amount: number,
    price: number,
    isBuy: boolean
  ): Promise<boolean> {
    await this.initializeUserBalance(walletAddress);
    const balance = this.userBalances.get(walletAddress);
    if (!balance) return false;

    const cost = amount * price;

    if (isBuy) {
      if (balance.usdt < cost) return false;
      balance.usdt -= cost;
      balance[token.toLowerCase() as 'solx' | 'mockx'] += amount;
    } else {
      if (balance[token.toLowerCase() as 'solx' | 'mockx'] < amount) return false;
      balance[token.toLowerCase() as 'solx' | 'mockx'] -= amount;
      balance.usdt += cost;
    }

    this.userBalances.set(walletAddress, balance);
    return true;
  }

  async initializeUserBalance(walletAddress: string) {
    if (!this.userBalances.has(walletAddress)) {
      const usdtBalance = await this.getTokenBalance(walletAddress, 'USDT');
      this.userBalances.set(walletAddress, {
        solx: 0,
        mockx: 0,
        usdt: usdtBalance
      });
    }
    return this.userBalances.get(walletAddress);
  }

  clearCache() {
    this.tokenBalanceCache.clear();
  }
}

export const tradingBalanceService = TradingBalanceService.getInstance();
