'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenInfo } from '@solana/spl-token-registry';
import { formatAmount, formatUSD } from '../../utils/format';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface SolanaTokenInputProps {
  token: TokenInfo | null;
  amount: string;
  balance?: string;
  label: string;
  tokens: TokenInfo[];
  disabled?: boolean;
  readOnly?: boolean;
  onTokenSelect: (token: TokenInfo) => void;
  onAmountChange: (amount: string) => void;
}

export function SolanaTokenInput({
  token,
  amount,
  balance,
  label,
  tokens,
  disabled,
  readOnly,
  onTokenSelect,
  onAmountChange,
}: SolanaTokenInputProps) {
  const [isSelectingToken, setIsSelectingToken] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTokens = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase() === search.toLowerCase()
  );

  return (
    <div className="rounded-lg bg-card p-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        {balance && (
          <span className="text-sm text-muted-foreground">
            Balance: {formatAmount(balance)} {token?.symbol}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="flex-1"
          placeholder="0.0"
          disabled={disabled}
          readOnly={readOnly}
        />
        <Button
          variant="outline"
          className="min-w-[140px] flex items-center gap-2"
          onClick={() => setIsSelectingToken(true)}
          disabled={disabled}
        >
          {token ? (
            <>
              {token.logoURI && (
                <Image
                  src={token.logoURI}
                  alt={token.symbol}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              )}
              {token.symbol}
            </>
          ) : (
            'Select Token'
          )}
        </Button>
      </div>

      <Dialog open={isSelectingToken} onOpenChange={setIsSelectingToken}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select a token</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or paste address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-[300px] mt-4">
            <div className="space-y-2">
              {filteredTokens.map((t) => (
                <button
                  key={t.address}
                  onClick={() => {
                    onTokenSelect(t);
                    setIsSelectingToken(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent"
                >
                  {t.logoURI && (
                    <Image
                      src={t.logoURI}
                      alt={t.symbol}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-medium">{t.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
