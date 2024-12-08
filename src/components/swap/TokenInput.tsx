'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TokenSelector } from './TokenSelector';
import { TokenInfo } from '@/config/tokens';
import { formatNumber } from '@/utils/format';

interface TokenInputProps {
  token: TokenInfo;
  amount: string;
  balance?: string;
  label: string;
  onTokenSelect: (token: TokenInfo) => void;
  onAmountChange: (amount: string) => void;
}

export function TokenInput({
  token,
  amount,
  balance,
  label,
  onTokenSelect,
  onAmountChange,
}: TokenInputProps) {
  const [isSelectingToken, setIsSelectingToken] = useState(false);

  return (
    <div className="rounded-lg bg-card p-4 space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        {balance && (
          <span className="text-sm text-muted-foreground">
            Balance: {formatNumber(balance)} {token.symbol}
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
        />
        <Button
          variant="outline"
          className="min-w-[120px] flex items-center gap-2"
          onClick={() => setIsSelectingToken(true)}
        >
          {token.logoURI && (
            <img
              src={token.logoURI}
              alt={token.symbol}
              className="w-5 h-5 rounded-full"
            />
          )}
          {token.symbol}
        </Button>
      </div>
      <TokenSelector
        open={isSelectingToken}
        onOpenChange={setIsSelectingToken}
        onSelect={(token) => {
          onTokenSelect(token);
          setIsSelectingToken(false);
        }}
        selectedToken={token}
      />
    </div>
  );
}
