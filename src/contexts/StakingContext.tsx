'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl_token';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/utils/errorHandling';
import BN from 'bn.js';
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
    totalStaked: BN;
  };
  mockxPool: {
    apy: number;
    totalStaked: BN;
  };
  userSolxStake: UserStake | null;
  userMockxStake: UserStake | null;
  isLoading: boolean;
  stakeSolx: (amount: BN) => Promise<void>;
  stakeMockx: (amount: BN) => Promise<void>;
  unstakeSolx: (amount: BN) => Promise<void>;
  unstakeMockx: (amount: BN) => Promise<void>;
  claimSolxRewards: () => Promise<void>;
  claimMockxRewards: () => Promise<void>;
  refreshStakingData: () => Promise<void>;
}

const StakingContext = createContext<StakingContextType>({
  solxPool: {
    apy: 60, // Default APY
    totalStaked: new BN(0),
  },
  mockxPool: {
    apy: 40, // Default APY
    totalStaked: new BN(0),
  },
  userSolxStake: null,
  userMockxStake: null,
  isLoading: true,
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
  const wallet = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  const [solxPool, setSolxPool] = useState({
    apy: 60,
    totalStaked: new BN(0),
  });
  
  const [mockxPool, setMockxPool] = useState({
    apy: 40,
    totalStaked: new BN(0),
  });
  
  const [userSolxStake, setUserSolxStake] = useState<UserStake | null>(null);
  const [userMockxStake, setUserMockxStake] = useState<UserStake | null>(null);

  const refreshStakingData = useCallback(async () => {
    if (!wallet.publicKey) return;
    
    try {
      setIsLoading(true);
      
      // Fetch pool data
      const [solxPoolData, mockxPoolData] = await Promise.all([
        StakingPool.fetch(connection, new PublicKey('SOLX_POOL_ADDRESS')),
        StakingPool.fetch(connection, new PublicKey('MOCKX_POOL_ADDRESS')),
      ]);
      
      setSolxPool({
        apy: solxPoolData.apy,
        totalStaked: solxPoolData.totalStaked,
      });
      
      setMockxPool({
        apy: mockxPoolData.apy,
        totalStaked: mockxPoolData.totalStaked,
      });
      
      // Fetch user stakes if wallet is connected
      if (wallet.publicKey) {
        const [solxStake, mockxStake] = await Promise.all([
          UserStake.fetch(connection, wallet.publicKey, new PublicKey('SOLX_POOL_ADDRESS')),
          UserStake.fetch(connection, wallet.publicKey, new PublicKey('MOCKX_POOL_ADDRESS')),
        ]);
        
        setUserSolxStake(solxStake);
        setUserMockxStake(mockxStake);
      }
    } catch (error) {
      handleError(error, toast);
    } finally {
      setIsLoading(false);
    }
  }, [connection, wallet.publicKey, toast]);

  const stakeSolx = async (amount: BN) => {
    if (!wallet.publicKey || !wallet.sendTransaction) return;
    
    try {
      const instruction = await createStakeInstruction(
        connection,
        wallet.publicKey,
        new PublicKey('SOLX_POOL_ADDRESS'),
        amount
      );
      
      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      
      await refreshStakingData();
      
      toast({
        title: 'Stake Successful',
        description: `Successfully staked ${formatStakeAmount(amount)} SOLX tokens`,
      });
    } catch (error) {
      handleError(error, toast);
    }
  };

  const stakeMockx = async (amount: BN) => {
    if (!wallet.publicKey || !wallet.sendTransaction) return;
    
    try {
      const instruction = await createStakeInstruction(
        connection,
        wallet.publicKey,
        new PublicKey('MOCKX_POOL_ADDRESS'),
        amount
      );
      
      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      
      await refreshStakingData();
      
      toast({
        title: 'Stake Successful',
        description: `Successfully staked ${formatStakeAmount(amount)} MOCKX tokens`,
      });
    } catch (error) {
      handleError(error, toast);
    }
  };

  const unstakeSolx = async (amount: BN) => {
    if (!wallet.publicKey || !wallet.sendTransaction) return;
    
    try {
      const instruction = await createUnstakeInstruction(
        connection,
        wallet.publicKey,
        new PublicKey('SOLX_POOL_ADDRESS'),
        amount
      );
      
      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      
      await refreshStakingData();
      
      toast({
        title: 'Unstake Successful',
        description: `Successfully unstaked ${formatStakeAmount(amount)} SOLX tokens`,
      });
    } catch (error) {
      handleError(error, toast);
    }
  };

  const unstakeMockx = async (amount: BN) => {
    if (!wallet.publicKey || !wallet.sendTransaction) return;
    
    try {
      const instruction = await createUnstakeInstruction(
        connection,
        wallet.publicKey,
        new PublicKey('MOCKX_POOL_ADDRESS'),
        amount
      );
      
      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      
      await refreshStakingData();
      
      toast({
        title: 'Unstake Successful',
        description: `Successfully unstaked ${formatStakeAmount(amount)} MOCKX tokens`,
      });
    } catch (error) {
      handleError(error, toast);
    }
  };

  const claimSolxRewards = async () => {
    if (!wallet.publicKey || !wallet.sendTransaction) return;
    
    try {
      const instruction = await createClaimRewardsInstruction(
        connection,
        wallet.publicKey,
        new PublicKey('SOLX_POOL_ADDRESS')
      );
      
      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      
      await refreshStakingData();
      
      toast({
        title: 'Claim Successful',
        description: 'Successfully claimed SOLX rewards',
      });
    } catch (error) {
      handleError(error, toast);
    }
  };

  const claimMockxRewards = async () => {
    if (!wallet.publicKey || !wallet.sendTransaction) return;
    
    try {
      const instruction = await createClaimRewardsInstruction(
        connection,
        wallet.publicKey,
        new PublicKey('MOCKX_POOL_ADDRESS')
      );
      
      const transaction = new Transaction().add(instruction);
      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      
      await refreshStakingData();
      
      toast({
        title: 'Claim Successful',
        description: 'Successfully claimed MOCKX rewards',
      });
    } catch (error) {
      handleError(error, toast);
    }
  };

  useEffect(() => {
    refreshStakingData();
  }, [refreshStakingData]);

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
