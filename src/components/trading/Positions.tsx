'use client';

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Position {
  pair: string;
  type: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
}

const mockPositions: Position[] = [
  {
    pair: 'BTC/USDT',
    type: 'long',
    size: 0.5,
    entryPrice: 42000,
    markPrice: 43500,
    pnl: 750,
    pnlPercent: 3.57,
    liquidationPrice: 38000,
  },
  {
    pair: 'ETH/USDT',
    type: 'short',
    size: 5,
    entryPrice: 2300,
    markPrice: 2250,
    pnl: 250,
    pnlPercent: 2.17,
    liquidationPrice: 2600,
  },
];

export function Positions() {
  return (
    <Card className="w-full h-full bg-card">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Positions</h3>
      </div>
      <div className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Entry Price</TableHead>
              <TableHead>Mark Price</TableHead>
              <TableHead>PnL</TableHead>
              <TableHead>Liq. Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPositions.map((position) => (
              <TableRow key={`${position.pair}-${position.type}`}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {position.pair}
                    <Badge variant={position.type === 'long' ? 'default' : 'destructive'} className={position.type === 'long' ? 'bg-green-500 hover:bg-green-600' : ''}>
                      {position.type.toUpperCase()}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{position.size}</TableCell>
                <TableCell>${position.entryPrice.toLocaleString()}</TableCell>
                <TableCell>${position.markPrice.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                    ${position.pnl.toLocaleString()} ({position.pnlPercent}%)
                  </span>
                </TableCell>
                <TableCell>${position.liquidationPrice.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
