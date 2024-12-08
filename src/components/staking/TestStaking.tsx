'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useStaking } from '@/contexts/StakingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { parseUnits } from 'ethers';

export function TestStaking() {
  const { connection } = useConnection();
  const wallet = useWallet();
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

  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('7');
  const [rewardToken, setRewardToken] = useState('SOLX');
  const [isStaking, setIsStaking] = useState(false);

  const handleStakeSolx = async () => {
    try {
      setIsStaking(true);
      await stakeSolx(parseUnits(amount), parseInt(duration), rewardToken);
    } finally {
      setIsStaking(false);
      setAmount('');
    }
  };

  const handleStakeMockx = async () => {
    try {
      setIsStaking(true);
      await stakeMockx(parseUnits(amount), parseInt(duration), rewardToken);
    } finally {
      setIsStaking(false);
      setAmount('');
    }
  };

  return (
    <div className="p-4 space-y-8">
      <div className="grid grid-cols-2 gap-8">
        {/* SOLX Staking Test Panel */}
        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-2xl font-bold mb-4">Test SOLX Staking</h2>
          
          <div>
            <p>Pool Total Staked: {solxPool.totalStaked.toString()}</p>
            <p>Your Stake: {userSolxStake?.stakedAmount.toString() || '0'}</p>
            <p>Your Rewards: {userSolxStake?.rewardsEarned.toString() || '0'}</p>
          </div>

          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Amount to stake"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rewardToken} onValueChange={setRewardToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select reward token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOLX">SOLX</SelectItem>
                <SelectItem value="MOCKX">MOCKX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-x-2">
            <Button 
              onClick={handleStakeSolx}
              disabled={!amount || isStaking || !wallet.connected}
            >
              Stake SOLX
            </Button>
            <Button
              onClick={() => unstakeSolx(userSolxStake?.stakedAmount || 0n)}
              disabled={!userSolxStake?.stakedAmount || isStaking || !wallet.connected}
              variant="outline"
            >
              Unstake All
            </Button>
            <Button
              onClick={claimSolxRewards}
              disabled={!userSolxStake?.rewardsEarned || isStaking || !wallet.connected}
              variant="secondary"
            >
              Claim Rewards
            </Button>
          </div>
        </div>

        {/* MOCKX Staking Test Panel */}
        <div className="p-6 border rounded-lg space-y-4">
          <h2 className="text-2xl font-bold mb-4">Test MOCKX Staking</h2>
          
          <div>
            <p>Pool Total Staked: {mockxPool.totalStaked.toString()}</p>
            <p>Your Stake: {userMockxStake?.stakedAmount.toString() || '0'}</p>
            <p>Your Rewards: {userMockxStake?.rewardsEarned.toString() || '0'}</p>
          </div>

          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Amount to stake"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rewardToken} onValueChange={setRewardToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select reward token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOLX">SOLX</SelectItem>
                <SelectItem value="MOCKX">MOCKX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-x-2">
            <Button 
              onClick={handleStakeMockx}
              disabled={!amount || isStaking || !wallet.connected}
            >
              Stake MOCKX
            </Button>
            <Button
              onClick={() => unstakeMockx(userMockxStake?.stakedAmount || 0n)}
              disabled={!userMockxStake?.stakedAmount || isStaking || !wallet.connected}
              variant="outline"
            >
              Unstake All
            </Button>
            <Button
              onClick={claimMockxRewards}
              disabled={!userMockxStake?.rewardsEarned || isStaking || !wallet.connected}
              variant="secondary"
            >
              Claim Rewards
            </Button>
          </div>
        </div>
      </div>

      {!wallet.connected && (
        <div className="text-center text-red-500">
          Please connect your wallet to test staking functionality
        </div>
      )}
    </div>
  );
}
