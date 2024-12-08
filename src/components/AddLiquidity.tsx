'use client';

import { useState } from 'react';
import { Settings, Info } from 'lucide-react';
import Link from 'next/link';

interface TokenBalance {
  symbol: string;
  icon: string;
  balance: string;
}

interface AddLiquidityProps {
  poolId: string;
  token1: TokenBalance;
  token2: TokenBalance;
  exchangeRate: string;
  poolShare: string;
}

export function AddLiquidity({
  poolId,
  token1,
  token2,
  exchangeRate,
  poolShare,
}: AddLiquidityProps) {
  const [amount1, setAmount1] = useState('');
  const [amount2, setAmount2] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSettings, setShowSettings] = useState(false);

  const handleAmount1Change = (value: string) => {
    setAmount1(value);
    // Calculate token2 amount based on exchange rate
    const calculatedAmount2 = value ? (parseFloat(value) * parseFloat(exchangeRate)).toString() : '';
    setAmount2(calculatedAmount2);
  };

  const handleAmount2Change = (value: string) => {
    setAmount2(value);
    // Calculate token1 amount based on exchange rate
    const calculatedAmount1 = value ? (parseFloat(value) / parseFloat(exchangeRate)).toString() : '';
    setAmount1(calculatedAmount1);
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/pools"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Pools
        </Link>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-lg p-2 hover:bg-muted"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-6 rounded-lg border border-border p-4">
          <h3 className="mb-4 font-medium">Transaction Settings</h3>
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">
              Slippage Tolerance
            </label>
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`rounded-lg px-3 py-1 text-sm ${
                    slippage === value
                      ? 'bg-primary text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {value}%
                </button>
              ))}
              <input
                type="number"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-20 rounded-lg border border-border bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Custom"
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-lg font-medium">Add Liquidity</h2>

        {/* Token 1 Input */}
        <div className="mb-4 rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Input</span>
            <span className="text-sm text-muted-foreground">
              Balance: {token1.balance}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={token1.icon}
                alt={token1.symbol}
                className="h-6 w-6 rounded-full"
              />
              <span className="font-medium">{token1.symbol}</span>
            </div>
            <input
              type="number"
              value={amount1}
              onChange={(e) => handleAmount1Change(e.target.value)}
              className="flex-1 bg-transparent text-right text-xl focus:outline-none"
              placeholder="0.0"
            />
          </div>
          <button className="mt-2 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20">
            MAX
          </button>
        </div>

        <div className="mb-4 flex justify-center">
          <div className="rounded-full border border-border p-2">
            <span className="text-xl">+</span>
          </div>
        </div>

        {/* Token 2 Input */}
        <div className="mb-4 rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Input</span>
            <span className="text-sm text-muted-foreground">
              Balance: {token2.balance}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={token2.icon}
                alt={token2.symbol}
                className="h-6 w-6 rounded-full"
              />
              <span className="font-medium">{token2.symbol}</span>
            </div>
            <input
              type="number"
              value={amount2}
              onChange={(e) => handleAmount2Change(e.target.value)}
              className="flex-1 bg-transparent text-right text-xl focus:outline-none"
              placeholder="0.0"
            />
          </div>
          <button className="mt-2 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20">
            MAX
          </button>
        </div>

        {/* Pool Information */}
        <div className="mb-4 space-y-2 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Exchange Rate</span>
            <span>
              1 {token1.symbol} = {exchangeRate} {token2.symbol}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Pool Share</span>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <span>{poolShare}%</span>
          </div>
        </div>

        <button className="w-full rounded-lg bg-primary py-3 text-center font-medium text-white hover:bg-primary/90">
          Add Liquidity
        </button>
      </div>
    </div>
  );
}
