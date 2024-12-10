'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderBook } from './OrderBook';
import { cn } from "@/lib/utils";

interface TradePanelProps {
  symbol?: string;
  baseAsset?: string;
  quoteAsset?: string;
  baseBalance?: number;
  quoteBalance?: number;
  isWalletConnected?: boolean;
  onConnectWallet?: () => Promise<void>;
  isLoadingBalances?: boolean;
  className?: string;
}

export function TradePanel({
  symbol = 'BTC/USDT',
  baseAsset = 'BTC',
  quoteAsset = 'USDT',
  baseBalance = 0,
  quoteBalance = 0,
  isWalletConnected = false,
  onConnectWallet,
  isLoadingBalances = false,
  className,
}: TradePanelProps) {
  const [activeTab, setActiveTab] = useState("limit");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');

  const handleSubmit = async () => {
    try {
      if (!isWalletConnected) {
        await onConnectWallet?.();
        return;
      }

      if (!amount || (activeTab === 'limit' && !price)) {
        throw new Error('Please enter all required fields');
      }

      const parsedAmount = parseFloat(amount);
      const parsedPrice = activeTab === 'limit' ? parseFloat(price) : undefined;

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Invalid amount');
      }

      if (parsedPrice !== undefined && (isNaN(parsedPrice) || parsedPrice <= 0)) {
        throw new Error('Invalid price');
      }

      // TODO: Implement order submission
      console.log('Submitting order:', {
        symbol,
        type: activeTab,
        side: orderSide,
        amount: parsedAmount,
        price: parsedPrice,
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      // You might want to add a toast notification here
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Trading form */}
      <div className="p-4 border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="limit">Limit</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
          </TabsList>

          <TabsContent value="limit">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium">Price</label>
                  {!isLoadingBalances && (
                    <span className="text-sm text-muted-foreground">
                      Balance: {quoteBalance.toFixed(4)} {quoteAsset}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={`Enter price in ${quoteAsset}`}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium">Amount</label>
                  {!isLoadingBalances && (
                    <span className="text-sm text-muted-foreground">
                      Balance: {baseBalance.toFixed(4)} {baseAsset}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter amount in ${baseAsset}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="w-full bg-[#0ecb81] hover:bg-[#0ecb81]/90"
                  onClick={() => {
                    setOrderSide('buy');
                    handleSubmit();
                  }}
                >
                  {isWalletConnected ? 'Buy' : 'Connect Wallet'}
                </Button>
                <Button
                  className="w-full bg-[#f6465d] hover:bg-[#f6465d]/90"
                  onClick={() => {
                    setOrderSide('sell');
                    handleSubmit();
                  }}
                  disabled={!isWalletConnected}
                >
                  Sell
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="market">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium">Amount</label>
                  {!isLoadingBalances && (
                    <span className="text-sm text-muted-foreground">
                      Balance: {baseBalance.toFixed(4)} {baseAsset}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Enter amount in ${baseAsset}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="w-full bg-[#0ecb81] hover:bg-[#0ecb81]/90"
                  onClick={() => {
                    setOrderSide('buy');
                    handleSubmit();
                  }}
                >
                  {isWalletConnected ? 'Buy Market' : 'Connect Wallet'}
                </Button>
                <Button
                  className="w-full bg-[#f6465d] hover:bg-[#f6465d]/90"
                  onClick={() => {
                    setOrderSide('sell');
                    handleSubmit();
                  }}
                  disabled={!isWalletConnected}
                >
                  Sell Market
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Book */}
      <div className="flex-1 overflow-auto">
        <OrderBook symbol={symbol} />
      </div>
    </div>
  );
}
