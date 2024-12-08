'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/utils/errorHandling';
import {
  createStakeInstruction,
  createUnstakeInstruction,
  createClaimRewardsInstruction,
  calculatePendingRewards,
  formatStakeAmount,
  parseStakeAmount,
  StakingPool,
  UserStake
} from '@/utils/staking';

export interface StakingContextType {
  userStakes: UserStake[];
  stakingPools: StakingPool[];
  isLoading: boolean;
  stake: (poolAddress: string, amount: number, duration: number, rewardType: string) => Promise<void>;
  unstake: (poolAddress: string) => Promise<void>;
  claimRewards: (poolAddress: string) => Promise<void>;
  refreshStakingData: () => Promise<void>;
}

const StakingContext = createContext<StakingContextType>({
  userStakes: [],
  stakingPools: [],
  isLoading: false,
  stake: async () => {},
  unstake: async () => {},
  claimRewards: async () => {},
  refreshStakingData: async () => {},
});

export const useStaking = () => useContext(StakingContext);

export const StakingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userStakes, setUserStakes] = useState<UserStake[]>([]);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);

  const refreshStakingData = useCallback(async () => {
    if (!publicKey) return;
    
    try {
      setIsLoading(true);
      // Fetch user stakes and staking pools data from your program
      // This is a placeholder implementation
      const fetchedStakes: UserStake[] = [];
      const fetchedPools: StakingPool[] = [];
      
      setUserStakes(fetchedStakes);
      setStakingPools(fetchedPools);
    } catch (error) {
      const handledError = handleError(error, 'Refresh Staking Data');
      toast({
        title: 'Error refreshing staking data',
        description: handledError.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection, toast]);

  useEffect(() => {
    refreshStakingData();
  }, [refreshStakingData]);

  const stake = async (poolAddress: string, amount: number, duration: number, rewardType: string) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      const poolPubkey = new PublicKey(poolAddress);
      const instruction = createStakeInstruction(
        connection,
        publicKey,
        poolPubkey,
        amount,
        duration,
        rewardType
      );

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      await refreshStakingData();
      
      toast({
        title: 'Stake successful',
        description: `Successfully staked ${formatStakeAmount(amount)} tokens`,
      });
    } catch (error) {
      const handledError = handleError(error, 'Stake');
      toast({
        title: 'Staking failed',
        description: handledError.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unstake = async (poolAddress: string) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      const poolPubkey = new PublicKey(poolAddress);
      const instruction = createUnstakeInstruction(
        connection,
        publicKey,
        poolPubkey
      );

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      await refreshStakingData();
      
      toast({
        title: 'Unstake successful',
        description: 'Successfully unstaked tokens',
      });
    } catch (error) {
      const handledError = handleError(error, 'Unstake');
      toast({
        title: 'Unstaking failed',
        description: handledError.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const claimRewards = async (poolAddress: string) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      const poolPubkey = new PublicKey(poolAddress);
      const instruction = createClaimRewardsInstruction(
        connection,
        publicKey,
        poolPubkey
      );

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      await refreshStakingData();
      
      toast({
        title: 'Claim successful',
        description: 'Successfully claimed rewards',
      });
    } catch (error) {
      const handledError = handleError(error, 'Claim Rewards');
      toast({
        title: 'Claiming rewards failed',
        description: handledError.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StakingContext.Provider
      value={{
        userStakes,
        stakingPools,
        isLoading,
        stake,
        unstake,
        claimRewards,
        refreshStakingData,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};
