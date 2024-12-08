'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatAmount, formatDate, shortenAddress } from '../../utils/format';
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  hash: string;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  timestamp: Date;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead className="text-right">Transaction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.hash}>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
              </TableCell>
              <TableCell>
                {formatAmount(tx.fromAmount)} {tx.fromToken}
              </TableCell>
              <TableCell>
                {formatAmount(tx.toAmount)} {tx.toToken}
              </TableCell>
              <TableCell className="text-right">
                <a
                  href={`https://solscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {shortenAddress(tx.hash)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
