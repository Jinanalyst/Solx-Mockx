'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TokenInfo } from '@/config/tokens';
import { formatAmount, formatUSD, formatPercentage } from '../../utils/format';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ConfirmSwapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromToken: TokenInfo;
  toToken: TokenInfo;
  fromAmount: string;
  toAmount: string;
  price: number;
  priceImpact: number;
  minimumReceived: number;
  fee: number;
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmSwapModal({
  open,
  onOpenChange,
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  price,
  priceImpact,
  minimumReceived,
  fee,
  loading,
  onConfirm,
}: ConfirmSwapModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Swap</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {fromToken.logoURI && (
                <Image
                  src={fromToken.logoURI}
                  alt={fromToken.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>{formatAmount(fromAmount)} {fromToken.symbol}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            <div className="flex items-center gap-2">
              {toToken.logoURI && (
                <Image
                  src={toToken.logoURI}
                  alt={toToken.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>{formatAmount(toAmount)} {toToken.symbol}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Price</span>
              <span>
                1 {fromToken.symbol} = {formatAmount(price)} {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Minimum received</span>
              <span>
                {formatAmount(minimumReceived)} {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Price Impact</span>
              <span className={priceImpact > 2 ? 'text-destructive' : ''}>
                {formatPercentage(priceImpact)}%
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Network Fee</span>
              <span>{formatAmount(fee)} SOL</span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Confirm Swap'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
