'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SolanaTokenInput } from '@/components/swap/SolanaTokenInput';
import { ConfirmSwapModal } from '@/components/swap/ConfirmSwapModal';
import { RecentTransactions } from '@/components/swap/RecentTransactions';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/utils/errorHandling';
import { TokenInfo } from '@solana/spl-token-registry';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowUpDownIcon, Wallet } from 'lucide-react';
import { getTokenList, getSwapQuote, SwapQuote } from '@/utils/solana';
import { useWallet } from '@solana/wallet-adapter-react';

function SwapContent() {
  const { toast } = useToast();
  const { connected, connect, publicKey } = useWallet();
  
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  // Load token list
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const tokenList = await getTokenList();
        setTokens(tokenList);
      } catch (error) {
        const handledError = handleError(error, 'Token List');
        toast({
          title: 'Failed to load tokens',
          description: handledError.message,
          variant: 'destructive',
        });
      }
    };
    loadTokens();
  }, [toast]);

  // Get quote when amount or tokens change
  useEffect(() => {
    const getQuote = async () => {
      if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
        try {
          const newQuote = await getSwapQuote(
            fromToken,
            toToken,
            parseFloat(fromAmount)
          );
          setQuote(newQuote);
          setToAmount(newQuote.outputAmount.toString());
        } catch (error) {
          const handledError = handleError(error, 'Price Quote');
          toast({
            title: 'Failed to get price quote',
            description: handledError.message,
            variant: 'destructive',
          });
        }
      } else {
        setQuote(null);
        setToAmount('');
      }
    };
    getQuote();
  }, [fromToken, toToken, fromAmount, toast]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setFromAmount(toAmount);
    setToToken(tempToken);
    setToAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (!connected) {
      await connect();
      return;
    }

    try {
      setLoading(true);
      // In a real implementation, this would:
      // 1. Create and send the swap transaction
      // 2. Wait for confirmation
      // 3. Update balances
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTx = {
        hash: '3xM9Z...7Yp2',
        fromToken: fromToken?.symbol,
        toToken: toToken?.symbol,
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        timestamp: new Date(),
      };
      
      setRecentTransactions([mockTx, ...recentTransactions]);
      
      toast({
        title: 'Swap Successful',
        description: `Swapped ${fromAmount} ${fromToken?.symbol} for ${toAmount} ${toToken?.symbol}`,
      });
      
      setFromAmount('');
      setToAmount('');
      setConfirmOpen(false);
    } catch (error) {
      const handledError = handleError(error, 'Swap');
      toast({
        title: 'Swap Failed',
        description: handledError.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Solana Swap</h1>
          {!connected && (
            <Button onClick={() => connect()} variant="outline">
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <SolanaTokenInput
            label="From"
            token={fromToken}
            amount={fromAmount}
            tokens={tokens}
            onTokenSelect={setFromToken}
            onAmountChange={setFromAmount}
          />
          
          <div className="flex justify-center -my-3 z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-background"
              onClick={handleSwapTokens}
            >
              <ArrowUpDownIcon className="h-4 w-4" />
            </Button>
          </div>

          <SolanaTokenInput
            label="To"
            token={toToken}
            amount={toAmount}
            tokens={tokens}
            onTokenSelect={setToToken}
            onAmountChange={setToAmount}
            readOnly
          />
        </div>

        {quote && quote.priceImpact > 2 && (
          <Alert variant="destructive">
            <AlertDescription>
              High price impact! Your trade will move the market price by {quote.priceImpact.toFixed(2)}%
            </AlertDescription>
          </Alert>
        )}

        {quote && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Rate</span>
              <span>
                1 {fromToken?.symbol} = {quote.price.toFixed(6)} {toToken?.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Network Fee</span>
              <span>{quote.fee.toFixed(6)} SOL</span>
            </div>
            <div className="flex justify-between">
              <span>Minimum Received</span>
              <span>
                {quote.minimumReceived.toFixed(6)} {toToken?.symbol}
              </span>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          disabled={!fromAmount || !toAmount || loading || !fromToken || !toToken}
          onClick={() => setConfirmOpen(true)}
        >
          {!connected ? 'Connect Wallet' : 'Review Swap'}
        </Button>
      </Card>

      {recentTransactions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <RecentTransactions transactions={recentTransactions} />
        </div>
      )}

      {quote && (
        <ConfirmSwapModal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          fromToken={fromToken!}
          toToken={toToken!}
          fromAmount={fromAmount}
          toAmount={toAmount}
          price={quote.price}
          priceImpact={quote.priceImpact}
          minimumReceived={quote.minimumReceived}
          fee={quote.fee}
          loading={loading}
          onConfirm={handleSwap}
        />
      )}
    </div>
  );
}

export default function SolanaSwapPage() {
  return (
    <PageLayout>
      <SwapContent />
    </PageLayout>
  );
}
