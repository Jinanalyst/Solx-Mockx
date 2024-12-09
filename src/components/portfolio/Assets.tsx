'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart } from '@/components/ui/line-chart';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { formatNumber } from '@/services/tokenService';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@/contexts/WalletContext';

export function Assets() {
  const { currentPortfolio, isLoading, error, fetchPortfolioSummary, initializePortfolio } = usePortfolioStore();
  const { address } = useWallet();

  useEffect(() => {
    if (address && !currentPortfolio) {
      // Initialize portfolio if it doesn't exist
      initializePortfolio(address, 'REAL');
    }
  }, [address, currentPortfolio, initializePortfolio]);

  useEffect(() => {
    if (currentPortfolio?.id) {
      // Fetch portfolio data every 30 seconds
      const fetchData = () => fetchPortfolioSummary(currentPortfolio.id);
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [currentPortfolio?.id, fetchPortfolioSummary]);

  if (!address) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Please connect your wallet to view your portfolio
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">{error}</div>
      </Card>
    );
  }

  if (isLoading || !currentPortfolio) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </Card>
    );
  }

  const chartData = currentPortfolio.transactions.map((tx: any) => ({
    date: new Date(tx.createdAt),
    value: tx.total,
  }));

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Portfolio Overview</h2>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">${formatNumber(currentPortfolio.totalValue)}</p>
          </div>
        </div>

        <div className="h-[300px]">
          <LineChart
            data={chartData}
            xField="date"
            yField="value"
            title="Portfolio Value Over Time"
          />
        </div>

        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-4">
            {currentPortfolio.assets.length > 0 ? (
              currentPortfolio.assets.map((asset: any) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{asset.symbol}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(asset.quantity)} tokens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${formatNumber(asset.quantity * asset.currentPrice)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg. ${formatNumber(asset.avgPrice)} | Current ${formatNumber(asset.currentPrice)}
                    </p>
                    <p className={`text-sm ${
                      asset.currentPrice >= asset.avgPrice ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {((asset.currentPrice - asset.avgPrice) / asset.avgPrice * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No assets in your portfolio yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="staking" className="space-y-4">
            {currentPortfolio.assets
              .filter((asset: any) => 
                currentPortfolio.transactions.some((tx: any) => 
                  tx.type === 'STAKE' && tx.symbol === asset.symbol
                )
              )
              .map((asset: any) => {
                const stakedAmount = currentPortfolio.transactions
                  .filter((tx: any) => 
                    tx.type === 'STAKE' && tx.symbol === asset.symbol
                  )
                  .reduce((sum: number, tx: any) => sum + tx.quantity, 0);
                
                return (
                  <div
                    key={`staking-${asset.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{asset.symbol} Staking</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(stakedAmount)} tokens staked
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${formatNumber(stakedAmount * asset.currentPrice)}
                      </p>
                      <p className="text-sm text-green-500">
                        Est. APY: 5.2%
                      </p>
                    </div>
                  </div>
                );
              })}
            {!currentPortfolio.assets.some((asset: any) => 
              currentPortfolio.transactions.some((tx: any) => 
                tx.type === 'STAKE' && tx.symbol === asset.symbol
              )
            ) && (
              <div className="text-center text-muted-foreground py-8">
                No staking positions yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
