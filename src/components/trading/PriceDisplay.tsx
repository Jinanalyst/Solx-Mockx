'use client';

import { Card } from '@/components/ui/card';
import { formatPrice } from '@/services/priceService';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Activity, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceDisplayProps {
  pair: string;
  price: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
}

export function PriceDisplay({
  pair,
  price,
  high24h,
  low24h,
  volume24h,
  priceChange24h,
  priceChangePercentage24h,
}: PriceDisplayProps) {
  const [baseToken, quoteToken] = pair.split('/');
  const isPositiveChange = priceChangePercentage24h >= 0;

  const stats = [
    {
      label: '24h High',
      value: formatPrice(high24h),
      icon: TrendingUp,
    },
    {
      label: '24h Low',
      value: formatPrice(low24h),
      icon: TrendingDown,
    },
    {
      label: '24h Volume',
      value: `$${volume24h.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      })}`,
      icon: Activity,
    },
  ];

  return (
    <Card className="p-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Price and pair info */}
        <div className="col-span-4 border-r">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold">{pair}</h2>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">
                {formatPrice(price)}
              </span>
              <span className="text-muted-foreground">{quoteToken}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={cn(
                  'flex items-center space-x-1',
                  isPositiveChange ? 'text-green-500' : 'text-red-500'
                )}
              >
                {isPositiveChange ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
                <span>{Math.abs(priceChange24h).toFixed(4)}</span>
                <span>({Math.abs(priceChangePercentage24h).toFixed(2)}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="col-span-8 grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <stat.icon className="h-4 w-4" />
                <span className="text-sm">{stat.label}</span>
              </div>
              <div className="text-lg font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
