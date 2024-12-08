'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUserTradingData } from '@/hooks/useUserTradingData';
import { cn } from '@/lib/utils';

export function UserDashboard() {
  const {
    balances,
    positions,
    openOrders,
    orderHistory,
    tradeHistory,
    isLoading,
    error,
  } = useUserTradingData();

  const [selectedBalances, setSelectedBalances] = useState<'all' | 'non-zero'>('non-zero');

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <span className="text-muted-foreground">Loading user data...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <span className="text-red-500">Error loading user data: {error.message}</span>
        </div>
      </Card>
    );
  }

  const filteredBalances = balances.filter(b => 
    selectedBalances === 'all' || b.total > 0
  );

  return (
    <Card className="p-6">
      <Tabs defaultValue="balances" className="w-full">
        <TabsList>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="balances">
          <div className="flex justify-end mb-4">
            <select
              className="px-2 py-1 text-sm border rounded"
              value={selectedBalances}
              onChange={(e) => setSelectedBalances(e.target.value as 'all' | 'non-zero')}
            >
              <option value="all">All Balances</option>
              <option value="non-zero">Non-zero Balances</option>
            </select>
          </div>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">In Orders</TableHead>
                  <TableHead className="text-right">USD Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBalances.map((balance) => (
                  <TableRow key={balance.coin}>
                    <TableCell className="font-medium">{balance.coin}</TableCell>
                    <TableCell className="text-right">{formatNumber(balance.total)}</TableCell>
                    <TableCell className="text-right">{formatNumber(balance.free)}</TableCell>
                    <TableCell className="text-right">{formatNumber(balance.total - balance.free)}</TableCell>
                    <TableCell className="text-right">${formatNumber(balance.usdValue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="positions">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Entry Price</TableHead>
                  <TableHead className="text-right">Mark Price</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position.future}>
                    <TableCell className="font-medium">{position.future}</TableCell>
                    <TableCell className={cn(
                      "text-right",
                      position.side === 'buy' ? 'text-green-500' : 'text-red-500'
                    )}>
                      {position.side === 'buy' ? '+' : '-'}{formatNumber(position.size)}
                    </TableCell>
                    <TableCell className="text-right">${formatNumber(position.entryPrice)}</TableCell>
                    <TableCell className="text-right">${formatNumber(position.entryPrice + (position.unrealizedPnl / position.size))}</TableCell>
                    <TableCell className={cn(
                      "text-right",
                      position.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      ${formatNumber(position.unrealizedPnl)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="orders">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Side</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Filled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.market}</TableCell>
                    <TableCell>{order.type.toUpperCase()}</TableCell>
                    <TableCell className={cn(
                      "text-right",
                      order.side === 'buy' ? 'text-green-500' : 'text-red-500'
                    )}>
                      {order.side.toUpperCase()}
                    </TableCell>
                    <TableCell className="text-right">${formatNumber(order.price)}</TableCell>
                    <TableCell className="text-right">{formatNumber(order.size)}</TableCell>
                    <TableCell className="text-right">{formatNumber(order.filledSize)}</TableCell>
                    <TableCell>{order.status.toUpperCase()}</TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trades">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Side</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradeHistory.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.market}</TableCell>
                    <TableCell>{trade.type.toUpperCase()}</TableCell>
                    <TableCell className={cn(
                      "text-right",
                      trade.side === 'buy' ? 'text-green-500' : 'text-red-500'
                    )}>
                      {trade.side.toUpperCase()}
                    </TableCell>
                    <TableCell className="text-right">${formatNumber(trade.price)}</TableCell>
                    <TableCell className="text-right">{formatNumber(trade.size)}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(trade.fee)} {trade.feeCurrency}
                    </TableCell>
                    <TableCell>{formatDateTime(trade.time)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
