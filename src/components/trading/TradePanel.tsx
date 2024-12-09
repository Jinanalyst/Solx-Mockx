'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderBook } from './OrderBook';

export function TradePanel({ symbol = 'BTC/USDT' }: { symbol?: string }) {
  const [activeTab, setActiveTab] = useState("limit");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div className="flex flex-col h-full">
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
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="w-full bg-[#0ecb81] hover:bg-[#0ecb81]/90">Buy</Button>
                <Button className="w-full bg-[#f6465d] hover:bg-[#f6465d]/90">Sell</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="market">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button className="w-full bg-[#0ecb81] hover:bg-[#0ecb81]/90">Buy Market</Button>
                <Button className="w-full bg-[#f6465d] hover:bg-[#f6465d]/90">Sell Market</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* OrderBook */}
      <div className="flex-1 min-h-0 overflow-auto">
        <OrderBook symbol={symbol} />
      </div>
    </div>
  );
}
