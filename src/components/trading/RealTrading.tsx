'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { useWallet } from '@/contexts/WalletContext';

interface TradingPair {
  name: string;
  protocol: 'Raydium' | 'Jupiter';
  baseToken: string;
  quoteToken: string;
  price: string;
  change24h: number;
  volume24h: string;
  logoUrl: string;
}

const tradingPairs: TradingPair[] = [
  {
    name: 'BTC/USDT',
    protocol: 'Jupiter',
    baseToken: 'BTC',
    quoteToken: 'USDT',
    price: '99,447.98',
    change24h: -0.08,
    volume24h: '1.97B',
    logoUrl: '/images/tokens/btc.png'
  },
  {
    name: 'ETH/USDT',
    protocol: 'Jupiter',
    baseToken: 'ETH',
    quoteToken: 'USDT',
    price: '3,905.86',
    change24h: -1.76,
    volume24h: '652.77M',
    logoUrl: '/images/tokens/eth.png'
  },
  {
    name: 'SOL/USDT',
    protocol: 'Raydium',
    baseToken: 'SOL',
    quoteToken: 'USDT',
    price: '230.58',
    change24h: -2.84,
    volume24h: '188.19M',
    logoUrl: '/images/tokens/sol.png'
  }
];

export function RealTrading() {
  const { connected, balances, connect, isLoadingBalances } = useWallet();
  const [selectedPair, setSelectedPair] = React.useState<TradingPair>(tradingPairs[0]);
  const [prices, setPrices] = React.useState<{ [key: string]: string }>({});

  // Get USDT balance from wallet
  const usdtBalance = balances.find(b => b.symbol === 'USDT')?.balance || 0;

  // Simulate real-time price updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices: { [key: string]: string } = {};
        tradingPairs.forEach(pair => {
          const currentPrice = parseFloat(pair.price);
          const randomChange = (Math.random() - 0.5) * 0.001 * currentPrice;
          newPrices[pair.name] = (currentPrice + randomChange).toFixed(
            currentPrice > 100 ? 2 : currentPrice > 1 ? 4 : 6
          );
        });
        return newPrices;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="col-span-4 lg:col-span-3">
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center justify-between border-b">
          <div className="flex items-center space-x-4">
            <select
              className="bg-background text-foreground px-2 py-1 rounded-md border"
              value={selectedPair.name}
              onChange={(e) => {
                const pair = tradingPairs.find(p => p.name === e.target.value);
                if (pair) setSelectedPair(pair);
              }}
            >
              {tradingPairs.map((pair) => (
                <option key={pair.name} value={pair.name}>
                  {pair.name}
                </option>
              ))}
            </select>
            {!connected ? (
              <button
                onClick={connect}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Balance:</span>
                <span className="font-medium">
                  {isLoadingBalances ? (
                    "Loading..."
                  ) : (
                    `${usdtBalance.toFixed(2)} USDT`
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold">
              ${prices[selectedPair.name] || selectedPair.price}
            </span>
            <span className={`${selectedPair.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
