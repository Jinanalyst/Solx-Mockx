'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { usePortfolioStore } from '@/stores/portfolioStore';
import { usePrice } from '@/contexts/PriceContext';
import { formatNumber } from '@/services/tokenService';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@solana/wallet-adapter-react';
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
  const { publicKey } = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    if (!publicKey) return;

    // Initial fetch
    const fetchPositions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/positions?address=${publicKey.toBase58()}${symbol ? `&symbol=${symbol}` : ''}`);
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

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/positions`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'subscribe',
        address: publicKey.toBase58(),
        symbol,
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'positions_update') {
        setPositions(data.positions);
      }
    };

    return () => {
      ws.close();
    };
  }, [publicKey, symbol, toast]);

  const handleClosePosition = async (positionId: string) => {
    if (!publicKey) return;

    try {
      const response = await fetch('/api/positions/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionId,
          address: publicKey.toBase58(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to close position');
      }

      toast({
        title: "Position closed",
        description: "Your position has been closed successfully",
      });

      // Refetch positions
      const updatedPositions = positions.filter(p => p.id !== positionId);
      setPositions(updatedPositions);
    } catch (error) {
      toast({
        title: "Error closing position",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!publicKey) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Please connect your wallet to view positions
        </div>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No open positions found
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {positions.map((position) => (
        <Card key={position.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-lg font-semibold">{position.symbol}</h4>
                <Badge variant={position.type === 'LONG' ? 'default' : 'destructive'} className={position.type === 'LONG' ? 'bg-green-500 hover:bg-green-600' : ''}>
                  {position.type}
                </Badge>
                <Badge variant="outline">{position.leverage}x</Badge>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                <div className="text-muted-foreground">Entry Price:</div>
                <div>${formatNumber(position.entryPrice)}</div>
                <div className="text-muted-foreground">Size:</div>
                <div>{formatNumber(position.quantity)}</div>
                <div className="text-muted-foreground">Margin:</div>
                <div>${formatNumber(position.margin)}</div>
                <div className="text-muted-foreground">Liq. Price:</div>
                <div>${formatNumber(position.liquidationPrice)}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-semibold mb-2 ${position.unrealizedPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${formatNumber(position.unrealizedPnL)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClosePosition(position.id)}
              >
                Close Position
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
