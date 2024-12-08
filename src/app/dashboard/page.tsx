'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMockTrading } from '@/contexts/MockTradingContext';
import { useStaking } from '@/contexts/StakingContext';
import { formatNumber } from '@/lib/utils';
import { MdAccountBalance, MdTrendingUp } from 'react-icons/md';
import { RiStockFill } from 'react-icons/ri';
import { FaCoins } from 'react-icons/fa';

interface MockBalance {
  token: string;
  free: number;
  locked: number;
}

function PortfolioOverview() {
  const { balances } = useMockTrading();
  const { userStakes } = useStaking();
  
  const totalBalance = balances.reduce((sum: number, balance: MockBalance) => sum + balance.free + balance.locked, 0);
  const totalStaked = userStakes.reduce((sum, stake) => sum + stake.stakedAmount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          <MdAccountBalance className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$ {formatNumber(totalBalance + totalStaked)}</div>
          <p className="text-xs text-muted-foreground">
            Including staked assets
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          <FaCoins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$ {formatNumber(totalBalance)}</div>
          <p className="text-xs text-muted-foreground">
            Ready to trade or stake
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
          <RiStockFill className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$ {formatNumber(totalStaked)}</div>
          <p className="text-xs text-muted-foreground">
            Earning rewards
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">24h Change</CardTitle>
          <MdTrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">+2.5%</div>
          <p className="text-xs text-muted-foreground">
            +$ {formatNumber((totalBalance + totalStaked) * 0.025)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardContent() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <PortfolioOverview />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PageLayout>
      <DashboardContent />
    </PageLayout>
  );
}
