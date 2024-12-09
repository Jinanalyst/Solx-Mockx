'use client';

import React, { FC, useState } from 'react';
import { useStaking } from '@/contexts/StakingContext';
import { BigNumberish } from '@ethersproject/bignumber';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatUnits, parseUnits } from '@ethersproject/units';

interface UserStake {
  stakedAmount: BigNumberish;
  rewardsEarned: BigNumberish;
  stakingDuration: number;
}

interface StakingPoolProps {
  tokenSymbol: string;
  apy: number;
  totalStaked: BigNumberish;
  userStake?: UserStake;
  onStake: (amount: BigNumberish) => Promise<void>;
  onUnstake: (amount: BigNumberish) => Promise<void>;
  onClaimRewards: () => Promise<void>;
  onError: (error: unknown) => void;
}

interface StakingContext {
  solxPool: {
    apy: number;
    totalStaked: BigNumberish;
  };
  mockxPool: {
    apy: number;
    totalStaked: BigNumberish;
  };
  userSolxStake?: UserStake;
  userMockxStake?: UserStake;
  stakeSolx: (amount: BigNumberish) => Promise<void>;
  stakeMockx: (amount: BigNumberish) => Promise<void>;
  unstakeSolx: (amount: BigNumberish) => Promise<void>;
  unstakeMockx: (amount: BigNumberish) => Promise<void>;
  claimSolxRewards: () => Promise<void>;
  claimMockxRewards: () => Promise<void>;
}

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
      await onStake(parseUnits(stakeAmount, 18));
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
      await onUnstake(parseUnits(unstakeAmount, 18));
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
    <Card className="p-6 bg-card">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">{tokenSymbol} Staking</h3>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">APY</p>
            <p className="text-xl font-bold text-primary">{apy}%</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Total Staked</p>
          <p className="text-lg">{formatUnits(totalStaked, 18)} {tokenSymbol}</p>
        </div>

        {userStake && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Your Stake</p>
              <p className="text-lg">{formatUnits(userStake.stakedAmount, 18)} {tokenSymbol}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Rewards Earned</p>
              <p className="text-lg">{formatUnits(userStake.rewardsEarned, 18)} {tokenSymbol}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Staking Duration</p>
              <p className="text-lg">{userStake.stakingDuration} days</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Stake Amount</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.0"
                min="0"
              />
              <Button 
                onClick={handleStake} 
                disabled={!stakeAmount || isStaking}
              >
                {isStaking ? 'Staking...' : 'Stake'}
              </Button>
            </div>
          </div>

          {userStake && userStake.stakedAmount.gt(0) && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unstake Amount</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    placeholder="0.0"
                    min="0"
                  />
                  <Button 
                    onClick={handleUnstake}
                    disabled={!unstakeAmount || isUnstaking}
                  >
                    {isUnstaking ? 'Unstaking...' : 'Unstake'}
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleClaimRewards}
                disabled={!userStake.rewardsEarned || isClaiming}
              >
                {isClaiming ? 'Claiming...' : 'Claim Rewards'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export function StakingPoolContainer({ onError }: { onError: (error: unknown) => void }) {
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

  if (!solxPool || !mockxPool) {
    return <div>Loading staking pools...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Solx Staking Pool */}
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

      {/* Mockx Staking Pool */}
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
}
