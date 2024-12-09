import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      await closePosition(position.user);
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
    if (!selectedPosition || !modalAction) return;

    try {
      switch (modalAction) {
        case 'leverage':
          await updateLeverage(selectedPosition.user, parseFloat(inputValue));
          break;
        case 'collateral':
          if (parseFloat(inputValue) > 0) {
            await addCollateral(selectedPosition.user, new BN(parseFloat(inputValue) * 1e9));
          } else {
            await removeCollateral(selectedPosition.user, new BN(Math.abs(parseFloat(inputValue)) * 1e9));
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
            <div key={position.user.toString()} className="p-3 bg-card rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className={`font-medium ${
                  position.direction === TradeDirection.Long ? 'text-green-500' : 'text-red-500'
                }`}>
                  {position.direction === TradeDirection.Long ? 'Long' : 'Short'} {position.market}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleClose(position)}
                  disabled={loading}
                >
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Entry Price: <span className="font-medium">{formatNumber(position.entryPrice.toNumber() / 1e9)} USDT</span></div>
                <div>Current Price: <span className="font-medium">{formatNumber(currentPrice / 1e9)} USDT</span></div>
                <div>Size: <span className="font-medium">{formatNumber(position.size.toNumber() / 1e9)} {position.market}</span></div>
                <div>Leverage: <span className="font-medium">{position.leverage}x</span></div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModalOpen('leverage', position)}
                  className="flex-1"
                >
                  Adjust Leverage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleModalOpen('collateral', position)}
                  className="flex-1"
                >
                  Manage Collateral
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
          <div className="py-4">
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={modalAction === 'leverage' ? 'Enter leverage (e.g., 2)' : 'Enter amount (negative to remove)'}
            />
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
