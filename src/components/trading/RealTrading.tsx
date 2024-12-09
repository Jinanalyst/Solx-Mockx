'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { TradePanel } from '@/components/trading/TradePanel';
import { useWallet } from '@/contexts/WalletContext';
import { TradingViewWidget } from '@/components/trading/TradingViewWidget';

interface TradingPair {
  name: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  volume24h: number;
  logoUrl: string;
}

const tradingPairs: TradingPair[] = [
  {
    name: 'BTC/USDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    price: 43250.25,
    change24h: 2.5,
    volume24h: 1234567,
    logoUrl: '/bitcoin.png'
  }
];

export function RealTrading() {
  const { connected, balances, connect, isLoadingBalances } = useWallet();
  const [selectedPair, setSelectedPair] = React.useState<TradingPair>(tradingPairs[0]);
  const [prices, setPrices] = React.useState<{ [key: string]: string }>({});

  // Get balances
  const usdtBalance = balances.find(b => b.symbol === 'USDT')?.balance || 0;
  const btcBalance = balances.find(b => b.symbol === 'BTC')?.balance || 0;

  return (
    <Card className="col-span-4 lg:col-span-3 h-full">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src={selectedPair.logoUrl}
                alt={selectedPair.name}
                className="w-8 h-8"
              />
              <div>
                <h3 className="font-semibold">{selectedPair.name}</h3>
                <p className="text-sm text-gray-500">
                  {prices[selectedPair.name] || selectedPair.price.toFixed(2)} USDT
                </p>
              </div>
            </div>
            <div className="text-sm">
              <p>
                24h Change:{' '}
                <span
                  className={
                    selectedPair.change24h >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }
                >
                  {selectedPair.change24h}%
                </span>
              </p>
              <p>24h Volume: {selectedPair.volume24h.toLocaleString()} USDT</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p>
                {selectedPair.baseAsset} Balance: {btcBalance.toFixed(8)}
              </p>
              <p>USDT Balance: {usdtBalance.toFixed(2)}</p>
            </div>
            {!connected && (
              <button
                onClick={connect}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                disabled={isLoadingBalances}
              >
                {isLoadingBalances ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
          {/* Chart Section */}
          <div className="col-span-8 h-full">
            <div className="h-full rounded-lg overflow-hidden">
              <TradingViewWidget symbol={`${selectedPair.baseAsset}${selectedPair.quoteAsset}`} />
            </div>
          </div>

          {/* Trade Panel Section */}
          <div className="col-span-4 h-full overflow-auto">
            <TradePanel
              symbol={selectedPair.name}
              baseAsset={selectedPair.baseAsset}
              quoteAsset={selectedPair.quoteAsset}
              baseBalance={btcBalance}
              quoteBalance={usdtBalance}
              isWalletConnected={connected}
              onConnectWallet={connect}
              isLoadingBalances={isLoadingBalances}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
