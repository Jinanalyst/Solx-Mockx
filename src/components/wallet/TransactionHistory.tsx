'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTransactionContext, TransactionRecord } from '@/contexts/TransactionContext';
import { cn } from '@/lib/utils';

interface TransactionFilters {
  type: 'all' | 'deposit' | 'withdrawal';
  status: 'all' | 'pending' | 'confirmed' | 'failed';
  token: string;
  dateRange: 'all' | '24h' | '7d' | '30d' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export function TransactionHistory() {
  const { transactions, pendingTransactions, isLoading } = useTransactionContext();
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    status: 'all',
    token: 'all',
    dateRange: 'all',
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return '';
    }
  };

  const filterTransactions = (tx: TransactionRecord) => {
    const now = Date.now();
    const txDate = new Date(tx.timestamp);

    // Type filter
    if (filters.type !== 'all' && tx.type !== filters.type) return false;

    // Status filter
    if (filters.status !== 'all' && tx.status !== filters.status) return false;

    // Token filter
    if (filters.token !== 'all' && tx.token !== filters.token) return false;

    // Date range filter
    if (filters.dateRange !== 'all') {
      switch (filters.dateRange) {
        case '24h':
          if (now - tx.timestamp > 24 * 60 * 60 * 1000) return false;
          break;
        case '7d':
          if (now - tx.timestamp > 7 * 24 * 60 * 60 * 1000) return false;
          break;
        case '30d':
          if (now - tx.timestamp > 30 * 24 * 60 * 60 * 1000) return false;
          break;
        case 'custom':
          if (filters.startDate && txDate < filters.startDate) return false;
          if (filters.endDate && txDate > filters.endDate) return false;
          break;
      }
    }

    return true;
  };

  const allTransactions = [...pendingTransactions, ...transactions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter(filterTransactions);

  const uniqueTokens = [...new Set(allTransactions.map(tx => tx.token))];

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <span className="text-muted-foreground">Loading transactions...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.token}
            onValueChange={(value) => setFilters(prev => ({ ...prev, token: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tokens</SelectItem>
              {uniqueTokens.map(token => (
                <SelectItem key={token} value={token}>{token}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value as any }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filters.dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={filters.startDate?.toISOString().split('T')[0]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  startDate: e.target.value ? new Date(e.target.value) : undefined
                }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={filters.endDate?.toISOString().split('T')[0]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  endDate: e.target.value ? new Date(e.target.value) : undefined
                }))}
              />
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Token</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transaction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{formatDate(tx.timestamp)}</TableCell>
                <TableCell className="capitalize">{tx.type}</TableCell>
                <TableCell>{tx.token}</TableCell>
                <TableCell className="text-right">{formatAmount(tx.amount)}</TableCell>
                <TableCell>
                  <span className={cn("capitalize", getStatusColor(tx.status))}>
                    {tx.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => window.open(
                      `https://explorer.solana.com/tx/${tx.signature}`,
                      '_blank'
                    )}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
