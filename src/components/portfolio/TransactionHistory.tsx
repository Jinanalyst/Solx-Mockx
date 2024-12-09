'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { usePrice } from '@/contexts/PriceContext';
import { useTransactionStore } from '@/stores/transactionStore';
import { formatNumber } from '@/services/tokenService';

export function TransactionHistory() {
  const { getPrice } = usePrice();
  const { transactions, getPositionPnL } = useTransactionStore();
  const [activeTab, setActiveTab] = useState('trading');

  const calculateTransactionPnL = (tx: any) => {
    const currentPrice = getPrice(tx.asset);
    if (tx.type === 'buy' || tx.type === 'mock_buy') {
      return (currentPrice - tx.price) * tx.amount;
    } else if (tx.type === 'sell' || tx.type === 'mock_sell') {
      return (tx.price - currentPrice) * tx.amount;
    }
    return 0;
  };

  const filterTransactions = (type: string) => {
    switch (type) {
      case 'trading':
        return transactions.filter(tx => ['buy', 'sell'].includes(tx.type));
      case 'staking':
        return transactions.filter(tx => ['stake', 'unstake'].includes(tx.type));
      case 'mock':
        return transactions.filter(tx => ['mock_buy', 'mock_sell'].includes(tx.type));
      default:
        return [];
    }
  };

  const renderTransaction = (tx: any) => {
    const pnl = calculateTransactionPnL(tx);
    const isPositive = pnl >= 0;
    const currentPrice = getPrice(tx.asset);
    const positionPnL = getPositionPnL(tx.asset, tx.type.includes('mock'));

    return (
      <div key={tx.id} className="flex flex-col space-y-2 p-4 border-b last:border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-2 h-2 rounded-full ${
              tx.type.includes('buy') || tx.type === 'stake' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium">
                  {tx.type.split('_').map((word: string) => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')} {tx.asset}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  tx.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                  tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {tx.type.includes('buy') || tx.type === 'stake' ? '+' : '-'}{tx.amount} {tx.asset}
            </p>
            <p className="text-sm text-muted-foreground">
              @ ${tx.price.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Current Price:</span>
              <span>${currentPrice.toFixed(2)}</span>
            </div>
            {tx.fee && (
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">Fee:</span>
                <span className="text-red-500">-${tx.fee.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="text-right space-y-1">
            <p className={`${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '▲' : '▼'} ${Math.abs(pnl).toFixed(2)}
            </p>
            {tx.type === 'stake' && tx.apy && (
              <p className="text-green-500">APY: {tx.apy}%</p>
            )}
          </div>
        </div>

        {/* Position Summary */}
        <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position P/L:</span>
            <span className={positionPnL.realized + positionPnL.unrealized >= 0 ? 'text-green-500' : 'text-red-500'}>
              ${formatNumber(positionPnL.realized + positionPnL.unrealized)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Realized:</span>
            <span className={positionPnL.realized >= 0 ? 'text-green-500' : 'text-red-500'}>
              ${formatNumber(positionPnL.realized)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unrealized:</span>
            <span className={positionPnL.unrealized >= 0 ? 'text-green-500' : 'text-red-500'}>
              ${formatNumber(positionPnL.unrealized)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
      <Tabs defaultValue="trading" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="mock">Mock Trading</TabsTrigger>
        </TabsList>
        
        {['trading', 'staking', 'mock'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="space-y-2">
              {filterTransactions(tab).length > 0 ? (
                filterTransactions(tab).map(renderTransaction)
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No {tab} transactions yet
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
