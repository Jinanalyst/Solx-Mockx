'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { usePrice } from '@/contexts/PriceContext';
import { formatNumber } from '@/services/tokenService';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@/contexts/WalletContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface Position {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  entryPrice: number;
  quantity: number;
  leverage: number;
  liquidationPrice: number;
  margin: number;
  unrealizedPnL: number;
  realizedPnL: number;
  status: 'OPEN' | 'CLOSED' | 'LIQUIDATED';
}

export function PositionsTab({ symbol }: { symbol?: string }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getPrice } = usePrice();
  const { address } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (!address) return;

    // Initial fetch
    const fetchPositions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/positions?address=${address}${symbol ? `&symbol=${symbol}` : ''}`);
        const data = await response.json();
        setPositions(data);
      } catch (error) {
        toast({
          title: "Error fetching positions",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();

    // WebSocket connection for real-time updates
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/positions`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ 
        type: 'subscribe', 
        address,
        symbol 
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'position_update') {
        setPositions(prev => {
          const updated = [...prev];
          const index = updated.findIndex(p => p.id === data.position.id);
          if (index !== -1) {
            updated[index] = data.position;
          } else {
            updated.push(data.position);
          }
          return updated;
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [address, symbol, toast]);

  const handleClosePosition = async (positionId: string) => {
    try {
      const response = await fetch('/api/positions/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ positionId }),
      });

      if (!response.ok) throw new Error('Failed to close position');

      toast({
        title: "Position closed",
        description: "Your position has been closed successfully",
      });
    } catch (error) {
      toast({
        title: "Error closing position",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (!address) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Please connect your wallet to view your positions
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No open positions {symbol ? `for ${symbol}` : ''}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position) => {
        const currentPrice = getPrice(position.symbol);
        const pnlPercentage = (position.unrealizedPnL / position.margin) * 100;
        const isProfit = position.unrealizedPnL > 0;

        return (
          <Card key={position.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{position.symbol}</h3>
                <Badge variant={position.type === 'LONG' ? 'default' : 'destructive'}>
                  {position.type}
                </Badge>
                <Badge variant="outline">{position.leverage}x</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClosePosition(position.id)}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium">
                  {formatNumber(position.quantity)} {position.symbol.split('/')[0]}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entry Price</p>
                <p className="font-medium">${formatNumber(position.entryPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mark Price</p>
                <p className="font-medium">${formatNumber(currentPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Liquidation Price</p>
                <p className="font-medium text-destructive">
                  ${formatNumber(position.liquidationPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Margin</p>
                <p className="font-medium">${formatNumber(position.margin)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unrealized P/L</p>
                <p className={`font-medium ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                  ${formatNumber(Math.abs(position.unrealizedPnL))} ({pnlPercentage.toFixed(2)}%)
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
