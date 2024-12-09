import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';

export const STAKING_PROGRAM_ID = new PublicKey('DSwpgjMvXhtGn6BsbqmacdBZyfLj6jSWf3HJpdJtmg6N');

export interface StakingPool {
  poolAddress: PublicKey;
  tokenMint: PublicKey;
  rewardMint: PublicKey;
  apy: number;
  totalStaked: BN;
  minStakeAmount: BN;
  maxStakeAmount: BN;
}

export interface UserStake {
  stakedAmount: BN;
  rewardsEarned: BN;
  stakingDuration: number;
  startTime: number;
  rewardToken: string;
}

export const createStakeInstruction = (
  connection: Connection,
  userAccount: PublicKey,
  poolAddress: PublicKey,
  amount: BN,
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
  stakeAmount: BN,
  stakeDuration: number,
  apy: number,
  elapsedTime: number
): BN => {
  const annualRate = new BN(apy).mul(new BN(1e4));
  const timeRatio = new BN(elapsedTime).mul(new BN(1e4)).div(new BN(365 * 24 * 60 * 60));
  return stakeAmount.mul(annualRate).mul(timeRatio).div(new BN(1e8));
};

export const formatStakeAmount = (amount: BN): string => {
  return amount.toString();
};

export const parseStakeAmount = (amount: string): BN => {
  return new BN(amount).mul(new BN(1e9)); // Convert to lamports (9 decimals)
};
