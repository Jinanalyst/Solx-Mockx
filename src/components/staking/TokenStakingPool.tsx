'use client';

import React, { useState } from 'react';
import { BigNumberish, parseUnits } from 'ethers';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils';

interface TokenStakingPoolProps {
  tokenName: string;
  rewardTokens: string[];
  apy: number;
  totalStaked: BigNumberish;
  userStake?: {
    stakedAmount: BigNumberish;
    rewardsEarned: BigNumberish;
    stakingDuration: number;
  };
  onStake: (amount: BigNumberish, duration: number, rewardToken: string) => Promise<void>;
  onUnstake: (amount: BigNumberish) => Promise<void>;
  onClaimRewards: () => Promise<void>;
  onError: (error: unknown) => void;
}

const STAKING_DURATIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '180 days' },
];

export function TokenStakingPool({
  tokenName,
  rewardTokens,
  apy,
  totalStaked,
  userStake,
  onStake,
  onUnstake,
  onClaimRewards,
  onError,
}: TokenStakingPoolProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakingDuration, setStakingDuration] = useState(STAKING_DURATIONS[0].value);
  const [selectedRewardToken, setSelectedRewardToken] = useState(rewardTokens[0]);
  const [loading, setLoading] = useState(false);

  const handleStake = async () => {
    try {
      setLoading(true);
      const amount = parseUnits(stakeAmount, 18);
      await onStake(amount, stakingDuration, selectedRewardToken);
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
      const amount = parseUnits(unstakeAmount, 18);
      await onUnstake(amount);
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
      await onClaimRewards();
    } catch (error) {
      onError(error);
      console.error('Claiming rewards failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = userStake
    ? (userStake.stakingDuration / (24 * 60 * 60)) / stakingDuration * 100
    : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{tokenName} Staking Pool</CardTitle>
        <CardDescription>
          Stake your {tokenName} tokens and earn up to {apy}% APY in rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Total Staked</h4>
              <p className="text-2xl font-bold">
                {formatNumber(Number(totalStaked))} {tokenName}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Your Stake</h4>
              <p className="text-2xl font-bold">
                {formatNumber(Number(userStake?.stakedAmount || 0))} {tokenName}
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
                  placeholder={`Enter ${tokenName} amount`}
                />
                <Select
                  value={stakingDuration.toString()}
                  onValueChange={(value) => setStakingDuration(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAKING_DURATIONS.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value.toString()}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedRewardToken}
                  onValueChange={setSelectedRewardToken}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Reward" />
                  </SelectTrigger>
                  <SelectContent>
                    {rewardTokens.map((token) => (
                      <SelectItem key={token} value={token}>
                        {token}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  placeholder={`Enter ${tokenName} amount`}
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

            {userStake && userStake.stakedAmount.gt(0) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Staking Progress</span>
                  <span>{Math.min(100, Math.round(progressPercentage))}%</span>
                </div>
                <Progress value={progressPercentage} className="w-full" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <h4 className="font-medium mb-1">Pending Rewards</h4>
          <p className="text-xl font-bold">
            {formatNumber(userStake?.rewardsEarned ? parseFloat(userStake.rewardsEarned.toString()) : 0)} {selectedRewardToken}
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
