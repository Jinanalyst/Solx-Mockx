'use client';

import { useState, useEffect } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TOKENS } from '@/lib/constants';
import axios from 'axios';

interface SwapFormProps {
  pair: {
    label: string;
    value: string;
    price: string;
    baseToken: {
      address: string;
      symbol: string;
    }
  };
}

export function SwapForm({ pair }: SwapFormProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapReversed, setIsSwapReversed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequestId, setLastRequestId] = useState<number>(0);

  const validateSlippage = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0 && num <= 100;
  };

  useEffect(() => {
    const requestId = lastRequestId + 1;
    setLastRequestId(requestId);

    const computeToAmount = async () => {
      if (!fromAmount || !pair.baseToken.address) {
        setToAmount('');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const inputMint = isSwapReversed ? pair.baseToken.address : TOKENS.USDC.mint.toString();
        const outputMint = isSwapReversed ? TOKENS.USDC.mint.toString() : pair.baseToken.address;
        const inputAmount = Number(fromAmount) * (10 ** (isSwapReversed ? 9 : TOKENS.USDC.decimals));

        if (isNaN(inputAmount)) {
          throw new Error('Invalid input amount');
        }

        const slippageValue = parseFloat(slippage);
        if (!validateSlippage(slippage)) {
          throw new Error('Invalid slippage value (0-100%)');
        }

        const quoteResponse = await axios.get('https://quote-api.jup.ag/v6/quote', {
          params: {
            inputMint,
            outputMint,
            amount: inputAmount.toString(),
            slippageBps: slippageValue * 100,
          },
        });

        // Check if this is still the latest request
        if (requestId !== lastRequestId) return;

        if (quoteResponse.data?.quoteResponse) {
          const outAmount = Number(quoteResponse.data.quoteResponse.outAmount) / (10 ** (isSwapReversed ? TOKENS.USDC.decimals : 9));
          setToAmount(outAmount.toFixed(6));
        } else {
          throw new Error('Invalid quote response');
        }
      } catch (err) {
        // Only set error if this is still the latest request
        if (requestId === lastRequestId) {
          setError(err instanceof Error ? err.message : 'Failed to compute swap amount');
          setToAmount('');
        }
      } finally {
        // Only update loading state if this is still the latest request
        if (requestId === lastRequestId) {
          setIsLoading(false);
        }
      }
    };

    computeToAmount();
  }, [fromAmount, pair.baseToken.address, isSwapReversed, slippage]);

  const handleSlippageChange = (value: string) => {
    if (value === '' || validateSlippage(value)) {
      setSlippage(value);
    }
  };

  const handleSwap = async () => {
    if (!publicKey || !signTransaction || !fromAmount || !pair.baseToken.address) {
      console.error('Missing required parameters for swap');
      return;
    }

    setIsLoading(true);
    try {
      const inputMint = isSwapReversed ? pair.baseToken.address : TOKENS.USDC.mint.toString();
      const outputMint = isSwapReversed ? TOKENS.USDC.mint.toString() : pair.baseToken.address;
      const inputAmount = Number(fromAmount) * (10 ** (isSwapReversed ? 9 : TOKENS.USDC.decimals));

      // Get quote from Jupiter API
      const quoteResponse = await axios.get('https://quote-api.jup.ag/v6/quote', {
        params: {
          inputMint,
          outputMint,
          amount: inputAmount.toString(),
          slippageBps: Number(slippage) * 100,
        },
      });

      if (!quoteResponse.data || !quoteResponse.data.quoteResponse) {
        throw new Error('No quote available');
      }

      // Get serialized transactions from Jupiter API
      const { swapTransaction } = await axios.post('https://quote-api.jup.ag/v6/swap', {
        quoteResponse: quoteResponse.data.quoteResponse,
        userPublicKey: publicKey.toString(),
        wrapAndUnwrapSol: true,
      }).then(response => response.data);

      // Deserialize and sign the transaction
      const transaction = Transaction.from(Buffer.from(swapTransaction, 'base64'));
      const signed = await signTransaction(transaction);
      
      // Send the transaction
      const txid = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(txid);
      
      console.log('Swap successful:', txid);
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      console.error('Error swapping tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const slippageOptions = [
    { label: '0.5%', value: '0.5' },
    { label: '1.0%', value: '1.0' },
    { label: '2.0%', value: '2.0' },
  ];

  const handleSwapDirection = () => {
    setIsSwapReversed(!isSwapReversed);
    setFromAmount('');
    setToAmount('');
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-medium">Swap Tokens</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Trade tokens instantly with minimal slippage
        </p>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">From</label>
            <div className="relative">
              <input
                type="text"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-3 pr-24 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button className="text-sm text-primary hover:text-primary/80">
                  Max
                </button>
                <span className="font-medium">
                  {isSwapReversed ? pair.baseToken.symbol : 'USDC'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleSwapDirection}
              className="rounded-full bg-background p-2 hover:bg-muted"
            >
              <ArrowDownUp className="h-5 w-5" />
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">To</label>
            <div className="relative">
              <input
                type="text"
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-3 pr-24 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="font-medium">
                  {isSwapReversed ? 'USDC' : pair.baseToken.symbol}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Slippage Tolerance (%)
            </label>
            <input
              type="number"
              value={slippage}
              onChange={(e) => handleSlippageChange(e.target.value)}
              className="w-20 mt-1 px-2 py-1 text-sm bg-background border border-input rounded-md"
              min="0"
              max="100"
              step="0.1"
            />
            {parseFloat(slippage) > 5 && (
              <p className="mt-1 text-sm text-yellow-500">
                High slippage tolerance. Your transaction may be frontrun.
              </p>
            )}
          </div>

          {error && (
            <div className="mt-2 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="rounded-lg bg-background p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Rate</span>
              <span>1 {isSwapReversed ? pair.baseToken.symbol : 'USDC'} = {pair.price} {isSwapReversed ? 'USDC' : pair.baseToken.symbol}</span>
            </div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Price Impact</span>
              <span className="text-green-500">{'<'}0.01%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Minimum received</span>
              <span>0.00 {isSwapReversed ? 'USDC' : pair.baseToken.symbol}</span>
            </div>
          </div>

          <button 
            onClick={handleSwap}
            disabled={!publicKey || isLoading || !fromAmount}
            className="w-full rounded-lg bg-primary py-4 font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!publicKey ? 'Connect Wallet' : isLoading ? 'Swapping...' : 'Swap Tokens'}
          </button>
        </div>
      </div>
    </div>
  );
}
