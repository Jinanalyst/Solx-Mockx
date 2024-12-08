'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BigNumberish } from 'ethers';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { BN } from 'bn.js';
import { useToast } from '@/components/ui/use-toast';
import {
  SOLX_TOKEN_MINT,
  MOCKX_TOKEN_MINT,
  createStakeInstruction,
  createUnstakeInstruction,
  createClaimRewardsInstruction,
  getStakeAccountInfo,
  getPoolInfo,
} from '@/utils/staking';

interface StakingPool {
  apy: number;
  totalStaked: BigNumberish;
  rewardToken: string;
  tokenAddress: string;
}

interface UserStake {
  stakedAmount: BigNumberish;
  rewardsEarned: BigNumberish;
  stakingDuration: number;
  startTime: number;
  rewardToken: string;
}

interface StakingContextType {
  solxPool: StakingPool;
  mockxPool: StakingPool;
  userSolxStake?: UserStake;
  userMockxStake?: UserStake;
  stakeSolx: (amount: BigNumberish, duration: number, rewardToken: string) => Promise<void>;
  stakeMockx: (amount: BigNumberish, duration: number, rewardToken: string) => Promise<void>;
  unstakeSolx: (amount: BigNumberish) => Promise<void>;
  unstakeMockx: (amount: BigNumberish) => Promise<void>;
  claimSolxRewards: () => Promise<void>;
  claimMockxRewards: () => Promise<void>;
}

const StakingContext = createContext<StakingContextType | undefined>(undefined);

