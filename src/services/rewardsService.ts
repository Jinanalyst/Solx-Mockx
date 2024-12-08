import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getMint,
} from '@solana/spl-token';
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import {
  RewardsCalculator,
  REWARDS_WALLET,
  SOLX_TOKEN_ADDRESS,
  TradeDetails,
} from '@/utils/rewardsCalculator';

export class RewardsService {
  private static instance: RewardsService;
  private calculator: RewardsCalculator;
  private connection: Connection;
  private rewardsProgram: PublicKey;

  private constructor(endpoint: string) {
    this.calculator = RewardsCalculator.getInstance();
    this.connection = new Connection(endpoint, 'confirmed');
    this.rewardsProgram = new PublicKey(process.env.NEXT_PUBLIC_REWARDS_PROGRAM_ID || '');
  }

  public static getInstance(endpoint: string): RewardsService {
    if (!RewardsService.instance) {
      RewardsService.instance = new RewardsService(endpoint);
    }
    return RewardsService.instance;
  }

  private async getOrCreateAssociatedTokenAccount(walletAddress: PublicKey) {
    try {
      const associatedTokenAddress = await getAssociatedTokenAddress(
        SOLX_TOKEN_ADDRESS,
        walletAddress,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      try {
        await getAccount(this.connection, associatedTokenAddress);
        return associatedTokenAddress;
      } catch (error) {
        // If account doesn't exist, create it
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            walletAddress,
            associatedTokenAddress,
            walletAddress,
            SOLX_TOKEN_ADDRESS,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
        await this.connection.sendTransaction(transaction, []);
        return associatedTokenAddress;
      }
    } catch (error) {
      console.error('Error in getOrCreateAssociatedTokenAccount:', error);
      throw error;
    }
  }

  public async processTradeRewards(
    trade: TradeDetails,
    currentSolPrice: number,
    userWallet: PublicKey
  ): Promise<{ signature: string; rewards: number }> {
    try {
      // Calculate rewards
      const rewards = this.calculator.calculateRewards(trade, currentSolPrice);

      if (rewards.netRewardSolx <= 0) {
        console.log('No rewards to transfer');
        return { signature: '', rewards: 0 };
      }

      // Get or create user's SOLX token account
      const userTokenAccount = await this.getOrCreateAssociatedTokenAccount(userWallet);

      // Convert SOLX reward to token units
      const amount = this.calculator.solxToTokenUnits(rewards.netRewardSolx);

      // Create transfer instruction
      const transferInstruction = {
        instructedData: {
          type: 'spl_governance',
          data: {
            instruction: 3,
            args: {
              amount: amount.toString(),
            },
            accounts: [
              {
                pubkey: await this.getOrCreateAssociatedTokenAccount(REWARDS_WALLET),
                isSigner: false,
                isWritable: true,
              },
              {
                pubkey: userTokenAccount,
                isSigner: false,
                isWritable: true,
              },
              {
                pubkey: REWARDS_WALLET,
                isSigner: true,
                isWritable: false,
              },
            ],
          },
        },
        programId: TOKEN_PROGRAM_ID,
      };

      // Create and sign transaction
      const transaction = new Transaction().add(transferInstruction);
      
      // Send transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [/* Add your reward wallet keypair here */]
      );

      console.log('Rewards transferred successfully:', {
        signature,
        amount: rewards.netRewardSolx,
        recipient: userWallet.toString(),
      });

      return {
        signature,
        rewards: rewards.netRewardSolx,
      };
    } catch (error) {
      console.error('Error processing trade rewards:', error);
      throw error;
    }
  }

  public async getRewardsBalance(wallet: PublicKey): Promise<number> {
    try {
      const tokenAccount = await this.getOrCreateAssociatedTokenAccount(wallet);
      const balance = await getAccount(this.connection, tokenAccount);
      return balance.amount.toNumber() / 1e9; // Convert from token units to SOLX
    } catch (error) {
      console.error('Error getting rewards balance:', error);
      throw error;
    }
  }

  public getTotalFeesCollected() {
    return this.calculator.getTotalFeesCollected();
  }
}

// Example usage:
/*
const rewardsService = RewardsService.getInstance('https://api.mainnet-beta.solana.com');

const trade = {
  entryPrice: 1000,  // Bought at $1000
  exitPrice: 1050,   // Sold at $1050
  tradeSize: 1,      // 1 SOL
  side: 'long',
  timestamp: Date.now(),
  walletAddress: 'user_wallet_address'
};

const currentSolPrice = 1050;  // Current SOL price
const userWallet = new PublicKey('user_wallet_address');

// Process rewards
await rewardsService.processTradeRewards(trade, currentSolPrice, userWallet);
*/

export default RewardsService;
