import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { formatNumber } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useSolxTrading } from '@/contexts/SolxTradingContext';
import { TradingRewardsCalculator } from '@/utils/tradingRewards';

export function SolxPositions() {
  const { publicKey } = useWallet();
  const { positions, closePosition, isLoading } = useSolxTrading();

  if (!publicKey) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">SOLX Positions</h3>
        <div className="text-center text-muted-foreground">Please connect your wallet</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">SOLX Positions</h3>
        <div className="text-center text-muted-foreground">Loading positions...</div>
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">SOLX Positions</h3>
        <div className="text-center text-muted-foreground">No open positions</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">SOLX Positions</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pair</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>PnL</TableHead>
            <TableHead>PnL %</TableHead>
            <TableHead>Fees Earned</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => {
            const pnl = position.unrealizedPnl;
            const pnlPercentage = (pnl / (position.entryPrice * position.size)) * 100;

            // Calculate potential rewards
            const rewardsCalculator = TradingRewardsCalculator.getInstance();
            const { tradingFee, solxReward, netProfit } = rewardsCalculator.calculateFeesAndRewards(pnl);
            const isEligible = rewardsCalculator.isEligibleForReward(pnl);

            return (
              <TableRow key={position.id}>
                <TableCell>{position.pair}</TableCell>
                <TableCell>
                  <span className={position.side === 'long' ? 'text-green-500' : 'text-red-500'}>
                    {position.side.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>${formatNumber(position.entryPrice)}</TableCell>
                <TableCell>{formatNumber(position.size)} SOLX</TableCell>
                <TableCell>${formatNumber(position.markPrice)}</TableCell>
                <TableCell>
                  <span className={pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                    ${formatNumber(netProfit)} SOL
                    {isEligible && (
                      <span className="ml-2 text-xs text-yellow-500">
                        (+${formatNumber(solxReward)} SOLX)
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatNumber(pnlPercentage)}%
                  </span>
                </TableCell>
                <TableCell>${formatNumber(position.feesEarned)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => closePosition(position.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