export function StakingProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { toast } = useToast();
  
  const [solxPool, setSolxPool] = useState<StakingPool>({
    apy: 60.0,
    totalStaked: BigInt(0),
    rewardToken: 'SOLX',
    tokenAddress: SOLX_TOKEN_MINT.toString(),
  });

  const [mockxPool, setMockxPool] = useState<StakingPool>({
    apy: 60.0,
    totalStaked: BigInt(0),
    rewardToken: 'MOCKX',
    tokenAddress: MOCKX_TOKEN_MINT.toString(),
  });

  const [userSolxStake, setUserSolxStake] = useState<UserStake>();
  const [userMockxStake, setUserMockxStake] = useState<UserStake>();

  // Fetch pool and stake information
  useEffect(() => {
    const fetchData = async () => {
      if (!wallet.publicKey) return;

      try {
        // Fetch SOLX pool info
        const solxPoolInfo = await getPoolInfo(connection, SOLX_TOKEN_MINT);
        if (solxPoolInfo) {
          setSolxPool(prev => ({
            ...prev,
            totalStaked: solxPoolInfo.totalStaked,
          }));
        }

        // Fetch MOCKX pool info
        const mockxPoolInfo = await getPoolInfo(connection, MOCKX_TOKEN_MINT);
        if (mockxPoolInfo) {
          setMockxPool(prev => ({
            ...prev,
            totalStaked: mockxPoolInfo.totalStaked,
          }));
        }

        // Fetch user SOLX stake info
        const solxStakeInfo = await getStakeAccountInfo(connection, wallet.publicKey, SOLX_TOKEN_MINT);
        if (solxStakeInfo) {
          setUserSolxStake({
            stakedAmount: solxStakeInfo.stakedAmount,
            rewardsEarned: solxStakeInfo.rewardsEarned,
            stakingDuration: solxStakeInfo.stakingDuration,
            startTime: solxStakeInfo.startTime,
            rewardToken: solxStakeInfo.rewardToken.toString(),
          });
        }

        // Fetch user MOCKX stake info
        const mockxStakeInfo = await getStakeAccountInfo(connection, wallet.publicKey, MOCKX_TOKEN_MINT);
        if (mockxStakeInfo) {
          setUserMockxStake({
            stakedAmount: mockxStakeInfo.stakedAmount,
            rewardsEarned: mockxStakeInfo.rewardsEarned,
            stakingDuration: mockxStakeInfo.stakingDuration,
            startTime: mockxStakeInfo.startTime,
            rewardToken: mockxStakeInfo.rewardToken.toString(),
          });
        }
      } catch (error) {
        console.error('Error fetching staking data:', error);
      }
    };

    fetchData();
    // Set up interval to refresh data
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [connection, wallet.publicKey]);

  const stakeSolx = useCallback(async (amount: BigNumberish, duration: number, rewardToken: string) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to stake SOLX tokens',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rewardTokenMint = rewardToken === 'SOLX' ? SOLX_TOKEN_MINT : MOCKX_TOKEN_MINT;
      const instructions = await createStakeInstruction(
        connection,
        wallet.publicKey,
        SOLX_TOKEN_MINT,
        new BN(amount.toString()),
        duration,
        rewardTokenMint
      );

      const transaction = new Transaction().add(...instructions);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTx = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid);

      toast({
        title: 'Staking Successful',
        description: `Successfully staked ${amount.toString()} SOLX tokens`,
      });
    } catch (error) {
      toast({
        title: 'Staking Failed',
        description: error instanceof Error ? error.message : 'Failed to stake SOLX tokens',
        variant: 'destructive',
      });
    }
  }, [connection, wallet, toast]);

  const stakeMockx = useCallback(async (amount: BigNumberish, duration: number, rewardToken: string) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to stake MOCKX tokens',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rewardTokenMint = rewardToken === 'SOLX' ? SOLX_TOKEN_MINT : MOCKX_TOKEN_MINT;
      const instructions = await createStakeInstruction(
        connection,
        wallet.publicKey,
        MOCKX_TOKEN_MINT,
        new BN(amount.toString()),
        duration,
        rewardTokenMint
      );

      const transaction = new Transaction().add(...instructions);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTx = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid);

      toast({
        title: 'Staking Successful',
        description: `Successfully staked ${amount.toString()} MOCKX tokens`,
      });
    } catch (error) {
      toast({
        title: 'Staking Failed',
        description: error instanceof Error ? error.message : 'Failed to stake MOCKX tokens',
        variant: 'destructive',
      });
    }
  }, [connection, wallet, toast]);

  const unstakeSolx = useCallback(async (amount: BigNumberish) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: 'Cannot Unstake',
        description: 'Please connect your wallet and ensure you have staked tokens',
        variant: 'destructive',
      });
      return;
    }

    try {
      const instruction = await createUnstakeInstruction(
        wallet.publicKey,
        SOLX_TOKEN_MINT,
        new BN(amount.toString())
      );

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTx = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid);

      toast({
        title: 'Unstaking Successful',
        description: `Successfully unstaked ${amount.toString()} SOLX tokens`,
      });
    } catch (error) {
      toast({
        title: 'Unstaking Failed',
        description: error instanceof Error ? error.message : 'Failed to unstake SOLX tokens',
        variant: 'destructive',
      });
    }
  }, [connection, wallet, toast]);

  const unstakeMockx = useCallback(async (amount: BigNumberish) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: 'Cannot Unstake',
        description: 'Please connect your wallet and ensure you have staked tokens',
        variant: 'destructive',
      });
      return;
    }

    try {
      const instruction = await createUnstakeInstruction(
        wallet.publicKey,
        MOCKX_TOKEN_MINT,
        new BN(amount.toString())
      );

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTx = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid);

      toast({
        title: 'Unstaking Successful',
        description: `Successfully unstaked ${amount.toString()} MOCKX tokens`,
      });
    } catch (error) {
      toast({
        title: 'Unstaking Failed',
        description: error instanceof Error ? error.message : 'Failed to unstake MOCKX tokens',
        variant: 'destructive',
      });
    }
  }, [connection, wallet, toast]);

  const claimSolxRewards = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: 'Cannot Claim Rewards',
        description: 'Please connect your wallet and ensure you have staked tokens',
        variant: 'destructive',
      });
      return;
    }

    try {
      const instruction = await createClaimRewardsInstruction(
        wallet.publicKey,
        SOLX_TOKEN_MINT
      );

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTx = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid);

      toast({
        title: 'Rewards Claimed',
        description: 'Successfully claimed SOLX staking rewards',
      });
    } catch (error) {
      toast({
        title: 'Claiming Failed',
        description: error instanceof Error ? error.message : 'Failed to claim SOLX rewards',
        variant: 'destructive',
      });
    }
  }, [connection, wallet, toast]);

  const claimMockxRewards = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: 'Cannot Claim Rewards',
        description: 'Please connect your wallet and ensure you have staked tokens',
        variant: 'destructive',
      });
      return;
    }

    try {
      const instruction = await createClaimRewardsInstruction(
        wallet.publicKey,
        MOCKX_TOKEN_MINT
      );

      const transaction = new Transaction().add(instruction);
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTx = await wallet.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(txid);

      toast({
        title: 'Rewards Claimed',
        description: 'Successfully claimed MOCKX staking rewards',
      });
    } catch (error) {
      toast({
        title: 'Claiming Failed',
        description: error instanceof Error ? error.message : 'Failed to claim MOCKX rewards',
        variant: 'destructive',
      });
    }
  }, [connection, wallet, toast]);

  return (
    <StakingContext.Provider
      value={{
        solxPool,
        mockxPool,
        userSolxStake,
        userMockxStake,
        stakeSolx,
        stakeMockx,
        unstakeSolx,
        unstakeMockx,
        claimSolxRewards,
        claimMockxRewards,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
}

export function useStaking() {
  const context = useContext(StakingContext);
  if (context === undefined) {
    throw new Error('useStaking must be used within a StakingProvider');
  }
  return context;
}
