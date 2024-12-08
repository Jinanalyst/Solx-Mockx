'use client';

import React from 'react';
import { useMockTrading } from '@/contexts/MockTradingContext';
import { formatNumber } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function RecentTrades() {
  const { trades } = useMockTrading();

  if (!trades || trades.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
        <div className="text-center text-muted-foreground">No trades yet</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.slice(0, 10).map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>
                {new Date(trade.timestamp).toLocaleTimeString()}
              </TableCell>
              <TableCell>
                <span className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                  {trade.side.toUpperCase()}
                </span>
              </TableCell>
              <TableCell>{formatNumber(trade.price)}</TableCell>
              <TableCell>{formatNumber(trade.amount)}</TableCell>
              <TableCell>{formatNumber(trade.price * trade.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
