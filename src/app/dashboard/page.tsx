'use client';

import { useState } from 'react';
import { useStaking } from '@/contexts/StakingContext';
import { useMockTrading } from '@/contexts/MockTradingContext';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MdAccountBalance, MdTrendingUp } from 'react-icons/md';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { FaCoins } from 'react-icons/fa';
import { formatNumber } from '@/utils/format';
import type { MockBalance } from '@/types/mockTrading';
import BN from 'bn.js';

interface PortfolioCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  percentChange?: number;
}

function PortfolioOverview() {
  const { balances } = useMockTrading();
  const { userSolxStake, userMockxStake } = useStaking();

  const totalBalance = balances.reduce((sum: number, balance: MockBalance) => sum + balance.free + balance.locked, 0);
  
  // Convert BN to number for display
  const solxStaked = userSolxStake?.stakedAmount ? Number(userSolxStake.stakedAmount.toString()) / 1e9 : 0;
  const mockxStaked = userMockxStake?.stakedAmount ? Number(userMockxStake.stakedAmount.toString()) / 1e9 : 0;
  const totalStaked = solxStaked + mockxStaked;

  const portfolioCards: PortfolioCardProps[] = [
    {
      title: 'Total Balance',
      value: `$${formatNumber(totalBalance)}`,
      icon: <MdAccountBalance className="w-6 h-6" />,
      percentChange: 5.2,
    },
    {
      title: 'Total Staked',
      value: `$${formatNumber(totalStaked)}`,
      icon: <FaCoins className="w-6 h-6" />,
      percentChange: 2.8,
    },
    {
      title: '24h Trading Volume',
      value: '$12,345.67',
      icon: <RiExchangeDollarLine className="w-6 h-6" />,
      percentChange: -1.5,
    },
    {
      title: 'Total Earnings',
      value: '$987.65',
      icon: <MdTrendingUp className="w-6 h-6" />,
      percentChange: 8.4,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {portfolioCards.map((card, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              {card.icon}
            </div>
            {card.percentChange && (
              <span className={`text-sm ${card.percentChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {card.percentChange > 0 ? '+' : ''}{card.percentChange}%
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
          <p className="text-2xl font-bold">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}

function PortfolioDistribution() {
  const { balances } = useMockTrading();
  const totalValue = balances.reduce((sum, balance) => sum + balance.free + balance.locked, 0);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Portfolio Distribution</h3>
      <div className="space-y-4">
        {balances.map((balance, index) => {
          const percentage = ((balance.free + balance.locked) / totalValue) * 100;
          return (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{balance.asset}</span>
                <span className="text-sm text-muted-foreground">
                  ${formatNumber(balance.free + balance.locked)} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your portfolio, trading activity, and staking rewards.
        </p>
      </div>
      
      <PortfolioOverview />
      
      <div className="grid gap-4 md:grid-cols-2">
        <PortfolioDistribution />
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="text-muted-foreground text-center py-8">
            No recent activity to display
          </div>
        </Card>
      </div>
    </div>
  );
}
