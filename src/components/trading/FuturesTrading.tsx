'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFutures } from '@/contexts/FuturesContext';
import type { Position } from '@/contexts/FuturesContext';
import {
  LEVERAGE_OPTIONS,
  calculatePositionSize,
  calculateRequiredMargin,
  calculateLiquidationPrice,
  calculatePnL,
  formatUSD,
} from '@/utils/futuresCalculations';

interface FuturesTradingProps {
  pair: string;
  currentPrice: number;
  onError?: (error: unknown) => void;
}

export function FuturesTrading({ pair, currentPrice, onError }: FuturesTradingProps) {
  const { state, openPosition } = useFutures();
  
  const [position, setPosition] = useState<Omit<Position, 'id' | 'timestamp'>>({
    pair,
    entryPrice: currentPrice,
    leverage: 1,
    margin: 100,
    positionSize: 100,
    tradeSize: 100,
    side: 'long',
    maintenanceMargin: 0.5,
    stopLoss: null,
    takeProfit: null,
  });

  const [orderAmount, setOrderAmount] = useState<string>('100');
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const margin = parseFloat(orderAmount) || 0;
    const positionSize = calculatePositionSize(margin, position.leverage);
    
    setPosition(prev => ({
      ...prev,
      margin,
      positionSize,
      entryPrice: currentPrice,
      tradeSize: positionSize,
    }));
  }, [orderAmount, position.leverage, currentPrice]);

  const liquidationPrice = calculateLiquidationPrice(position);
  const pnl = calculatePnL(position, currentPrice);

  const handleLeverageChange = (value: string) => {
    const leverage = parseInt(value);
    const margin = parseFloat(orderAmount) || 0;
    const positionSize = calculatePositionSize(margin, leverage);
    
    setPosition(prev => ({
      ...prev,
      leverage,
      positionSize,
      tradeSize: positionSize,
    }));
  };

  const handleSideChange = (value: 'long' | 'short') => {
    setPosition(prev => ({
      ...prev,
      side: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate stop loss
      if (stopLossPrice) {
        const slPrice = parseFloat(stopLossPrice);
        if (position.side === 'long' && slPrice >= currentPrice) {
          throw new Error('Stop loss must be below current price for long positions');
        }
        if (position.side === 'short' && slPrice <= currentPrice) {
          throw new Error('Stop loss must be above current price for short positions');
        }
      }

      // Validate take profit
      if (takeProfitPrice) {
        const tpPrice = parseFloat(takeProfitPrice);
        if (position.side === 'long' && tpPrice <= currentPrice) {
          throw new Error('Take profit must be above current price for long positions');
        }
        if (position.side === 'short' && tpPrice >= currentPrice) {
          throw new Error('Take profit must be below current price for short positions');
        }
      }

      // Check available balance
      if (position.margin > state.availableBalance) {
        throw new Error('Insufficient balance');
      }

      await openPosition({
        ...position,
        pair,
        stopLoss: stopLossPrice ? parseFloat(stopLossPrice) : null,
        takeProfit: takeProfitPrice ? parseFloat(takeProfitPrice) : null,
        tradeSize: position.positionSize,
      });

      // Reset form
      setOrderAmount('100');
      setStopLossPrice('');
      setTakeProfitPrice('');
    } catch (error) {
      console.error('Error submitting order:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Perpetual Futures Trading</h2>
        <div className="flex space-x-2">
          <Button
            variant={position.side === 'long' ? 'default' : 'outline'}
            onClick={() => handleSideChange('long')}
            className="w-24"
          >
            Long
          </Button>
          <Button
            variant={position.side === 'short' ? 'default' : 'outline'}
            onClick={() => handleSideChange('short')}
            className="w-24"
          >
            Short
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Leverage</Label>
          <Select
            value={position.leverage.toString()}
            onValueChange={handleLeverageChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select leverage" />
            </SelectTrigger>
            <SelectContent>
              {LEVERAGE_OPTIONS.map((leverage) => (
                <SelectItem key={leverage} value={leverage.toString()}>
                  {leverage}x
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Margin (USD)</Label>
          <Input
            type="number"
            value={orderAmount}
            onChange={(e) => setOrderAmount(e.target.value)}
            min="0"
            step="1"
          />
          <div className="text-sm text-muted-foreground mt-1">
            Available: {formatUSD(state.availableBalance)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Stop Loss</Label>
            <Input
              type="number"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(e.target.value)}
              placeholder={position.side === 'long' ? '< Entry Price' : '> Entry Price'}
            />
          </div>
          <div>
            <Label>Take Profit</Label>
            <Input
              type="number"
              value={takeProfitPrice}
              onChange={(e) => setTakeProfitPrice(e.target.value)}
              placeholder={position.side === 'long' ? '> Entry Price' : '< Entry Price'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Position Size</Label>
            <div className="text-lg font-semibold">
              {formatUSD(position.positionSize)}
            </div>
          </div>
          <div>
            <Label>Required Margin</Label>
            <div className="text-lg font-semibold">
              {formatUSD(position.margin)}
            </div>
          </div>
          <div>
            <Label>Entry Price</Label>
            <div className="text-lg font-semibold">
              {formatUSD(position.entryPrice)}
            </div>
          </div>
          <div>
            <Label>Liquidation Price</Label>
            <div className="text-lg font-semibold text-destructive">
              {formatUSD(liquidationPrice)}
            </div>
          </div>
        </div>

        <div>
          <Label>Unrealized PnL</Label>
          <div className={`text-lg font-semibold ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatUSD(pnl)}
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          variant={position.side === 'long' ? 'default' : 'destructive'}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : `Place ${position.side === 'long' ? 'Long' : 'Short'} Order`}
        </Button>
      </div>
    </Card>
  );
}
