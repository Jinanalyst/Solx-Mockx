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

  const openModal = (position: Position, action: 'leverage' | 'collateral') => {
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
        <div className="text-center py-4 text-muted-foreground">No open positions</div>
      ) : (
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Market</th>
                <th className="px-4 py-2 text-left">Side</th>
                <th className="px-4 py-2 text-right">Size</th>
                <th className="px-4 py-2 text-right">Entry Price</th>
                <th className="px-4 py-2 text-right">Mark Price</th>
                <th className="px-4 py-2 text-right">PnL</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.user.toString()} className="border-b">
                  <td className="px-4 py-2">{position.market}</td>
                  <td className={`px-4 py-2 ${position.direction === TradeDirection.Long ? 'text-green-500' : 'text-red-500'}`}>
                    {position.direction === TradeDirection.Long ? 'LONG' : 'SHORT'}
                  </td>
                  <td className="px-4 py-2 text-right">{formatNumber(position.size.toNumber() / 1e9)}</td>
                  <td className="px-4 py-2 text-right">${formatNumber(position.entryPrice.toNumber() / 1e9)}</td>
                  <td className="px-4 py-2 text-right">${formatNumber(currentPrice / 1e9)}</td>
                  <td className={`px-4 py-2 text-right ${position.unrealizedPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${formatNumber(position.unrealizedPnl)}
                  </td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(position, 'leverage')}
                    >
                      Leverage
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(position, 'collateral')}
                    >
                      Collateral
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleClose(position)}
                    >
                      Close
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
