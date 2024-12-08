'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TradingPair } from '@/types/trading';
import { formatPrice } from '@/services/priceService';
import { cn } from '@/lib/utils';

interface TradingPairsTableProps {
  pairs: TradingPair[];
  selectedPair: TradingPair;
  onSelectPair: (pair: TradingPair) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  pairPrices: any;
}

export function TradingPairsTable({
  pairs,
  selectedPair,
  onSelectPair,
  searchQuery,
  setSearchQuery,
  pairPrices,
}: TradingPairsTableProps) {
  // Filter pairs based on search query
  const filteredPairs = pairs.filter((pair) =>
    pair.name.toLowerCase().includes(searchQuery?.toLowerCase() ?? '')
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search pairs..."
        value={searchQuery ?? ''}
        onChange={(e) => setSearchQuery?.(e.target.value)}
        className="w-full"
      />
      
      <ScrollArea className="h-[600px]">
        <div className="space-y-1">
          {filteredPairs.map((pair) => {
            const pairPrice = pairPrices[pair.name];
            const priceChangeColor = pairPrice?.priceChangePercentage24h >= 0 
              ? 'text-green-500' 
              : 'text-red-500';

            return (
              <div
                key={pair.name}
                className={cn(
                  'flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent/50',
                  selectedPair === pair && 'bg-accent'
                )}
                onClick={() => onSelectPair(pair)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{pair.name}</span>
                  <span className="text-sm text-muted-foreground">
                    Vol: ${pairPrice?.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {pairPrice ? formatPrice(pairPrice.price) : '-.--'}
                  </div>
                  <div className={cn('text-sm', priceChangeColor)}>
                    {pairPrice
                      ? `${pairPrice.priceChangePercentage24h >= 0 ? '+' : ''}${pairPrice.priceChangePercentage24h.toFixed(2)}%`
                      : '-.--'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
