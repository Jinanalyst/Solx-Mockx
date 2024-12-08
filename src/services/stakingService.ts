import { BigNumber } from '@ethersproject/bignumber';

export interface StakingPool {
  id: string;
  tokenPair: [string, string];
  apr: number;
  rewardToken: string;
  totalStaked: BigNumber;
  dailyRewards: BigNumber;
  stakingPeriod: 'unlimited' | number;
  rewardDistribution: 'daily' | 'weekly' | 'monthly';
}

export interface UserStake {
  userId: string;
  poolId: string;
  stakedAmount: BigNumber;
  rewardsEarned: BigNumber;
  lastClaimTimestamp: number;
  stakingStartTimestamp: number;
}

class StakingService {
  private pools: Map<string, StakingPool> = new Map();
  private userStakes: Map<string, UserStake[]> = new Map();

  createPool(params: Omit<StakingPool, 'id' | 'totalStaked' | 'dailyRewards'>): StakingPool {
    const poolId = `${params.tokenPair[0]}-${params.tokenPair[1]}`;
    const pool: StakingPool = {
      id: poolId,
      ...params,
      totalStaked: BigNumber.from(0),
      dailyRewards: BigNumber.from(0),
    };
    
    this.pools.set(poolId, pool);
    return pool;
  }

  stake(userId: string, poolId: string, amount: BigNumber): void {
    const pool = this.pools.get(poolId);
    if (!pool) throw new Error('Pool not found');

    const userStakes = this.userStakes.get(userId) || [];
    const existingStake = userStakes.find(stake => stake.poolId === poolId);

    if (existingStake) {
      existingStake.stakedAmount = existingStake.stakedAmount.add(amount);
    } else {
      userStakes.push({
        userId,
        poolId,
        stakedAmount: amount,
        rewardsEarned: BigNumber.from(0),
        lastClaimTimestamp: Date.now(),
        stakingStartTimestamp: Date.now(),
      });
    }

    pool.totalStaked = pool.totalStaked.add(amount);
    this.userStakes.set(userId, userStakes);
    this.pools.set(poolId, pool);
  }

  unstake(userId: string, poolId: string, amount: BigNumber): void {
    const pool = this.pools.get(poolId);
    if (!pool) throw new Error('Pool not found');

    const userStakes = this.userStakes.get(userId);
    if (!userStakes) throw new Error('No stakes found for user');

    const stake = userStakes.find(s => s.poolId === poolId);
    if (!stake) throw new Error('No stake found for this pool');

    if (stake.stakedAmount.lt(amount)) {
      throw new Error('Insufficient staked amount');
    }

    // Calculate and claim pending rewards before unstaking
    this.claimRewards(userId, poolId);

    stake.stakedAmount = stake.stakedAmount.sub(amount);
    pool.totalStaked = pool.totalStaked.sub(amount);

    if (stake.stakedAmount.isZero()) {
      this.userStakes.set(
        userId,
        userStakes.filter(s => s.poolId !== poolId)
      );
    }

    this.pools.set(poolId, pool);
  }

  calculateRewards(userId: string, poolId: string): BigNumber {
    const pool = this.pools.get(poolId);
    if (!pool) throw new Error('Pool not found');

    const userStakes = this.userStakes.get(userId);
    if (!userStakes) return BigNumber.from(0);

    const stake = userStakes.find(s => s.poolId === poolId);
    if (!stake) return BigNumber.from(0);

    const timeElapsed = Date.now() - stake.lastClaimTimestamp;
    const daysElapsed = timeElapsed / (24 * 60 * 60 * 1000);
    
    // Calculate daily reward rate based on APR
    const dailyRate = pool.apr / 365;
    const rewards = stake.stakedAmount
      .mul(BigNumber.from(Math.floor(dailyRate * daysElapsed)))
      .div(10000); // Adjust for percentage calculation

    return rewards;
  }

  claimRewards(userId: string, poolId: string): BigNumber {
    const rewards = this.calculateRewards(userId, poolId);
    const userStakes = this.userStakes.get(userId);
    if (!userStakes) throw new Error('No stakes found for user');

    const stake = userStakes.find(s => s.poolId === poolId);
    if (!stake) throw new Error('No stake found for this pool');

    stake.rewardsEarned = stake.rewardsEarned.add(rewards);
    stake.lastClaimTimestamp = Date.now();

    this.userStakes.set(userId, userStakes);
    return rewards;
  }

  getPool(poolId: string): StakingPool | undefined {
    return this.pools.get(poolId);
  }

  getUserStakes(userId: string): UserStake[] {
    return this.userStakes.get(userId) || [];
  }
}

export const stakingService = new StakingService();
