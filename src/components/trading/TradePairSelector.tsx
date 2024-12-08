'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useMarketData } from '@/contexts/MarketDataContext';

// Component for handling market images with error fallback
const MarketImage = ({ src, alt }: { src?: string; alt: string }) => {
  const [error, setError] = useState(false);
  if (!src || error) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="w-6 h-6 rounded-full"
      onError={() => setError(true)}
    />
  );
};

interface TradePairSelectorProps {
  selectedPair: string | null;
  onPairSelect: (pair: string) => void;
}

export function TradePairSelector({ selectedPair, onPairSelect }: TradePairSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { marketData, marketPairs, isLoading } = useMarketData();

  // Memoize number formatters to prevent unnecessary re-creation
  const formatters = useMemo(() => ({
    price: new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    volume: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }),
  }), []);

  const formatPrice = (price: number) => formatters.price.format(price);
  const formatVolume = (volume: number) => formatters.volume.format(volume);
  const formatPriceChange = (change: number) => `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;

  // Memoize selected market data
  const selectedMarketData = useMemo(() => {
    if (!selectedPair || !marketData) return null;
    return marketData.find(market => market.symbol.toUpperCase() === selectedPair.toUpperCase());
  }, [selectedPair, marketData]);

  // Memoize filtered markets
  const filteredMarkets = useMemo(() => {
    if (!marketData) return [];
    return marketData.filter(market =>
      market.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
      market.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [marketData, searchValue]);

  return (
    <div className="flex flex-col">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-[280px]"
          >
            <div className="flex items-center gap-2">
              {selectedMarketData?.image && (
                <MarketImage src={selectedMarketData.image} alt={selectedMarketData.name} />
              )}
              <span>{selectedPair || 'Select a pair'}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0">
          <Command>
            <CommandInput
              placeholder="Search market..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="h-9"
            />
            <CommandEmpty>No market found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-1 gap-1 p-1">
                  {filteredMarkets.map(market => (
                    <CommandItem
                      key={market.id}
                      value={market.symbol}
                      onSelect={() => {
                        onPairSelect(market.symbol);
                        setOpen(false);
                      }}
                      className="px-2 py-3"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <MarketImage src={market.image} alt={market.name} />
                          <div>
                            <div className="font-medium">{market.symbol}</div>
                            <div className="text-xs text-muted-foreground">
                              Vol: {formatVolume(market.total_volume)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div>${formatPrice(market.current_price)}</div>
                          <div
                            className={cn(
                              'text-xs',
                              market.price_change_percentage_24h >= 0
                                ? 'text-green-500'
                                : 'text-red-500'
                            )}
                          >
                            {formatPriceChange(market.price_change_percentage_24h)}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </div>
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedMarketData && (
        <Card className="mt-2 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="text-xl font-semibold">
                ${formatPrice(selectedMarketData.current_price)}
              </div>
              <div
                className={cn(
                  'text-sm',
                  selectedMarketData.price_change_percentage_24h >= 0
                    ? 'text-green-500'
                    : 'text-red-500'
                )}
              >
                {formatPriceChange(selectedMarketData.price_change_percentage_24h)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">24h Volume</div>
              <div className="text-xl font-semibold">
                {formatVolume(selectedMarketData.total_volume)}
              </div>
              {selectedMarketData.market_cap && (
                <div className="text-sm text-muted-foreground">
                  MCap: {formatVolume(selectedMarketData.market_cap)}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
