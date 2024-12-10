import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { usePerpetual } from '../../contexts/PerpetualContext';
import { TradeDirection, OrderParams } from '../../perpetuals/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function PerpetualTrading() {
  const { publicKey } = useWallet();
  const {
    positions,
    currentPrice,
    fundingRate,
    balance,
    openPosition,
    loading,
    error
  } = usePerpetual();

  const [size, setSize] = useState('');
  const [leverage, setLeverage] = useState('1');
  const [direction, setDirection] = useState<TradeDirection>(TradeDirection.Long);
  const [collateral, setCollateral] = useState('');
  const { toast } = useToast();

  const formattedBalance = useMemo(() => {
    if (!balance) return '0.00';
    return (balance.toNumber() / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, [balance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    try {
      const params: OrderParams = {
        direction,
        size: new BN(parseFloat(size) * 1e6),
        leverage: parseInt(leverage),
        collateral: new BN(parseFloat(collateral) * 1e6),
      };

      await openPosition(params);
      toast({
        title: 'Success',
        description: 'Position opened successfully',
      });
    } catch (err) {
      console.error('Error opening position:', err);
      toast({
        title: 'Error',
        description: 'Failed to open position. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const calculateRequiredCollateral = () => {
    const leverageValue = Number(leverage);
    const sizeValue = Number(size);
    const requiredCollateral = (sizeValue / leverageValue) * 100;
    return requiredCollateral.toFixed(2);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Account Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Account Balance</p>
              <p className="text-2xl font-bold">${formattedBalance}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-2xl font-bold">
                ${currentPrice ? (currentPrice.toNumber() / 1e6).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Funding Rate</p>
              <p className="text-2xl font-bold">
                {fundingRate ? (fundingRate.toNumber() / 1e6 * 100).toFixed(4) : '0.00'}%
              </p>
            </div>
          </div>

          {/* Trading Interface */}
          <Tabs defaultValue="market" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="limit">Limit</TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Direction Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={direction === TradeDirection.Long ? "default" : "outline"}
                    className={cn(
                      "w-full",
                      direction === TradeDirection.Long && "bg-green-500 hover:bg-green-600"
                    )}
                    onClick={() => setDirection(TradeDirection.Long)}
                  >
                    Long
                  </Button>
                  <Button
                    type="button"
                    variant={direction === TradeDirection.Short ? "default" : "outline"}
                    className={cn(
                      "w-full",
                      direction === TradeDirection.Short && "bg-red-500 hover:bg-red-600"
                    )}
                    onClick={() => setDirection(TradeDirection.Short)}
                  >
                    Short
                  </Button>
                </div>

                {/* Size Input */}
                <div className="space-y-2">
                  <Label htmlFor="size">Size (USD)</Label>
                  <Input
                    id="size"
                    type="number"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="Enter position size"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Leverage Selection */}
                <div className="space-y-2">
                  <Label htmlFor="leverage">Leverage</Label>
                  <Select value={leverage} onValueChange={setLeverage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leverage" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5, 10].map((value) => (
                        <SelectItem key={value} value={value.toString()}>
                          {value}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Required Collateral */}
                <div className="space-y-2">
                  <Label>Required Collateral (USDT)</Label>
                  <Input
                    value={calculateRequiredCollateral()}
                    readOnly
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    {Number(leverage)}x leverage requires {(100 / Number(leverage)).toFixed(2)}% collateral
                  </p>
                </div>

                {/* Collateral Input */}
                <div className="space-y-2">
                  <Label htmlFor="collateral">Collateral (USD)</Label>
                  <Input
                    id="collateral"
                    type="number"
                    value={collateral}
                    onChange={(e) => setCollateral(e.target.value)}
                    placeholder="Enter collateral amount"
                    min="0"
                    step="0.01"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: ${formattedBalance}
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !publicKey}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="limit" className="space-y-4">
              <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">Limit orders coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
