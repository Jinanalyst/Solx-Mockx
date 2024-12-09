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

  const totalBalance = balances.reduce((sum: number, balance: MockBalance) => {
    // Use type assertion to handle BN type
    const free = typeof balance.free === 'object' && balance.free?.toString ? 
      Number(balance.free.toString()) / 1e6 : 
      Number(balance.free);
    
    const locked = typeof balance.locked === 'object' && balance.locked?.toString ? 
      Number(balance.locked.toString()) / 1e6 : 
      Number(balance.locked);
      
    return sum + free + locked;
  }, 0);
  
  // Convert BN to number for display
  const solxStaked = userSolxStake?.stakedAmount ? Number(userSolxStake.stakedAmount.toString()) / 1e6 : 0;
  const mockxStaked = userMockxStake?.stakedAmount ? Number(userMockxStake.stakedAmount.toString()) / 1e6 : 0;
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
      title: 'Total PnL',
      value: '+$1,234.56',
      icon: <MdTrendingUp className="w-6 h-6" />,
      percentChange: 8.3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {portfolioCards.map((card, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{card.title}</span>
            {card.icon}
          </div>
          <div className="text-2xl font-semibold mb-2">{card.value}</div>
          {card.percentChange && (
            <div className={`text-sm ${card.percentChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {card.percentChange > 0 ? '+' : ''}{card.percentChange}%
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function PortfolioDistribution() {
  const assets = [
    { name: 'SOLX', value: 45, color: 'bg-blue-500' },
    { name: 'MOCKX', value: 30, color: 'bg-purple-500' },
    { name: 'USDT', value: 25, color: 'bg-green-500' },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Portfolio Distribution</h3>
      <div className="space-y-4">
        {assets.map((asset) => (
          <div key={asset.name}>
            <div className="flex justify-between mb-1">
              <span>{asset.name}</span>
              <span>{asset.value}%</span>
            </div>
            <Progress value={asset.value} className={asset.color} />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="space-y-8">
        <PortfolioOverview />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PortfolioDistribution />
          {/* Add more dashboard components here */}
        </div>
      </div>
    </div>
  );
}
