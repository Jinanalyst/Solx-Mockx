'use client';

import React from 'react';
import { useStaking } from '@/contexts/StakingContext';
import { TokenStakingPool } from './TokenStakingPool';

interface StakingPoolProps {
  onError: (error: unknown) => void;
}

export function StakingPool({ onError }: StakingPoolProps) {
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
      <TokenStakingPool
        tokenName="SOLX"
        rewardTokens={['SOLX', 'MOCKX']}
        apy={solxPool.apy}
        totalStaked={solxPool.totalStaked}
        userStake={userSolxStake}
        onStake={stakeSolx}
        onUnstake={unstakeSolx}
        onClaimRewards={claimSolxRewards}
        onError={onError}
      />

      {/* Mockx Staking Pool */}
      <TokenStakingPool
        tokenName="MOCKX"
        rewardTokens={['MOCKX', 'SOLX']}
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
