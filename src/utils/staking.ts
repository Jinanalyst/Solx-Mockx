import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction,
} from '@solana/spl-token';
import { BN } from 'bn.js';
import { ethers } from 'ethers';

// Program ID for the staking program
export const STAKING_PROGRAM_ID = new PublicKey('DSwpgjMvXhtGn6BsbqmacdBZyfLj6jSWf3HJpdJtmg6N');

// Token mint addresses
export const SOLX_TOKEN_MINT = new PublicKey('2k42cRS5yBmgXGiEGwebC8Y5BQvWH4xr5UKP5TijysTP');
export const MOCKX_TOKEN_MINT = new PublicKey('Hr3p3tS5e3SaRLW9pJrnPHYmfx9po18c1crwd1ZNSyYE');

export interface StakeInstruction {
  programId: PublicKey;
  keys: {
    stakingPool: PublicKey;
    userStakeAccount: PublicKey;
    userTokenAccount: PublicKey;
    tokenProgram: PublicKey;
  };
  data: Buffer;
}

export async function findStakingPoolAddress(
  tokenMint: PublicKey,
  programId: PublicKey = STAKING_PROGRAM_ID
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from('staking_pool'), tokenMint.toBuffer()],
    programId
  );
}

export async function findUserStakeAddress(
  owner: PublicKey,
  tokenMint: PublicKey,
  programId: PublicKey = STAKING_PROGRAM_ID
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from('user_stake'), owner.toBuffer(), tokenMint.toBuffer()],
    programId
  );
}

