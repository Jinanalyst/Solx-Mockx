'use client';

import React, { FC, useState } from 'react';
import { useStaking } from '@/contexts/StakingContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BN from 'bn.js';

interface UserStake {
  stakedAmount: BN;
  rewardsEarned: BN;
  stakingDuration: number;
}

interface StakingPoolProps {
  tokenSymbol: string;
  apy: number;
  totalStaked: BN;
  userStake?: UserStake;
  onStake: (amount: BN) => Promise<void>;
  onUnstake: (amount: BN) => Promise<void>;
  onClaimRewards: () => Promise<void>;
  onError: (error: unknown) => void;
}

interface StakingContext {
  solxPool: {
    apy: number;
    totalStaked: BN;
  };
  mockxPool: {
    apy: number;
    totalStaked: BN;
  };
  userSolxStake?: UserStake;
  userMockxStake?: UserStake;
  stakeSolx: (amount: BN) => Promise<void>;
  stakeMockx: (amount: BN) => Promise<void>;
  unstakeSolx: (amount: BN) => Promise<void>;
  unstakeMockx: (amount: BN) => Promise<void>;
  claimSolxRewards: () => Promise<void>;
  claimMockxRewards: () => Promise<void>;
}

const formatAmount = (amount: BN, decimals: number = 9): string => {
  const divisor = new BN(10).pow(new BN(decimals));
  const integerPart = amount.div(divisor);
  const fractionalPart = amount.mod(divisor).toString().padStart(decimals, '0');
  return `${integerPart.toString()}.${fractionalPart}`;
};

const parseAmount = (amount: string, decimals: number = 9): BN => {
  const [integer, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0');
  return new BN(integer + paddedFraction);
};

const StakingPool: FC<StakingPoolProps> = ({
  tokenSymbol,
  apy,
  totalStaked,
  userStake,
  onStake,
  onUnstake,
  onClaimRewards,
  onError,
}) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const handleStake = async () => {
    try {
      setIsStaking(true);
      const parsedAmount = parseAmount(stakeAmount);
      await onStake(parsedAmount);
      setStakeAmount('');
    } catch (error) {
      onError(error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    try {
      setIsUnstaking(true);
      const parsedAmount = parseAmount(unstakeAmount);
      await onUnstake(parsedAmount);
      setUnstakeAmount('');
    } catch (error) {
      onError(error);
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setIsClaiming(true);
      await onClaimRewards();
    } catch (error) {
      onError(error);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{tokenSymbol} Staking Pool</h3>
        <span className="text-sm text-gray-500">APY: {apy}%</span>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-500">Total Staked</p>
        <p className="font-medium">{formatAmount(totalStaked)} {tokenSymbol}</p>
      </div>

      {userStake && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Your Stake</p>
          <p className="font-medium">{formatAmount(userStake.stakedAmount)} {tokenSymbol}</p>
          <p className="text-sm text-gray-500">Rewards Earned</p>
          <p className="font-medium">{formatAmount(userStake.rewardsEarned)} {tokenSymbol}</p>
        </div>
      )}

      <div className="space-y-2">
        <Input
          type="number"
          placeholder="Amount to stake"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
        />
        <Button
          className="w-full"
          onClick={handleStake}
          disabled={!stakeAmount || isStaking}
        >
          {isStaking ? 'Staking...' : 'Stake'}
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          type="number"
          placeholder="Amount to unstake"
          value={unstakeAmount}
          onChange={(e) => setUnstakeAmount(e.target.value)}
        />
        <Button
          className="w-full"
          onClick={handleUnstake}
          disabled={!unstakeAmount || isUnstaking}
        >
          {isUnstaking ? 'Unstaking...' : 'Unstake'}
        </Button>
      </div>

      <Button
        className="w-full"
        onClick={handleClaimRewards}
        disabled={!userStake?.rewardsEarned || isClaiming}
      >
        {isClaiming ? 'Claiming...' : 'Claim Rewards'}
      </Button>
    </Card>
  );
};

export const StakingPoolContainer: FC<{ onError: (error: unknown) => void }> = ({ onError }) => {
  const {
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
  } = useStaking();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StakingPool
        tokenSymbol="SOLX"
        apy={solxPool.apy}
        totalStaked={solxPool.totalStaked}
        userStake={userSolxStake}
        onStake={stakeSolx}
        onUnstake={unstakeSolx}
        onClaimRewards={claimSolxRewards}
        onError={onError}
      />
      <StakingPool
        tokenSymbol="MOCKX"
        apy={mockxPool.apy}
        totalStaked={mockxPool.totalStaked}
        userStake={userMockxStake}
        onStake={stakeMockx}
        onUnstake={unstakeMockx}
        onClaimRewards={claimMockxRewards}
        onError={onError}
      />
    </div>
  );
};

export default StakingPoolContainer;
