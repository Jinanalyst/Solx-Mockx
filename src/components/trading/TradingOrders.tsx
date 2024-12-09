'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Order {
  id: string;
  pair: string;
  type: string;
  direction: 'Long' | 'Short';
  orderValue: string;
  orderPrice: string;
  filled: string;
  tpsl?: string;
  time: string;
}

export function TradingOrders() {
  const [activeTab, setActiveTab] = useState('current');

  const mockCurrentOrders: Order[] = [
    {
      id: '1234567',
      pair: 'BTC/USDT',
      type: 'Limit',
      direction: 'Long',
      orderValue: '0.5 BTC',
      orderPrice: '43,250.00',
      filled: '0/0.5',
      tpsl: 'TP: 45,000 / SL: 42,000',
      time: '2024-03-19 14:30:25',
    },
  ];

  const mockOrderHistory: Order[] = [
    {
      id: '1234566',
      pair: 'BTC/USDT',
      type: 'Market',
      direction: 'Short',
      orderValue: '0.3 BTC',
      orderPrice: '43,150.00',
      filled: '0.3/0.3',
      time: '2024-03-19 14:25:10',
    },
    {
      id: '1234565',
      pair: 'BTC/USDT',
      type: 'Limit',
      direction: 'Long',
      orderValue: '0.2 BTC',
      orderPrice: '43,050.00',
      filled: '0.2/0.2',
      tpsl: 'TP: 44,000 / SL: 42,500',
      time: '2024-03-19 14:20:15',
    },
  ];

  return (
    <Card className="rounded-none border-0 bg-[#0b0e11]">
      <Tabs defaultValue="current" className="w-full">
        <div className="flex items-center justify-between px-4 border-b border-gray-800">
          <TabsList className="h-12 p-0 bg-transparent">
            <TabsTrigger
              value="current"
              className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
            >
              Current Orders (1)
            </TabsTrigger>
            <TabsTrigger
              value="tpsl"
              className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
            >
              TP/SL Order
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
            >
              Trade History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="current" className="m-0">
          <ScrollArea className="h-[200px]">
            <div className="w-full min-w-max">
              <div className="grid grid-cols-9 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800 bg-[#0b0e11]">
                <div>Spot Pairs</div>
                <div>Order Type</div>
                <div>Direction</div>
                <div>Order Value</div>
                <div>Order Price</div>
                <div>Filled/Order Quantity</div>
                <div>TP/SL</div>
                <div>Order Time</div>
                <div>Action</div>
              </div>
              {mockCurrentOrders.map((order) => (
                <div key={order.id} className="grid grid-cols-9 gap-4 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800/50">
                  <div>{order.pair}</div>
                  <div>{order.type}</div>
                  <div className={order.direction === 'Long' ? 'text-[#02c076]' : 'text-[#f84960]'}>
                    {order.direction}
                  </div>
                  <div>{order.orderValue}</div>
                  <div>{order.orderPrice}</div>
                  <div>{order.filled}</div>
                  <div>{order.tpsl}</div>
                  <div>{order.time}</div>
                  <div>
                    <button className="text-primary hover:text-primary/80">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tpsl" className="m-0">
          <ScrollArea className="h-[200px]">
            <div className="w-full min-w-max">
              <div className="grid grid-cols-9 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800 bg-[#0b0e11]">
                <div>Spot Pairs</div>
                <div>Order Type</div>
                <div>Direction</div>
                <div>Order Value</div>
                <div>Order Price</div>
                <div>Filled/Order Quantity</div>
                <div>TP/SL</div>
                <div>Order Time</div>
                <div>Action</div>
              </div>
              {mockCurrentOrders.filter(order => order.tpsl).map((order) => (
                <div key={order.id} className="grid grid-cols-9 gap-4 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800/50">
                  <div>{order.pair}</div>
                  <div>{order.type}</div>
                  <div className={order.direction === 'Long' ? 'text-[#02c076]' : 'text-[#f84960]'}>
                    {order.direction}
                  </div>
                  <div>{order.orderValue}</div>
                  <div>{order.orderPrice}</div>
                  <div>{order.filled}</div>
                  <div>{order.tpsl}</div>
                  <div>{order.time}</div>
                  <div>
                    <button className="text-primary hover:text-primary/80">Cancel</button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="m-0">
          <ScrollArea className="h-[200px]">
            <div className="w-full min-w-max">
              <div className="grid grid-cols-9 gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800 bg-[#0b0e11]">
                <div>Spot Pairs</div>
                <div>Order Type</div>
                <div>Direction</div>
                <div>Order Value</div>
                <div>Order Price</div>
                <div>Filled/Order Quantity</div>
                <div>TP/SL</div>
                <div>Order Time</div>
                <div>Status</div>
              </div>
              {mockOrderHistory.map((order) => (
                <div key={order.id} className="grid grid-cols-9 gap-4 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800/50">
                  <div>{order.pair}</div>
                  <div>{order.type}</div>
                  <div className={order.direction === 'Long' ? 'text-[#02c076]' : 'text-[#f84960]'}>
                    {order.direction}
                  </div>
                  <div>{order.orderValue}</div>
                  <div>{order.orderPrice}</div>
                  <div>{order.filled}</div>
                  <div>{order.tpsl || '-'}</div>
                  <div>{order.time}</div>
                  <div className="text-[#02c076]">Filled</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
