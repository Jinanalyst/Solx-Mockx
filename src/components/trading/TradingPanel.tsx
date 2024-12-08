'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useWallet } from '@solana/wallet-adapter-react';
import { SUPPORTED_TOKENS } from '@/config/trading';
import { useToast } from '@/components/ui/use-toast';

interface TradingPanelProps {
  pair: string;
  currentPrice: number;
  onOrderSubmit?: (order: any) => void;
  onError?: (error: unknown) => void;
}

export function TradingPanel({ pair, currentPrice, onOrderSubmit, onError }: TradingPanelProps) {
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState(currentPrice?.toString() || '');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');

  const [baseToken, quoteToken] = pair.split('/');
  const baseDecimals = SUPPORTED_TOKENS[baseToken as keyof typeof SUPPORTED_TOKENS]?.decimals || 9;
  const quoteDecimals = SUPPORTED_TOKENS[quoteToken as keyof typeof SUPPORTED_TOKENS]?.decimals || 6;

  useEffect(() => {
    if (currentPrice && orderType === 'market') {
      setPrice(currentPrice.toString());
    }
  }, [currentPrice, orderType]);

  // Calculate total when price or amount changes
  useEffect(() => {
    if (price && amount) {
      const calculatedTotal = parseFloat(price) * parseFloat(amount);
      setTotal(calculatedTotal.toFixed(quoteDecimals));
    } else {
      setTotal('');
    }
  }, [price, amount, quoteDecimals]);

  const handleSubmit = async () => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to trade',
        variant: 'destructive',
      });
      return;
    }

    if (!price || !amount) {
      toast({
        title: 'Invalid order',
        description: 'Please enter both price and amount',
        variant: 'destructive',
      });
      return;
    }

    const order = {
      type: orderType,
      side,
      price: parseFloat(price),
      amount: parseFloat(amount),
      total: parseFloat(total),
      pair,
      timestamp: Date.now(),
    };

    try {
      // TODO: Implement actual order submission logic
      onOrderSubmit?.(order);
      
      toast({
        title: 'Order submitted',
        description: `Successfully placed ${side} order for ${amount} ${baseToken}`,
      });

      // Reset form
      setAmount('');
      if (orderType === 'limit') {
        setPrice('');
      }
      setTotal('');
    } catch (error) {
      onError?.(error);
      toast({
        title: 'Order failed',
        description: error instanceof Error ? error.message : 'Failed to place order',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="p-4">
      <Tabs defaultValue={orderType} onValueChange={(v) => setOrderType(v as 'market' | 'limit')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="limit">Limit</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Buy/Sell Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              variant={side === 'buy' ? 'default' : 'outline'}
              onClick={() => setSide('buy')}
              className="w-full"
            >
              Buy
            </Button>
            <Button
              variant={side === 'sell' ? 'default' : 'outline'}
              onClick={() => setSide('sell')}
              className="w-full"
            >
              Sell
            </Button>
          </div>

          {/* Price Input */}
          {orderType === 'limit' && (
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Price ({quoteToken})</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step={`0.${'0'.repeat(quoteDecimals - 1)}1`}
              />
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">Amount ({baseToken})</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step={`0.${'0'.repeat(baseDecimals - 1)}1`}
            />
          </div>

          {/* Total */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium">Total ({quoteToken})</label>
            <Input
              type="number"
              value={total}
              onChange={(e) => {
                setTotal(e.target.value);
                if (price && parseFloat(price) > 0) {
                  setAmount((parseFloat(e.target.value) / parseFloat(price)).toFixed(baseDecimals));
                }
              }}
              placeholder="0.00"
              min="0"
              step={`0.${'0'.repeat(quoteDecimals - 1)}1`}
            />
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!publicKey || !price || !amount}
          >
            {publicKey
              ? `${side === 'buy' ? 'Buy' : 'Sell'} ${baseToken}`
              : 'Connect Wallet'}
          </Button>
        </div>
      </Tabs>
    </Card>
  );
}