export async function createStakeInstruction(
  connection: Connection,
  userPublicKey: PublicKey,
  tokenMint: PublicKey,
  amount: BN,
  duration: number,
  rewardTokenMint: PublicKey
): Promise<TransactionInstruction[]> {
  const instructions: TransactionInstruction[] = [];

  // Get staking pool address
  const [stakingPool] = await findStakingPoolAddress(tokenMint);
  
  // Get user stake account address
  const [userStakeAccount] = await findUserStakeAddress(
    userPublicKey,
    tokenMint
  );

  // Get user token account
  const userTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    userPublicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Get pool token account
  const [poolTokenAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('pool_token_account'), stakingPool.toBuffer()],
    STAKING_PROGRAM_ID
  );

  // Check if user token account exists
  const userTokenAccountInfo = await connection.getAccountInfo(userTokenAccount);
  if (!userTokenAccountInfo) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        userPublicKey,
        userTokenAccount,
        userPublicKey,
        tokenMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Create stake instruction
  const stakeInstruction = new TransactionInstruction({
    programId: STAKING_PROGRAM_ID,
    keys: [
      { pubkey: stakingPool, isSigner: false, isWritable: true },
      { pubkey: userStakeAccount, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userPublicKey, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([
      0, // Instruction index for stake
      ...amount.toArray('le', 8),
      ...new BN(duration).toArray('le', 4),
      ...rewardTokenMint.toBuffer(),
    ]),
  });

  instructions.push(stakeInstruction);
  return instructions;
}

export async function createUnstakeInstruction(
  userPublicKey: PublicKey,
  tokenMint: PublicKey,
  amount: BN
): Promise<TransactionInstruction> {
  // Get staking pool address
  const [stakingPool] = await findStakingPoolAddress(tokenMint);
  
  // Get user stake account address
  const [userStakeAccount] = await findUserStakeAddress(
    userPublicKey,
    tokenMint
  );

  // Get user token account
  const userTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    userPublicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Get pool token account
  const [poolTokenAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('pool_token_account'), stakingPool.toBuffer()],
    STAKING_PROGRAM_ID
  );

  return new TransactionInstruction({
    programId: STAKING_PROGRAM_ID,
    keys: [
      { pubkey: stakingPool, isSigner: false, isWritable: true },
      { pubkey: userStakeAccount, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userPublicKey, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([
      1, // Instruction index for unstake
      ...amount.toArray('le', 8),
    ]),
  });
}

export async function createClaimRewardsInstruction(
  userPublicKey: PublicKey,
  tokenMint: PublicKey
): Promise<TransactionInstruction> {
  // Get staking pool address
  const [stakingPool] = await findStakingPoolAddress(tokenMint);
  
  // Get user stake account address
  const [userStakeAccount] = await findUserStakeAddress(
    userPublicKey,
    tokenMint
  );

  // Get user reward token account
  const userRewardTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    userPublicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Get pool reward token account
  const [poolRewardAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('pool_reward_account'), stakingPool.toBuffer()],
    STAKING_PROGRAM_ID
  );

  return new TransactionInstruction({
    programId: STAKING_PROGRAM_ID,
    keys: [
      { pubkey: stakingPool, isSigner: false, isWritable: true },
      { pubkey: userStakeAccount, isSigner: false, isWritable: true },
      { pubkey: userRewardTokenAccount, isSigner: false, isWritable: true },
      { pubkey: poolRewardAccount, isSigner: false, isWritable: true },
      { pubkey: userPublicKey, isSigner: true, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([2]), // Instruction index for claim rewards
  });
}

export async function getStakeAccountInfo(
  connection: Connection,
  userPublicKey: PublicKey,
  tokenMint: PublicKey
) {
  const [userStakeAccount] = await findUserStakeAddress(
    userPublicKey,
    tokenMint
  );

  try {
    const accountInfo = await connection.getAccountInfo(userStakeAccount);
    if (!accountInfo) {
      return null;
    }

    // Parse account info based on the stake account structure
    // Assuming the following layout:
    // - owner (32 bytes)
    // - staked_amount (8 bytes)
    // - rewards_earned (8 bytes)
    // - staking_duration (4 bytes)
    // - start_time (4 bytes)
    // - reward_token (32 bytes)
    return {
      owner: new PublicKey(accountInfo.data.slice(0, 32)),
      stakedAmount: new BN(accountInfo.data.slice(32, 40), 'le'),
      rewardsEarned: new BN(accountInfo.data.slice(40, 48), 'le'),
      stakingDuration: new BN(accountInfo.data.slice(48, 52), 'le').toNumber(),
      startTime: new BN(accountInfo.data.slice(52, 56), 'le').toNumber(),
      rewardToken: new PublicKey(accountInfo.data.slice(56, 88)),
    };
  } catch (error) {
    console.error('Error fetching stake account info:', error);
    return null;
  }
}

export async function getPoolInfo(
  connection: Connection,
  tokenMint: PublicKey
) {
  const [stakingPool] = await findStakingPoolAddress(tokenMint);

  try {
    const accountInfo = await connection.getAccountInfo(stakingPool);
    if (!accountInfo) {
      return null;
    }

    // Parse account info based on the pool account structure
    // Assuming the following layout:
    // - total_staked (8 bytes)
    // - reward_rate (8 bytes)
    // - last_update_time (4 bytes)
    return {
      totalStaked: new BN(accountInfo.data.slice(0, 8), 'le'),
      rewardRate: new BN(accountInfo.data.slice(8, 16), 'le'),
      lastUpdateTime: new BN(accountInfo.data.slice(16, 20), 'le').toNumber(),
    };
  } catch (error) {
    console.error('Error fetching pool info:', error);
    return null;
  }
}

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
  amount: number;
  startTime: number;
  duration: number;
  rewardType: string;
  pendingRewards: number;
}

export const createStakeInstructionNew = (
  connection: Connection,
  userAccount: PublicKey,
  poolAddress: PublicKey,
  amount: number,
  duration: number,
  rewardType: string
): TransactionInstruction => {
  // Implementation will depend on your staking program's instruction format
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

export const createUnstakeInstructionNew = (
  connection: Connection,
  userAccount: PublicKey,
  poolAddress: PublicKey
): TransactionInstruction => {
  // Implementation will depend on your staking program's instruction format
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

export const createClaimRewardsInstructionNew = (
  connection: Connection,
  userAccount: PublicKey,
  poolAddress: PublicKey
): TransactionInstruction => {
  // Implementation will depend on your staking program's instruction format
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
