'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TradingViewWidget } from '../TradingViewWidget';
import { OrderBook } from './OrderBook';
import { TradeHistory } from './TradeHistory';
import { UserDashboard } from './UserDashboard'; // Import the UserDashboard component
import { WalletManager } from '../wallet/WalletManager';
import { OrderForm } from './OrderForm';
import { PositionsTable } from './PositionsTable';
import { MarketOverview } from './MarketOverview';
import { cn } from '@/lib/utils';

interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance?: string;
}

interface TradingPair {
  name: string;
  baseMint: string;
  quoteMint: string;
  baseDecimals: number;
  quoteDecimals: number;
  popularity?: number;
  fee?: number;
  source?: string;
}

interface TradingStats {
  price: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
}

export function TradingInterface({ selectedPair }: { selectedPair: TradingPair | null }) {
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [leverage, setLeverage] = useState(1);
  const [stats, setStats] = useState<TradingStats>({
    price: '0',
    change24h: '0',
    high24h: '0',
    low24h: '0',
    volume24h: '0'
  });

  if (!selectedPair) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <span className="text-muted-foreground">Select a trading pair to start trading</span>
        </div>
      </Card>
    );
  }

  const handlePriceClick = (price: number) => {
    if (orderType === 'limit') {
      setPrice(price.toString());
    }
  };

  const handleTrade = async () => {
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pairAddress: selectedPair.baseMint,
          amount,
          price: orderType === 'limit' ? price : undefined,
          orderType,
          side,
        }),
      });

      if (!response.ok) {
        throw new Error('Trade failed');
      }

      setAmount('');
      if (orderType === 'limit') {
        setPrice('');
      }
    } catch (error) {
      console.error('Trade error:', error);
    }
  };

  const formatNumber = (num: string | undefined, decimals: number = 2) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Number(num));
  };

  const handleSubmit = () => {
    // Handle order submission
    console.log('Order submitted');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <OrderForm
            type="futures"
            side={side}
            amount={amount}
            price={price}
            leverage={leverage}
            onTypeChange={(type) => console.log(type)}
            onSideChange={setSide}
            onAmountChange={setAmount}
            onPriceChange={setPrice}
            onLeverageChange={setLeverage}
            onSubmit={handleSubmit}
          />
        </div>
        <div className="col-span-9">
          <MarketOverview />
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Positions</h2>
            <PositionsTable />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Order Book</h2>
            <OrderBook
              pair={selectedPair.name}
              onPriceClick={handlePriceClick}
            />
          </Card>
        </div>
        <div className="col-span-6">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Trades</h2>
            <TradeHistory
              pair={selectedPair.name}
              onPriceClick={handlePriceClick}
            />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-4rem)]">
        {/* Market Stats */}
        <div className="col-span-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">
                  {selectedPair.name}
                </h2>
                <div className="text-sm text-muted-foreground">
                  24h Volume: {formatNumber(selectedPair.popularity?.toString())}
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-2xl font-bold">
                  {formatNumber(stats.price)}
                </div>
                <div className={cn(
                  "text-sm",
                  Number(stats.change24h) >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {formatNumber(stats.change24h)}%
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Wallet Section */}
        <div className="col-span-4">
          <WalletManager />
        </div>

        {/* Chart */}
        <div className="col-span-8 row-span-2 h-[500px]">
          <Card className="h-full">
            <TradingViewWidget
              pair={selectedPair.name}
              height="100%"
            />
          </Card>
        </div>

        {/* Trading Form */}
        <div className="col-span-8">
          <Card className="p-6">
            <Tabs defaultValue="spot" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="spot">Spot</TabsTrigger>
                <TabsTrigger value="margin">Margin</TabsTrigger>
              </TabsList>

              <TabsContent value="spot">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={side === 'buy' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSide('buy')}
                    >
                      Buy 
                    </Button>
                    <Button
                      variant={side === 'sell' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSide('sell')}
                    >
                      Sell 
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Order Type</span>
                    </div>
                    <select
                      className="w-full p-2 rounded-md border"
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value)}
                    >
                      <option value="market">Market</option>
                      <option value="limit">Limit</option>
                    </select>
                  </div>

                  {orderType === 'limit' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Price</span>
                        <span></span>
                      </div>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Amount</span>
                      <span></span>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Total</span>
                      <span>
                        {formatNumber(
                          String(
                            Number(amount) *
                            (orderType === 'limit' ? Number(price) : Number(stats.price))
                          )
                        )} 
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleTrade}
                    disabled={!amount || Number(amount) <= 0 || (orderType === 'limit' && (!price || Number(price) <= 0))}
                  >
                    {side === 'buy' ? 'Buy' : 'Sell'} 
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="margin">
                <div className="flex items-center justify-center h-40">
                  <span className="text-muted-foreground">Margin trading coming soon</span>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Trade History */}
        <div className="col-span-4">
          <TradeHistory
            pair={selectedPair.name}
            onPriceClick={handlePriceClick}
          />
        </div>

        {/* User Dashboard */}
        <div className="col-span-12">
          <UserDashboard />
        </div>
      </div>
    </div>
  );
}
