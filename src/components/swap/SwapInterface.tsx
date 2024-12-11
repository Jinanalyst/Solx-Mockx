'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowDownIcon, ArrowUpDownIcon, Settings2 } from 'lucide-react';
import { WalletButton } from '../solana/WalletButton';
import { useWallet } from '@solana/wallet-adapter-react';
import { TokenService, TokenInfo } from '@/services/token.service';

interface SwapInterfaceProps {
  onError?: (error: unknown) => void;
}

export function SwapInterface({ onError }: SwapInterfaceProps) {
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
  const [toToken, setToToken] = useState<TokenInfo | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Initialize TokenService
  const tokenService = new TokenService();

  // Fetch token data when wallet connects
  useEffect(() => {
    if (!publicKey) {
      onError('Please connect your wallet');
      return;
    }

    const fetchTokenData = async () => {
      try {
        setLoading(true);
        const tokenData = await tokenService.getTokenData(publicKey.toString());
        setTokens(tokenData);
        
        // Set default tokens
        if (tokenData.length >= 2) {
          setFromToken(tokenData[0]);
          setToToken(tokenData[1]);
        }
      } catch (error) {
        console.error('Error fetching token data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load token data. Please try again later.',
          variant: 'destructive',
        });
        if (onError) onError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [publicKey, tokenService, onError, toast]);

  // Calculate conversion rate
  const getConversionRate = (from: TokenInfo, to: TokenInfo) => {
    return (from.price / to.price).toFixed(6);
  };

  // Update amounts based on conversion rate
  useEffect(() => {
    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      if (fromToken && toToken) {
        const rate = fromToken.price / toToken.price;
        setToAmount((parseFloat(fromAmount) * rate).toFixed(6));
      }
    }
  }, [fromAmount, fromToken, toToken]);

  const handleFromAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
      if (value === '') {
        setToAmount('');
      }
    }
  };

  const handleToAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setToAmount(value);
      if (value !== '') {
        if (toToken && fromToken) {
          const rate = toToken.price / fromToken.price;
          setFromAmount((parseFloat(value) * rate).toFixed(6));
        }
      } else {
        setFromAmount('');
      }
    }
  };

  const handleSwapTokens = () => {
    if (fromToken && toToken) {
      const tempToken = fromToken;
      const tempAmount = fromAmount;
      setFromToken(toToken);
      setFromAmount(toAmount);
      setToToken(tempToken);
      setToAmount(tempAmount);
    }
  };

  const handleSwap = async () => {
    try {
      setLoading(true);
      // Implement actual swap logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

      toast({
        title: 'Swap Successful',
        description: `Swapped ${fromAmount} ${fromToken?.symbol} for ${toAmount} ${toToken?.symbol}`,
      });

      // Reset form
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      {/* Wallet Connection */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Connected Wallet</h2>
          <WalletButton />
        </div>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      {!publicKey ? (
        <Alert>
          <AlertDescription>
            Please connect your wallet to start trading
          </AlertDescription>
        </Alert>
      ) : loading ? (
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-md"></span>
          <p className="mt-2 text-sm text-muted-foreground">Loading token data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>From</Label>
              {fromToken && (
                <span className="text-sm text-muted-foreground">
                  Balance: {fromToken.balance} {fromToken.symbol}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="text-lg"
                />
              </div>
              <Select
                value={fromToken?.symbol}
                onValueChange={(value) => setFromToken(tokens.find(t => t.symbol === value) || null)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="relative h-[1px] bg-border">
            <Button
              variant="outline"
              size="icon"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background"
              onClick={handleSwapTokens}
              disabled={!fromToken || !toToken}
            >
              <ArrowUpDownIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>To</Label>
              {toToken && (
                <span className="text-sm text-muted-foreground">
                  Balance: {toToken.balance} {toToken.symbol}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  value={toAmount}
                  onChange={(e) => handleToAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="text-lg"
                />
              </div>
              <Select
                value={toToken?.symbol}
                onValueChange={(value) => setToToken(tokens.find(t => t.symbol === value) || null)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conversion Rate */}
          {fromToken && toToken && (
            <div className="text-sm text-muted-foreground text-center">
              1 {fromToken.symbol} = {getConversionRate(fromToken, toToken)} {toToken.symbol}
            </div>
          )}

          {/* Swap Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!fromToken || !toToken || !fromAmount || !toAmount || loading}
            onClick={handleSwap}
          >
            {loading ? 'Converting...' : 'Preview Conversion'}
          </Button>
        </div>
      )}
    </Card>
  );
}
