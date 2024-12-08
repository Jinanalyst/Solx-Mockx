'use client';

import { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TOKENS } from '@/lib/constants';
import axios from 'axios';

interface TokenSwapProps {
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

export function TokenSwap({ pair }: TokenSwapProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [isLoading, setIsLoading] = useState(false);

  const handleTrade = async () => {
    if (!publicKey || !signTransaction || !amount || !pair.baseToken.address) {
      console.error('Missing required parameters for trade');
      return;
    }

    setIsLoading(true);
    try {
      const inputMint = side === 'buy' ? TOKENS.USDC.mint.toString() : pair.baseToken.address;
      const outputMint = side === 'buy' ? pair.baseToken.address : TOKENS.USDC.mint.toString();
      const inputAmount = Number(amount) * (10 ** (side === 'buy' ? TOKENS.USDC.decimals : 9));

      // Get quote from Jupiter API
      const quoteResponse = await axios.get('https://quote-api.jup.ag/v6/quote', {
        params: {
          inputMint,
          outputMint,
          amount: inputAmount.toString(),
          slippageBps: 50,
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
      
      console.log('Trade successful:', txid);
      setAmount('');
    } catch (error) {
      console.error('Error trading tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const orderTypes = [
    { label: 'Market', value: 'market' },
    { label: 'Limit', value: 'limit' },
  ];

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex gap-2">
          {orderTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setOrderType(type.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                orderType === type.value
                  ? 'bg-primary text-white'
                  : 'hover:bg-primary/10'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-6 grid grid-cols-2 gap-2">
          <button
            onClick={() => setSide('buy')}
            className={`rounded-lg py-3 text-center font-semibold ${
              side === 'buy'
                ? 'bg-green-500 text-white'
                : 'bg-green-500/10 text-green-500'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`rounded-lg py-3 text-center font-semibold ${
              side === 'sell'
                ? 'bg-red-500 text-white'
                : 'bg-red-500/10 text-red-500'
            }`}
          >
            Sell
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Amount {pair.baseToken.symbol}
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-background p-3 pr-20 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button className="text-sm text-primary hover:text-primary/80">
                  Max
                </button>
              </div>
            </div>
          </div>

          {orderType === 'limit' && (
            <div>
              <label className="mb-2 block text-sm text-muted-foreground">
                Limit Price USDT
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={pair.price || '0.00'}
              />
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 text-sm">
            <button className="rounded border border-border p-2 hover:bg-primary/5">25%</button>
            <button className="rounded border border-border p-2 hover:bg-primary/5">50%</button>
            <button className="rounded border border-border p-2 hover:bg-primary/5">75%</button>
            <button className="rounded border border-border p-2 hover:bg-primary/5">100%</button>
          </div>

          <div className="rounded-lg bg-background p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span>0.00 USDT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span>0.00 USDT</span>
            </div>
          </div>

          <button
            onClick={handleTrade}
            disabled={!publicKey || isLoading || !amount}
            className="mt-6 w-full rounded-lg bg-primary py-4 font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!publicKey ? 'Connect Wallet' : isLoading ? 'Trading...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${pair.baseToken.symbol}`}
          </button>
        </div>
      </div>
    </div>
  );
}
