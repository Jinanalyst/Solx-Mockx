import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { usePerpetual } from '../../contexts/PerpetualContext';
import { Position, TradeDirection } from '../../perpetuals/types';
import { formatNumber } from '@/utils/format';
import cn from 'classnames';

export function PositionManager() {
  const {
    positions,
    currentPrice,
    closePosition,
    updateLeverage,
    addCollateral,
    removeCollateral,
    loading,
  } = usePerpetual();

  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [modalAction, setModalAction] = useState<'leverage' | 'collateral' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleClose = async (position: Position) => {
    try {
      await closePosition(position.user.toString());
      toast({
        title: 'Success',
        description: 'Position closed successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to close position',
        variant: 'destructive',
      });
    }
  };

  const handleModalAction = async () => {
    if (!selectedPosition || !modalAction || !inputValue) return;

    try {
      switch (modalAction) {
        case 'leverage':
          await updateLeverage(selectedPosition.user.toString(), parseFloat(inputValue));
          break;
        case 'collateral':
          if (parseFloat(inputValue) > 0) {
            await addCollateral(selectedPosition.user.toString(), new BN(parseFloat(inputValue) * 1e6));
          } else {
            await removeCollateral(selectedPosition.user.toString(), new BN(Math.abs(parseFloat(inputValue)) * 1e6));
          }
          break;
      }

      toast({
        title: 'Success',
        description: 'Position updated successfully',
      });

      setIsOpen(false);
      setInputValue('');
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update position',
        variant: 'destructive',
      });
    }
  };

  const handleModalOpen = (action: 'leverage' | 'collateral', position: Position) => {
    setSelectedPosition(position);
    setModalAction(action);
    setIsOpen(true);
  };

  if (loading) {
    return <div className="text-center py-4">Loading positions...</div>;
  }

  return (
    <div className="space-y-4">
      {positions.length === 0 ? (
        <p className="text-center text-muted-foreground">No open positions</p>
      ) : (
        <div className="space-y-3">
          {positions.map((position) => (
            <div key={position.user.toString()} className="p-4 bg-card rounded-lg border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">
                    {formatNumber(position.size.toNumber() / 1e6)} USD
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entry Price</p>
                  <p className="font-medium">
                    ${formatNumber(position.entryPrice.toNumber() / 1e6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leverage</p>
                  <p className="font-medium">{position.leverage}x</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Direction</p>
                  <p className={cn(
                    "font-medium",
                    position.direction === TradeDirection.Long ? "text-green-500" : "text-red-500"
                  )}>
                    {position.direction === TradeDirection.Long ? "Long" : "Short"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModalOpen('leverage', position)}
                >
                  Adjust Leverage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModalOpen('collateral', position)}
                >
                  Adjust Collateral
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleClose(position)}
                >
                  Close Position
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalAction === 'leverage' ? 'Adjust Leverage' : 'Adjust Collateral'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {modalAction === 'leverage' ? 'New Leverage' : 'Collateral Amount'}
              </Label>
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={modalAction === 'leverage' ? "Enter leverage" : "Enter amount"}
                min={modalAction === 'leverage' ? "1" : undefined}
                step={modalAction === 'leverage' ? "1" : "0.01"}
              />
              {modalAction === 'collateral' && (
                <p className="text-sm text-muted-foreground">
                  Use negative values to remove collateral
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleModalAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
