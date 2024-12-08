'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TokenInfo, SOLANA_TOKENS } from '@/config/tokens';
import { useState } from 'react';

interface TokenSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (token: TokenInfo) => void;
  selectedToken?: TokenInfo;
}

export function TokenSelector({
  open,
  onOpenChange,
  onSelect,
  selectedToken,
}: TokenSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = Object.values(SOLANA_TOKENS).filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Token</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search by name or symbol"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <ScrollArea className="h-[300px]">
          <div className="space-y-1">
            {filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => onSelect(token)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent ${
                  selectedToken?.address === token.address
                    ? 'bg-accent'
                    : ''
                }`}
              >
                {token.logoURI && (
                  <img
                    src={token.logoURI}
                    alt={token.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex flex-col items-start">
                  <span className="font-medium">{token.symbol}</span>
                  <span className="text-sm text-muted-foreground">
                    {token.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
