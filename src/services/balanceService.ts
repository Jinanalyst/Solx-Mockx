import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TOKEN_MINTS } from '@/config/api';

export class BalanceService {
  private static instance: BalanceService;
  private connection: Connection;

  private constructor() {
    this.connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com');
  }

  public static getInstance(): BalanceService {
    if (!BalanceService.instance) {
      BalanceService.instance = new BalanceService();
    }
    return BalanceService.instance;
  }

  async getTokenBalance(walletAddress: string, tokenSymbol: string): Promise<number> {
    try {
      const wallet = new PublicKey(walletAddress);
      const tokenMintAddress = TOKEN_MINTS[tokenSymbol];
      
      if (!tokenMintAddress) {
        throw new Error(`Token mint not found for ${tokenSymbol}`);
      }

      const tokenMint = new PublicKey(tokenMintAddress);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID,
      });

      const tokenAccount = tokenAccounts.value.find(
        (account) => account.account.data.parsed.info.mint === tokenMint.toString()
      );

      if (!tokenAccount) {
        return 0;
      }

      return Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmount);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  }

  async getSolBalance(walletAddress: string): Promise<number> {
    try {
      const wallet = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(wallet);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      return 0;
    }
  }
}

export const balanceService = BalanceService.getInstance();
