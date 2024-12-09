'use client';

import { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { DEFAULT_TRADING_PAIRS } from '@/utils/tradingView';

interface TradePairSelectorProps {
  selectedPair: string;
  onPairSelect: (pair: string) => void;
  showFullMarketData?: boolean;
}

export function TradePairSelector({ 
  selectedPair, 
  onPairSelect,
  showFullMarketData = false 
}: TradePairSelectorProps) {
  const [open, setOpen] = useState(false);

  if (showFullMarketData) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              className="pl-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 divide-y">
            <div className="p-8 text-center text-muted-foreground">Loading markets...</div>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between min-w-[200px]"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold">{selectedPair}</span>
          </div>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search trading pair..." />
          <CommandEmpty>No trading pair found.</CommandEmpty>
          <CommandGroup heading="Popular Pairs">
            {DEFAULT_TRADING_PAIRS.map((pair) => {
              const pairString = `${pair.base}/${pair.quote}`;
              return (
                <CommandItem
                  key={pairString}
                  value={pairString}
                  onSelect={() => {
                    onPairSelect(pairString);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pair.base}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-muted-foreground">{pair.quote}</span>
                    </div>
                    {selectedPair === pairString && (
                      <CheckIcon className="h-4 w-4" />
                    )}
                  </div>
                  {pair.description && (
                    <span className="text-sm text-muted-foreground ml-2">
                      {pair.description}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
