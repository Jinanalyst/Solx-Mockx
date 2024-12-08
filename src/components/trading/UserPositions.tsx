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
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function UserPositions() {
  const { positions, closePosition } = useMockTrading();

  if (!positions || positions.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Your Positions</h3>
        <div className="text-center text-muted-foreground">No open positions</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Your Positions</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pair</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>PnL</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => {
            const currentPrice = position.entryPrice; // We'll use entryPrice as fallback until we implement real-time price updates
            const pnl = position.side === 'buy'
              ? (currentPrice - position.entryPrice) * position.amount
              : (position.entryPrice - currentPrice) * position.amount;
            const pnlPercentage = (pnl / (position.entryPrice * position.amount)) * 100;

            return (
              <TableRow key={position.id}>
                <TableCell>{position.pair}</TableCell>
                <TableCell>
                  <span className={position.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    {position.side.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>{formatNumber(position.entryPrice)}</TableCell>
                <TableCell>{formatNumber(position.amount)}</TableCell>
                <TableCell>{formatNumber(currentPrice)}</TableCell>
                <TableCell>
                  <span className={pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatNumber(pnl)} ({formatNumber(pnlPercentage)}%)
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => closePosition(position.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
