'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TokenInput } from '@/components/swap/TokenInput';
import { SwapSettings } from '@/components/swap/SwapSettings';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/utils/errorHandling';
import { SOLANA_TOKENS, TokenInfo } from '@/config/tokens';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowDownIcon, ArrowUpDownIcon } from 'lucide-react';

function SwapContent() {
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState<TokenInfo>(SOLANA_TOKENS.SOL);
  const [toToken, setToToken] = useState<TokenInfo>(SOLANA_TOKENS.USDC);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [deadline, setDeadline] = useState(20); // 20 minutes default
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    try {
      setLoading(true);
      setError(null);

      // Implement swap logic here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: 'Swap successful',
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });

      // Reset form
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      const handledError = handleError(error);
      setError(handledError.message);
      toast({
        title: 'Swap failed',
        description: handledError.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFromAmountChange = (amount: string) => {
    setFromAmount(amount);
    if (amount) {
      const estimatedAmount = parseFloat(amount) * 2; // Mock price calculation
      setToAmount(estimatedAmount.toString());
    } else {
      setToAmount('');
    }
  };

  const handleToAmountChange = (amount: string) => {
    setToAmount(amount);
    if (amount) {
      const estimatedAmount = parseFloat(amount) / 2; // Mock price calculation
      setFromAmount(estimatedAmount.toString());
    } else {
      setFromAmount('');
    }
  };

  const handleSwitchTokens = () => {
    const tempFromToken = fromToken;
    const tempFromAmount = fromAmount;
    setFromToken(toToken);
    setFromAmount(toAmount);
    setToToken(tempFromToken);
    setToAmount(tempFromAmount);
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Swap</h2>
          <SwapSettings 
            slippage={slippage} 
            onSlippageChange={setSlippage}
            deadline={deadline}
            onDeadlineChange={setDeadline}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TokenInput
          label="From"
          token={fromToken}
          amount={fromAmount}
          balance="1000"
          onTokenSelect={setFromToken}
          onAmountChange={handleFromAmountChange}
        />

        <div className="relative h-[1px] bg-border my-8">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background"
            onClick={handleSwitchTokens}
          >
            <ArrowUpDownIcon className="h-4 w-4" />
          </Button>
        </div>

        <TokenInput
          label="To"
          token={toToken}
          amount={toAmount}
          balance="500"
          onTokenSelect={setToToken}
          onAmountChange={handleToAmountChange}
        />

        <Button
          className="w-full"
          disabled={!fromAmount || !toAmount || loading}
          onClick={handleSwap}
        >
          {loading ? 'Swapping...' : 'Swap'}
        </Button>
      </div>
    </Card>
  );
}

export default function SwapPage() {
  return (
    <PageLayout>
      <SwapContent />
    </PageLayout>
  );
}
