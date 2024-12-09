import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useMockTrading } from '@/contexts/MockTradingContext';
import { formatNumber } from '@/utils/format';
import dynamic from 'next/dynamic';
import { PositionManager } from './PositionManager';

const TradingTabsContent = dynamic(() => Promise.resolve(({ 
  positions, 
  trades, 
  balances,
  selectedMarket
}: any) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {/* Positions */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Positions</h3>
          <Card className="p-4 overflow-auto max-h-[300px]">
            <PositionManager />
          </Card>
        </div>

        {/* Trade History & Balance */}
        <div>
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="history">Trade History</TabsTrigger>
              <TabsTrigger value="balance">Balance</TabsTrigger>
            </TabsList>

            {/* Trade History Tab */}
            <TabsContent value="history" className="mt-0">
              <Card className="p-4 overflow-auto max-h-[200px]">
                <div className="space-y-2">
                  {trades.length === 0 ? (
                    <p className="text-center text-muted-foreground">No trade history</p>
                  ) : (
                    trades.map((trade: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <span className={`font-medium ${trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.side.toUpperCase()}
                          </span>
                          <span className="ml-2">{trade.symbol}</span>
                        </div>
                        <div className="text-right">
                          <div>{formatNumber(trade.price)} USDT</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(trade.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Balance Tab */}
            <TabsContent value="balance">
              <Card className="p-4">
                <div className="space-y-4">
                  {balances.map((balance: any) => (
                    <div key={balance.symbol} className="flex justify-between items-center">
                      <span className="font-medium">{balance.symbol}</span>
                      <div className="text-right">
                        <div>Available: {formatNumber(balance.free)} {balance.symbol}</div>
                        <div>In Use: {formatNumber(balance.locked)} {balance.symbol}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}), { ssr: false });

export function TradingTabs() {
  const {
    positions,
    trades,
    balances,
    selectedMarket,
  } = useMockTrading();

  return (
    <div className="w-full h-full">
      <TradingTabsContent
        positions={positions}
        trades={trades}
        balances={balances}
        selectedMarket={selectedMarket}
      />
    </div>
  );
}
