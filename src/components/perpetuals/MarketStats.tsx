import React from 'react';
import { usePerpetual } from '../../contexts/PerpetualContext';
import BN from 'bn.js';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function MarketStats() {
  const { marketState, currentPrice, fundingRate } = usePerpetual();

  const formatUSD = (value: BN | null): string => {
    if (!value) return '$-.--';
    return `$${(value.toNumber() / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(4)}%`;
  };

  const calculatePriceChange = (): { change: number; isPositive: boolean } => {
    // This should be implemented with actual 24h price data
    return { change: 0.0075, isPositive: true };
  };

  const priceChange = calculatePriceChange();

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Market Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price Information */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">SOL-PERP Price</p>
            <p className="text-2xl font-bold">{formatUSD(currentPrice)}</p>
            <div className="flex items-center space-x-1">
              <span className={cn(
                "text-sm",
                priceChange.isPositive ? "text-green-500" : "text-red-500"
              )}>
                {priceChange.isPositive ? "↑" : "↓"}
                {formatPercentage(priceChange.change)}
              </span>
              <span className="text-sm text-muted-foreground">(24h)</span>
            </div>
          </div>

          {/* Funding Rate */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Funding Rate (8h)</p>
            <p className="text-2xl font-bold">
              {fundingRate ? formatPercentage(fundingRate.toNumber() / 1e6) : '-.---%'}
            </p>
            <p className="text-sm text-muted-foreground">Next funding in: {/* Add countdown timer */}</p>
          </div>

          {/* Trading Volume */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">24h Volume</p>
            <p className="text-2xl font-bold">
              {marketState ? formatUSD(marketState.totalLongPositions.add(marketState.totalShortPositions)) : '$-.--'}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Open Interest */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Open Interest (Long)</p>
            <p className="text-2xl font-bold">
              {marketState ? formatUSD(marketState.totalLongPositions) : '$-.--'}
            </p>
          </div>

          {/* Open Interest */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Open Interest (Short)</p>
            <p className="text-2xl font-bold">
              {marketState ? formatUSD(marketState.totalShortPositions) : '$-.--'}
            </p>
          </div>

          {/* Insurance Fund */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Insurance Fund</p>
            <p className="text-2xl font-bold">
              {marketState ? formatUSD(marketState.insuranceFund) : '$-.--'}
            </p>
          </div>

          {/* Max Leverage */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Max Leverage</p>
            <p className="text-2xl font-bold">
              {marketState ? `${marketState.maxLeverage}x` : '--x'}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fee Information */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Trading Fees</p>
            <p className="text-sm">Maker: 0.02%</p>
            <p className="text-sm">Taker: 0.05%</p>
          </div>

          {/* Liquidation */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Liquidation</p>
            <p className="text-sm">Maintenance Margin: {marketState ? formatPercentage(marketState.maintenanceMargin) : '-.--'}</p>
            <p className="text-sm">Liquidation Fee: {marketState ? formatPercentage(marketState.liquidationFee) : '-.--'}</p>
          </div>

          {/* Min/Max Position */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Min/Max Position</p>
            <p className="text-sm">Min Collateral: {marketState ? formatUSD(marketState.minCollateral) : '$-.--'}</p>
            <p className="text-sm">Max Leverage: {marketState ? `${marketState.maxLeverage}x` : '--x'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
