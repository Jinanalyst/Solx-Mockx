'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useTradingContext, Position } from '@/contexts/TradingContext';

interface PositionActionsProps {
  position: Position;
}

function PositionActions({ position }: PositionActionsProps) {
  const { toast } = useToast();
  const {
    closePosition,
    updateLeverage,
    addCollateral,
    removeCollateral,
  } = useTradingContext();

  const [isClosing, setIsClosing] = useState(false);
  const [closeSize, setCloseSize] = useState(position.size.toString());
  const [newLeverage, setNewLeverage] = useState(position.leverage);
  const [collateralAmount, setCollateralAmount] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClosePosition = async () => {
    setIsClosing(true);
    try {
      const size = parseFloat(closeSize);
      if (isNaN(size) || size <= 0 || size > position.size) {
        throw new Error('Invalid size');
      }

      await closePosition(position.market, size);
      toast({
        title: 'Position Closed',
        description: `Closed ${size} ${position.market}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsClosing(false);
    }
  };

  const handleUpdateLeverage = async () => {
    setIsUpdating(true);
    try {
      await updateLeverage(position.market, newLeverage);
      toast({
        title: 'Leverage Updated',
        description: `Updated leverage to ${newLeverage}x`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCollateralChange = async (action: 'add' | 'remove') => {
    setIsUpdating(true);
    try {
      const amount = parseFloat(collateralAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      if (action === 'add') {
        await addCollateral(position.market, amount);
      } else {
        await removeCollateral(position.market, amount);
      }

      toast({
        title: 'Collateral Updated',
        description: `${action === 'add' ? 'Added' : 'Removed'} ${amount} collateral`,
      });
      setCollateralAmount('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm">Close</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Position</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Size</Label>
              <Input
                type="number"
                value={closeSize}
                onChange={(e) => setCloseSize(e.target.value)}
                max={position.size}
                step="any"
              />
            </div>
            <Button
              onClick={handleClosePosition}
              disabled={isClosing}
              className="w-full"
            >
              {isClosing ? 'Closing...' : 'Close Position'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm">Adjust</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Position</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Leverage: {newLeverage}x</Label>
              <Slider
                value={[newLeverage]}
                onValueChange={([value]) => setNewLeverage(value)}
                min={1}
                max={20}
                step={1}
              />
              <Button
                onClick={handleUpdateLeverage}
                disabled={isUpdating}
                className="w-full"
              >
                Update Leverage
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Collateral Amount</Label>
              <Input
                type="number"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                step="any"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleCollateralChange('add')}
                  disabled={isUpdating}
                >
                  Add Collateral
                </Button>
                <Button
                  onClick={() => handleCollateralChange('remove')}
                  disabled={isUpdating}
                  variant="destructive"
                >
                  Remove Collateral
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PositionsTable() {
  const { positions, markPrice } = useTradingContext();

  const formatNumber = (value: number, decimals: number = 4) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const formatPnL = (value: number) => {
    const formatted = formatNumber(Math.abs(value), 2);
    return `${value >= 0 ? '+' : '-'}$${formatted}`;
  };

  const calculateROE = (position: Position) => {
    const currentValue = position.size * (markPrice[position.market] || position.entryPrice);
    const initialValue = position.size * position.entryPrice;
    const pnl = position.side === 'LONG' ? currentValue - initialValue : initialValue - currentValue;
    return (pnl / position.collateral) * 100;
  };

  if (positions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No open positions
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Market</TableHead>
          <TableHead>Side</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Notional</TableHead>
          <TableHead>Entry Price</TableHead>
          <TableHead>Mark Price</TableHead>
          <TableHead>Liq. Price</TableHead>
          <TableHead>Leverage</TableHead>
          <TableHead>PnL (ROE%)</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((position) => (
          <TableRow key={position.market}>
            <TableCell>{position.market}</TableCell>
            <TableCell>
              <span className={position.side === 'LONG' ? 'text-green-500' : 'text-red-500'}>
                {position.side}
              </span>
            </TableCell>
            <TableCell>{formatNumber(position.size)}</TableCell>
            <TableCell>${formatNumber(position.notional, 2)}</TableCell>
            <TableCell>${formatNumber(position.entryPrice)}</TableCell>
            <TableCell>${formatNumber(markPrice[position.market] || position.entryPrice)}</TableCell>
            <TableCell>${formatNumber(position.liquidationPrice)}</TableCell>
            <TableCell>{position.leverage}x</TableCell>
            <TableCell>
              <div className={position.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPnL(position.unrealizedPnl)}
                <span className="text-xs ml-1">
                  ({formatNumber(calculateROE(position), 2)}%)
                </span>
              </div>
            </TableCell>
            <TableCell>
              <PositionActions position={position} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
