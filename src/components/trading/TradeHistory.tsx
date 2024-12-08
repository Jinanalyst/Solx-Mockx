'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useMarketData } from '@/hooks/useMarketData';

interface TradeHistoryProps {
  pair: string;
  onPriceClick?: (price: number) => void;
  onError?: (error: unknown) => void;
}

export function TradeHistory({ pair, onPriceClick, onError }: TradeHistoryProps) {
  const { trades } = useMarketData(pair);

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Card className="h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Trade History</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-2 px-4 py-2 text-sm font-medium text-muted-foreground">
        <div>Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Time</div>
        <div className="text-right">Type</div>
      </div>

      <ScrollArea className="h-[calc(100%-8rem)]">
        <div className="space-y-1 px-2">
          {trades.map((trade) => (
            <div
              key={trade.time}
              className="grid grid-cols-4 gap-2 px-2 py-1 text-sm hover:bg-accent/50 cursor-pointer"
              onClick={() => onPriceClick?.(trade.price)}
            >
              <div className={cn(
                trade.side === 'buy' ? 'text-green-500' : 'text-red-500'
              )}>
                {formatNumber(trade.price)}
              </div>
              <div className="text-right">{formatNumber(trade.size)}</div>
              <div className="text-right text-muted-foreground">
                {formatTime(trade.time)}
              </div>
              <div className={cn(
                "text-right",
                trade.liquidation ? "text-yellow-500" : "text-muted-foreground"
              )}>
                {trade.liquidation ? "LIQUIDATION" : trade.side.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
