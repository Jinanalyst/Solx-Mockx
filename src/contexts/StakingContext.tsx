'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl_token';
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
  solxPool: {
    apy: number;
    totalStaked: number;
  };
  mockxPool: {
    apy: number;
    totalStaked: number;
  };
  userSolxStake: UserStake | null;
  userMockxStake: UserStake | null;
  isLoading: boolean;
  stakeSolx: (amount: number) => Promise<void>;
  stakeMockx: (amount: number) => Promise<void>;
  unstakeSolx: () => Promise<void>;
  unstakeMockx: () => Promise<void>;
  claimSolxRewards: () => Promise<void>;
  claimMockxRewards: () => Promise<void>;
  refreshStakingData: () => Promise<void>;
}

const StakingContext = createContext<StakingContextType>({
  solxPool: {
    apy: 60, // Default APY
    totalStaked: 0,
  },
  mockxPool: {
    apy: 60, // Default APY
    totalStaked: 0,
  },
  userSolxStake: null,
  userMockxStake: null,
  isLoading: false,
  stakeSolx: async () => {},
  stakeMockx: async () => {},
  unstakeSolx: async () => {},
  unstakeMockx: async () => {},
  claimSolxRewards: async () => {},
  claimMockxRewards: async () => {},
  refreshStakingData: async () => {},
});

export const useStaking = () => useContext(StakingContext);

export const StakingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [solxPool, setSolxPool] = useState({
    apy: 60,
    totalStaked: 0,
  });
  const [mockxPool, setMockxPool] = useState({
    apy: 60,
    totalStaked: 0,
  });
  const [userSolxStake, setUserSolxStake] = useState<UserStake | null>(null);
  const [userMockxStake, setUserMockxStake] = useState<UserStake | null>(null);

  const refreshStakingData = useCallback(async () => {
    if (!publicKey) return;
    
    try {
      setIsLoading(true);
      // Fetch staking data from your program
      // This is a placeholder implementation
      const fetchedSolxPool = {
        apy: 60,
        totalStaked: 0,
      };
      const fetchedMockxPool = {
        apy: 60,
        totalStaked: 0,
      };
      
      setSolxPool(fetchedSolxPool);
      setMockxPool(fetchedMockxPool);
      
      // Fetch user stakes
      setUserSolxStake(null);
      setUserMockxStake(null);
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

  const stakeSolx = async (amount: number) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      // Implementation for staking SOLX
      await refreshStakingData();
      
      toast({
        title: 'Stake successful',
        description: `Successfully staked ${formatStakeAmount(amount)} SOLX tokens`,
      });
    } catch (error) {
      const handledError = handleError(error, 'Stake SOLX');
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

  const stakeMockx = async (amount: number) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      // Implementation for staking MOCKX
      await refreshStakingData();
      
      toast({
        title: 'Stake successful',
        description: `Successfully staked ${formatStakeAmount(amount)} MOCKX tokens`,
      });
    } catch (error) {
      const handledError = handleError(error, 'Stake MOCKX');
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

  const unstakeSolx = async () => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      // Implementation for unstaking SOLX
      await refreshStakingData();
      
      toast({
        title: 'Unstake successful',
        description: 'Successfully unstaked SOLX tokens',
      });
    } catch (error) {
      const handledError = handleError(error, 'Unstake SOLX');
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

  const unstakeMockx = async () => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      // Implementation for unstaking MOCKX
      await refreshStakingData();
      
      toast({
        title: 'Unstake successful',
        description: 'Successfully unstaked MOCKX tokens',
      });
    } catch (error) {
      const handledError = handleError(error, 'Unstake MOCKX');
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

  const claimSolxRewards = async () => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      // Implementation for claiming SOLX rewards
      await refreshStakingData();
      
      toast({
        title: 'Claim successful',
        description: 'Successfully claimed SOLX rewards',
      });
    } catch (error) {
      const handledError = handleError(error, 'Claim SOLX Rewards');
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

  const claimMockxRewards = async () => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setIsLoading(true);
      // Implementation for claiming MOCKX rewards
      await refreshStakingData();
      
      toast({
        title: 'Claim successful',
        description: 'Successfully claimed MOCKX rewards',
      });
    } catch (error) {
      const handledError = handleError(error, 'Claim MOCKX Rewards');
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
        solxPool,
        mockxPool,
        userSolxStake,
        userMockxStake,
        isLoading,
        stakeSolx,
        stakeMockx,
        unstakeSolx,
        unstakeMockx,
        claimSolxRewards,
        claimMockxRewards,
        refreshStakingData,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};
