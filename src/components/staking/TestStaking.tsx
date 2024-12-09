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
import BN from 'bn.js';
import { parseStakeAmount } from '@/utils/staking';

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

  const [selectedToken, setSelectedToken] = useState('SOLX');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');

  const handleStake = async () => {
    if (!amount) return;

    const parsedAmount = parseStakeAmount(amount);
    try {
      if (selectedToken === 'SOLX') {
        await stakeSolx(parsedAmount);
      } else {
        await stakeMockx(parsedAmount);
      }
      setAmount('');
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  const handleUnstake = async () => {
    try {
      if (selectedToken === 'SOLX') {
        await unstakeSolx(userSolxStake?.stakedAmount || new BN(0));
      } else {
        await unstakeMockx(userMockxStake?.stakedAmount || new BN(0));
      }
    } catch (error) {
      console.error('Unstaking failed:', error);
    }
  };

  const handleClaimRewards = async () => {
    try {
      if (selectedToken === 'SOLX') {
        await claimSolxRewards();
      } else {
        await claimMockxRewards();
      }
    } catch (error) {
      console.error('Claiming rewards failed:', error);
    }
  };

  const currentStake = selectedToken === 'SOLX' ? userSolxStake : userMockxStake;
  const pool = selectedToken === 'SOLX' ? solxPool : mockxPool;

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg shadow-lg">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Test Staking</h2>
        <p className="text-muted-foreground">
          Test staking functionality with {selectedToken}
        </p>
      </div>

      <div className="space-y-4">
        <Select
          value={selectedToken}
          onValueChange={setSelectedToken}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SOLX">SOLX</SelectItem>
            <SelectItem value="MOCKX">MOCKX</SelectItem>
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to stake"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (days)</label>
          <Select
            value={duration}
            onValueChange={setDuration}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={handleStake}
            disabled={!amount || !wallet.publicKey}
          >
            Stake {selectedToken}
          </Button>

          <Button
            className="w-full"
            onClick={handleUnstake}
            disabled={!currentStake?.stakedAmount || !wallet.publicKey}
          >
            Unstake {selectedToken}
          </Button>

          <Button
            className="w-full"
            onClick={handleClaimRewards}
            disabled={!currentStake?.rewardsEarned || !wallet.publicKey}
          >
            Claim Rewards
          </Button>
        </div>

        {currentStake && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <h3 className="font-medium">Your Stake</h3>
            <p>Staked: {currentStake.stakedAmount.toString()} {selectedToken}</p>
            <p>Rewards: {currentStake.rewardsEarned.toString()} {selectedToken}</p>
            <p>Duration: {currentStake.stakingDuration} days</p>
          </div>
        )}

        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <h3 className="font-medium">Pool Info</h3>
          <p>APY: {pool.apy}%</p>
          <p>Total Staked: {pool.totalStaked.toString()} {selectedToken}</p>
        </div>
      </div>
    </div>
  );
}
