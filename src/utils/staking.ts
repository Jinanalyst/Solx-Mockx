import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BN from 'bn.js';

export const STAKING_PROGRAM_ID = new PublicKey('DSwpgjMvXhtGn6BsbqmacdBZyfLj6jSWf3HJpdJtmg6N');
export const PLATFORM_FEE_WALLET = new PublicKey('6zkf4DviZZkpWVEh53MrcQV6vGXGpESnNXgAvU6KpBUH');

// Staking fee configuration
export const STAKING_FEES = {
  stakingFee: 0.001,  // 0.1% fee for staking
  unstakingFee: 0.002, // 0.2% fee for early unstaking
  claimFee: 0.0005    // 0.05% fee for claiming rewards
};

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

export async function createStakeInstruction(
  connection: Connection,
  userAccount: PublicKey,
  poolAddress: PublicKey,
  amount: BN,
  duration: number,
  rewardType: string
): Promise<TransactionInstruction> {
  const feeAmount = amount.muln(STAKING_FEES.stakingFee);
  
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: userAccount, isSigner: true, isWritable: true },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: PLATFORM_FEE_WALLET, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: STAKING_PROGRAM_ID,
    data: Buffer.from([
      /* instruction data */
    ]),
  });

  return instruction;
};

export async function createUnstakeInstruction(
  connection: Connection,
  userAccount: PublicKey,
  poolAddress: PublicKey,
  amount: BN,
  isEarlyUnstake: boolean
): Promise<TransactionInstruction> {
  const feeRate = isEarlyUnstake ? STAKING_FEES.unstakingFee : 0;
  const feeAmount = amount.muln(feeRate);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: userAccount, isSigner: true, isWritable: true },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: PLATFORM_FEE_WALLET, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: STAKING_PROGRAM_ID,
    data: Buffer.from([
      /* instruction data */
    ]),
  });

  return instruction;
}

export async function createClaimRewardsInstruction(
  connection: Connection,
  userAccount: PublicKey,
  poolAddress: PublicKey,
  rewardAmount: BN
): Promise<TransactionInstruction> {
  const feeAmount = rewardAmount.muln(STAKING_FEES.claimFee);

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: userAccount, isSigner: true, isWritable: true },
      { pubkey: poolAddress, isSigner: false, isWritable: true },
      { pubkey: PLATFORM_FEE_WALLET, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: STAKING_PROGRAM_ID,
    data: Buffer.from([
      /* instruction data */
    ]),
  });

  return instruction;
}

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
