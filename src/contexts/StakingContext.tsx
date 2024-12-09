'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { StakingPool, UserStake } from '@/utils/staking';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

interface StakingContextType {
  solxPool: StakingPool;
  mockxPool: StakingPool;
  userSolxStake: UserStake | null;
  userMockxStake: UserStake | null;
  stakeSolx: (amount: BN) => Promise<void>;
  stakeMockx: (amount: BN) => Promise<void>;
  unstakeSolx: (amount: BN) => Promise<void>;
  unstakeMockx: (amount: BN) => Promise<void>;
  claimSolxRewards: () => Promise<void>;
  claimMockxRewards: () => Promise<void>;
}

const defaultPool: StakingPool = {
  poolAddress: new PublicKey('11111111111111111111111111111111'),
  tokenMint: new PublicKey('11111111111111111111111111111111'),
  rewardMint: new PublicKey('11111111111111111111111111111111'),
  apy: 0,
  totalStaked: new BN(0),
  minStakeAmount: new BN(0),
  maxStakeAmount: new BN(0),
};

const StakingContext = createContext<StakingContextType>({
  solxPool: defaultPool,
  mockxPool: defaultPool,
  userSolxStake: null,
  userMockxStake: null,
  stakeSolx: async () => {},
  stakeMockx: async () => {},
  unstakeSolx: async () => {},
  unstakeMockx: async () => {},
  claimSolxRewards: async () => {},
  claimMockxRewards: async () => {},
});

export function useStaking() {
  return useContext(StakingContext);
}

export function StakingProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [solxPool, setSolxPool] = useState<StakingPool>(defaultPool);
  const [mockxPool, setMockxPool] = useState<StakingPool>(defaultPool);
  const [userSolxStake, setUserSolxStake] = useState<UserStake | null>(null);
  const [userMockxStake, setUserMockxStake] = useState<UserStake | null>(null);

  useEffect(() => {
    if (!wallet.publicKey) {
      setUserSolxStake(null);
      setUserMockxStake(null);
      return;
    }

    // Fetch user stakes when wallet is connected
    fetchUserStakes();
  }, [wallet.publicKey, connection]);

  useEffect(() => {
    // Fetch pool data
    fetchPoolData();
  }, [connection]);

  const fetchPoolData = async () => {
    try {
      // Implement pool data fetching
      // For now, using mock data
      setSolxPool({
        ...defaultPool,
        apy: 12,
        totalStaked: new BN(1000000),
      });
      setMockxPool({
        ...defaultPool,
        apy: 8,
        totalStaked: new BN(500000),
      });
    } catch (error) {
      console.error('Error fetching pool data:', error);
    }
  };

  const fetchUserStakes = async () => {
    if (!wallet.publicKey) return;

    try {
      // Implement user stakes fetching
      // For now, using mock data
      setUserSolxStake({
        stakedAmount: new BN(100),
        rewardsEarned: new BN(10),
        stakingDuration: 30,
        startTime: Date.now(),
        rewardToken: 'SOLX',
      });
      setUserMockxStake({
        stakedAmount: new BN(50),
        rewardsEarned: new BN(5),
        stakingDuration: 30,
        startTime: Date.now(),
        rewardToken: 'MOCKX',
      });
    } catch (error) {
      console.error('Error fetching user stakes:', error);
    }
  };

  const stakeSolx = async (amount: BN) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    // Implement SOLX staking
  };

  const stakeMockx = async (amount: BN) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    // Implement MOCKX staking
  };

  const unstakeSolx = async (amount: BN) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    // Implement SOLX unstaking
  };

  const unstakeMockx = async (amount: BN) => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    // Implement MOCKX unstaking
  };

  const claimSolxRewards = async () => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    // Implement SOLX rewards claiming
  };

  const claimMockxRewards = async () => {
    if (!wallet.publicKey) throw new Error('Wallet not connected');
    // Implement MOCKX rewards claiming
  };

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
