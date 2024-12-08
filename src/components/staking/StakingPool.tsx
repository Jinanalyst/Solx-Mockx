'use client';

import React, { useState } from 'react';
import { BigNumber } from '@ethersproject/bignumber';
import { useStaking } from '@/contexts/StakingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface StakingPoolProps {
  onError: (error: unknown) => void;
}

export function StakingPool({ onError }: StakingPoolProps) {
  const { pools, userStakes, stake, unstake, claimRewards, calculateRewards } = useStaking();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const pool = pools[0]; // Solx/MockX pool
  const userStake = userStakes.find(stake => stake.poolId === pool?.id);

  const handleStake = async () => {
    try {
      setLoading(true);
      const amount = BigNumber.from(stakeAmount);
      await stake(pool.id, amount);
      setStakeAmount('');
    } catch (error) {
      onError(error);
      console.error('Staking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    try {
      setLoading(true);
      const amount = BigNumber.from(unstakeAmount);
      await unstake(pool.id, amount);
      setUnstakeAmount('');
    } catch (error) {
      onError(error);
      console.error('Unstaking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    try {
      setLoading(true);
      await claimRewards(pool.id);
    } catch (error) {
      onError(error);
      console.error('Claiming rewards failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!pool) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Solx/MockX Staking Pool</CardTitle>
        <CardDescription>
          Stake your Solx/MockX LP tokens and earn {pool.apr}% APR in rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Total Staked</h4>
              <p className="text-2xl font-bold">
                {formatNumber(Number(pool.totalStaked))} LP
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Your Stake</h4>
              <p className="text-2xl font-bold">
                {formatNumber(Number(userStake?.stakedAmount || 0))} LP
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stake Amount</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Enter amount to stake"
                />
                <Button
                  onClick={handleStake}
                  disabled={!stakeAmount || loading}
                >
                  Stake
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Unstake Amount</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="Enter amount to unstake"
                />
                <Button
                  onClick={handleUnstake}
                  disabled={!unstakeAmount || loading}
                  variant="outline"
                >
                  Unstake
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <h4 className="font-medium mb-1">Pending Rewards</h4>
          <p className="text-xl font-bold">
            {formatNumber(userStake?.rewardsEarned ? parseFloat(userStake.rewardsEarned.toString()) : 0)} {pool.rewardToken}
          </p>
        </div>
        <Button
          onClick={handleClaimRewards}
          disabled={loading || !userStake?.rewardsEarned.gt(0)}
          variant="default"
        >
          Claim Rewards
        </Button>
      </CardFooter>
    </Card>
  );
}
