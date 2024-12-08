'use client';

import { Suspense } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/utils/errorHandling';
import { useWallet } from '@/contexts/WalletContext';
import { useStaking } from '@/contexts/StakingContext';
import { useMockTrading, MockBalance } from '@/contexts/MockTradingContext';
import { formatNumber } from '@/lib/utils';

interface Balance {
  amount: string;
  symbol: string;
}

function PortfolioOverview() {
  const { balances } = useMockTrading();
  const { userStakes } = useStaking();
  
  const totalBalance = balances.reduce((sum: number, balance: MockBalance) => sum + balance.balance, 0);
  const totalStaked = userStakes.reduce((sum, stake) => sum + parseFloat(stake.stakedAmount.toString()), 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${formatNumber(totalBalance)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${formatNumber(totalStaked)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userStakes.length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(userStakes.reduce((sum, stake) => sum + parseFloat(stake.rewardsEarned.toString()), 0))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardContent() {
  const { toast } = useToast();
  const { publicKey } = useWallet();

  const onError = (error: unknown) => {
    const handledError = handleError(error);
    toast({
      title: 'Error',
      description: handledError.message,
      variant: 'destructive',
    });
  };

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Please connect your wallet to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
          </div>
        }
      >
        <PortfolioOverview />
      </Suspense>

      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-4">
          <Suspense fallback={<div>Loading positions...</div>}>
            <Card>
              <CardContent className="p-6">
                {/* Add positions table component here */}
                <p className="text-muted-foreground">Your active positions will appear here</p>
              </CardContent>
            </Card>
          </Suspense>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Suspense fallback={<div>Loading history...</div>}>
            <Card>
              <CardContent className="p-6">
                {/* Add transaction history component here */}
                <p className="text-muted-foreground">Your transaction history will appear here</p>
              </CardContent>
            </Card>
          </Suspense>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Suspense fallback={<div>Loading rewards...</div>}>
            <Card>
              <CardContent className="p-6">
                {/* Add rewards component here */}
                <p className="text-muted-foreground">Your staking rewards will appear here</p>
              </CardContent>
            </Card>
          </Suspense>
        </TabsContent>
      </Tabs>
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
