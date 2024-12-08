'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMockTrading } from '@/contexts/MockTradingContext';
import { OrderForm } from './OrderForm';
import { OrderBook } from './OrderBook';
import { RecentTrades } from './RecentTrades';
import { UserPositions } from './UserPositions';
import { UserBalances } from './UserBalances';
import { TradingViewWidget } from '../TradingViewWidget';

interface MockTradingDashboardProps {
  onError: (error: unknown) => void;
}

export function MockTradingDashboard({ onError }: MockTradingDashboardProps) {
  const { selectedMarket } = useMockTrading();
  const [activeTab, setActiveTab] = useState('spot');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [leverage, setLeverage] = useState(1);

  const handleSubmit = () => {
    // Handle order submission
    console.log('Order submitted');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-12 gap-4">
        {/* Chart */}
        <Card className="col-span-12 lg:col-span-8 p-4">
          <TradingViewWidget pair={selectedMarket} />
        </Card>

        {/* Order Form */}
        <Card className="col-span-12 lg:col-span-4 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="spot" className="flex-1">Spot</TabsTrigger>
              <TabsTrigger value="margin" className="flex-1">Margin</TabsTrigger>
            </TabsList>
            <TabsContent value="spot">
              <OrderForm
                type="spot"
                side={side}
                amount={amount}
                price={price}
                leverage={leverage}
                onTypeChange={type => setActiveTab(type)}
                onSideChange={setSide}
                onAmountChange={setAmount}
                onPriceChange={setPrice}
                onLeverageChange={setLeverage}
                onSubmit={handleSubmit}
              />
            </TabsContent>
            <TabsContent value="margin">
              <OrderForm
                type="margin"
                side={side}
                amount={amount}
                price={price}
                leverage={leverage}
                onTypeChange={type => setActiveTab(type)}
                onSideChange={setSide}
                onAmountChange={setAmount}
                onPriceChange={setPrice}
                onLeverageChange={setLeverage}
                onSubmit={handleSubmit}
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Order Book */}
        <Card className="col-span-12 lg:col-span-3 p-4">
          <OrderBook pair={selectedMarket} />
        </Card>

        {/* Recent Trades */}
        <Card className="col-span-12 lg:col-span-5 p-4">
          <RecentTrades />
        </Card>

        {/* User Info */}
        <Card className="col-span-12 lg:col-span-4 p-4">
          <Tabs defaultValue="positions">
            <TabsList className="w-full">
              <TabsTrigger value="positions" className="flex-1">Positions</TabsTrigger>
              <TabsTrigger value="balances" className="flex-1">Balances</TabsTrigger>
            </TabsList>
            <TabsContent value="positions">
              <UserPositions />
            </TabsContent>
            <TabsContent value="balances">
              <UserBalances />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
