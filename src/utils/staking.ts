import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ethers } from 'ethers';

export const STAKING_PROGRAM_ID = new PublicKey('DSwpgjMvXhtGn6BsbqmacdBZyfLj6jSWf3HJpdJtmg6N');

export interface StakingPool {
  poolAddress: PublicKey;
  tokenMint: PublicKey;
  rewardMint: PublicKey;
  apy: number;
  totalStaked: number;
  minStakeAmount: number;
  maxStakeAmount: number;
}

export interface UserStake {
  stakedAmount: number;
  rewardsEarned: number;
  stakingDuration: number;
  startTime: number;
  rewardToken: string;
}

export const createStakeInstruction = (
  connection: Connection,
  userAccount: PublicKey,
  poolAddress: PublicKey,
  amount: number,
  duration: number,
  rewardType: string
): TransactionInstruction => {
  return new TransactionInstruction({
    keys: [
      { pubkey: userAccount, isSigner: true, isWritable: true },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: STAKING_PROGRAM_ID,
    data: Buffer.from([]) // Add your instruction data here
  });
};

export const createUnstakeInstruction = (
  connection: Connection,
  userAccount: PublicKey,
  poolAddress: PublicKey
): TransactionInstruction => {
  return new TransactionInstruction({
    keys: [
      { pubkey: userAccount, isSigner: true, isWritable: true },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: STAKING_PROGRAM_ID,
    data: Buffer.from([]) // Add your instruction data here
  });
};

export const createClaimRewardsInstruction = (
  connection: Connection,
  userAccount: PublicKey,
  poolAddress: PublicKey
): TransactionInstruction => {
  return new TransactionInstruction({
    keys: [
      { pubkey: userAccount, isSigner: true, isWritable: true },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: STAKING_PROGRAM_ID,
    data: Buffer.from([]) // Add your instruction data here
  });
};

export const calculatePendingRewards = (
  stakeAmount: number,
  stakeDuration: number,
  apy: number,
  elapsedTime: number
): number => {
  const annualReward = stakeAmount * (apy / 100);
  const dailyReward = annualReward / 365;
  const daysElapsed = elapsedTime / (24 * 60 * 60 * 1000); // Convert ms to days
  return dailyReward * daysElapsed;
};

export const formatStakeAmount = (amount: number): string => {
  return ethers.formatUnits(amount.toString(), 9); // Assuming 9 decimals for SPL tokens
};

export const parseStakeAmount = (amount: string): number => {
  return parseInt(ethers.parseUnits(amount, 9).toString());
};
