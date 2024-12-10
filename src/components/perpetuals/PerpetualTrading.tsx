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
                    type="text"
                    value={size}
                    onChange={(e) => handleSizeChange(e.target.value)}
                    placeholder="Enter position size"
                    className="flex-1"
                    pattern="\d*\.?\d*"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Leverage Selection */}
                <div className="space-y-2">
                  <Label htmlFor="leverage">Leverage</Label>
                  <Select 
                    value={leverage} 
                    onValueChange={handleLeverageChange}
                    disabled={isSubmitting}
                  >
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
                    type="text"
                    value={collateral}
                    onChange={(e) => handleCollateralChange(e.target.value)}
                    placeholder="Enter collateral amount"
                    className="flex-1"
                    pattern="\d*\.?\d*"
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: ${formattedBalance}
                  </p>
                </div>

                {errorState && (
                  <div className="mt-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
                    {errorState}
                  </div>
                )}

                <Button
                  type="submit"
                  className={cn(
                    "w-full mt-4",
                    direction === TradeDirection.Long ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                  )}
                  disabled={isSubmitting || !publicKey}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Open ${direction === TradeDirection.Long ? 'Long' : 'Short'} Position`
                  )}
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
