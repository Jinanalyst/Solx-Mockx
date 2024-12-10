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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const formattedBalance = useMemo(() => {
    if (!balance) return '0.00';
    return (balance.toNumber() / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, [balance]);

  const validateInputs = () => {
    if (!publicKey) {
      setErrorState('Please connect your wallet');
      return false;
    }
    if (!size || parseFloat(size) <= 0) {
      setErrorState('Invalid position size');
      return false;
    }
    if (!leverage || parseInt(leverage) <= 0) {
      setErrorState('Invalid leverage');
      return false;
    }
    if (!collateral || parseFloat(collateral) <= 0) {
      setErrorState('Invalid collateral amount');
      return false;
    }
    const collateralNum = parseFloat(collateral);
    const balanceNum = balance ? balance.toNumber() / 1e6 : 0;
    if (collateralNum > balanceNum) {
      setErrorState('Insufficient balance');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState(null);
    
    if (!validateInputs()) return;

    setIsSubmitting(true);
    try {
      const sizeNum = parseFloat(size);
      const leverageNum = parseInt(leverage);
      const collateralNum = parseFloat(collateral);

      const params: OrderParams = {
        direction,
        size: new BN(sizeNum * 1e6),
        leverage: leverageNum,
        collateral: new BN(collateralNum * 1e6),
        price: new BN(currentPrice || 0),
      };

      await openPosition(params);
      toast({
        title: 'Success',
        description: 'Position opened successfully',
      });
      // Reset form
      setSize('');
      setCollateral('');
    } catch (err) {
      console.error('Error opening position:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to open position';
      setErrorState(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSizeChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSize(value);
      if (value && leverage) {
        const requiredCollateral = (parseFloat(value) / parseInt(leverage)).toFixed(6);
        setCollateral(requiredCollateral);
      }
    }
  };

  const handleLeverageChange = (value: string) => {
    setLeverage(value);
    if (size && value) {
      const requiredCollateral = (parseFloat(size) / parseInt(value)).toFixed(6);
      setCollateral(requiredCollateral);
    }
  };

  const handleCollateralChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCollateral(value);
      if (value && leverage) {
        const newSize = (parseFloat(value) * parseInt(leverage)).toFixed(6);
        setSize(newSize);
      }
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
        <Tabs defaultValue="trade" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="info">Market Info</TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={direction === TradeDirection.Long ? "default" : "outline"}
                  onClick={() => setDirection(TradeDirection.Long)}
                  className="flex-1"
                >
                  Long
                </Button>
                <Button
                  type="button"
                  variant={direction === TradeDirection.Short ? "default" : "outline"}
                  onClick={() => setDirection(TradeDirection.Short)}
                  className="flex-1"
                >
                  Short
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Size</Label>
                <Input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Enter position size"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label>Leverage</Label>
                <Select value={leverage} onValueChange={setLeverage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leverage" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 10, 20].map((lev) => (
                      <SelectItem key={lev} value={lev.toString()}>
                        {lev}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Collateral</Label>
                <Input
                  type="number"
                  value={collateral}
                  onChange={(e) => setCollateral(e.target.value)}
                  placeholder="Enter collateral amount"
                  min="0"
                  step="0.01"
                />
                <p className="text-sm text-muted-foreground">
                  Available: {formattedBalance} USDC
                </p>
              </div>

              {errorState && (
                <p className="text-sm text-destructive">{errorState}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !publicKey}
              >
                {isSubmitting ? "Opening Position..." : "Open Position"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="space-y-2">
              <Label>Current Price</Label>
              <p className="text-2xl font-bold">
                ${currentPrice ? (currentPrice.toNumber() / 1e6).toFixed(2) : "0.00"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Funding Rate</Label>
              <p className="text-lg">
                {fundingRate ? (fundingRate.toNumber() / 1e6).toFixed(4) : "0.00"}%
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
