'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { stakingService, StakingPool, UserStake } from '@/services/stakingService';
import { useWallet } from '@/contexts/WalletContext';

interface StakingContextType {
  pools: StakingPool[];
  userStakes: UserStake[];
  stake: (poolId: string, amount: BigNumber) => Promise<void>;
  unstake: (poolId: string, amount: BigNumber) => Promise<void>;
  claimRewards: (poolId: string) => Promise<BigNumber>;
  calculateRewards: (poolId: string) => Promise<BigNumber>;
}

const StakingContext = createContext<StakingContextType | undefined>(undefined);

export function StakingProvider({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [userStakes, setUserStakes] = useState<UserStake[]>([]);

  useEffect(() => {
    // Initialize the Solx/MockX staking pool if it doesn't exist
    const poolId = 'Solx-MockX';
    if (!stakingService.getPool(poolId)) {
      stakingService.createPool({
        tokenPair: ['Solx', 'MockX'],
        apr: 10000,
        rewardToken: 'Solx',
        stakingPeriod: 'unlimited',
        rewardDistribution: 'daily',
      });
    }
    
    // Update pools list
    const allPools = Array.from(pools.values());
    setPools(allPools);
  }, []);

  useEffect(() => {
    if (address) {
      const userStakes = stakingService.getUserStakes(address);
      setUserStakes(userStakes);
    }
  }, [address]);

  const stake = async (poolId: string, amount: BigNumber) => {
    if (!address) throw new Error('Wallet not connected');
    stakingService.stake(address, poolId, amount);
    setUserStakes(stakingService.getUserStakes(address));
  };

  const unstake = async (poolId: string, amount: BigNumber) => {
    if (!address) throw new Error('Wallet not connected');
    stakingService.unstake(address, poolId, amount);
    setUserStakes(stakingService.getUserStakes(address));
  };

  const claimRewards = async (poolId: string) => {
    if (!address) throw new Error('Wallet not connected');
    const rewards = stakingService.claimRewards(address, poolId);
    setUserStakes(stakingService.getUserStakes(address));
    return rewards;
  };

  const calculateRewards = async (poolId: string) => {
    if (!address) throw new Error('Wallet not connected');
    return stakingService.calculateRewards(address, poolId);
  };

  return (
    <StakingContext.Provider
      value={{
        pools,
        userStakes,
        stake,
        unstake,
        claimRewards,
        calculateRewards,
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
