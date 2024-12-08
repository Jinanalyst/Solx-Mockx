'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMarketData } from '@/contexts/MarketDataContext';
import { cn } from '@/lib/utils';

interface Market {
  pair: string;
  lastPrice: number;
  priceChange24h: number;
  volume24h: number;
}

type SortKey = keyof Omit<Market, 'pair'>;

interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

export function MarketOverview() {
  const { marketData } = useMarketData();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'volume24h',
    direction: 'desc',
  });

  const markets: Market[] = Object.entries(marketData).map(([pair, data]) => ({
    pair,
    lastPrice: data.current_price || 0,
    priceChange24h: data.price_change_24h || 0,
    volume24h: data.total_volume || 0,
  }));

  const sortedMarkets = [...markets].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const topGainers = [...markets]
    .sort((a, b) => b.priceChange24h - a.priceChange24h)
    .slice(0, 5);

  const topLosers = [...markets]
    .sort((a, b) => a.priceChange24h - b.priceChange24h)
    .slice(0, 5);

  const volumeLeaders = [...markets]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 5);

  return (
    <Card className="w-full">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Markets</TabsTrigger>
          <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
          <TabsTrigger value="losers">Top Losers</TabsTrigger>
          <TabsTrigger value="volume">Volume Leaders</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[400px] w-full">
          <TabsContent value="all" className="w-full">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Pair</th>
                  <th
                    className="text-right p-2 cursor-pointer"
                    onClick={() => handleSort('lastPrice')}
                  >
                    Last Price
                  </th>
                  <th
                    className="text-right p-2 cursor-pointer"
                    onClick={() => handleSort('priceChange24h')}
                  >
                    24h Change
                  </th>
                  <th
                    className="text-right p-2 cursor-pointer"
                    onClick={() => handleSort('volume24h')}
                  >
                    24h Volume
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMarkets.map((market) => (
                  <tr key={market.pair} className="hover:bg-muted/50">
                    <td className="p-2">{market.pair}</td>
                    <td className="text-right p-2">
                      ${market.lastPrice.toFixed(2)}
                    </td>
                    <td
                      className={cn(
                        'text-right p-2',
                        market.priceChange24h >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      )}
                    >
                      {market.priceChange24h.toFixed(2)}%
                    </td>
                    <td className="text-right p-2">
                      ${market.volume24h.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>

          <TabsContent value="gainers">
            <MarketList markets={topGainers} />
          </TabsContent>

          <TabsContent value="losers">
            <MarketList markets={topLosers} />
          </TabsContent>

          <TabsContent value="volume">
            <MarketList markets={volumeLeaders} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
}

function MarketList({ markets }: { markets: Market[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left p-2">Pair</th>
          <th className="text-right p-2">Last Price</th>
          <th className="text-right p-2">24h Change</th>
          <th className="text-right p-2">24h Volume</th>
        </tr>
      </thead>
      <tbody>
        {markets.map((market) => (
          <tr key={market.pair} className="hover:bg-muted/50">
            <td className="p-2">{market.pair}</td>
            <td className="text-right p-2">${market.lastPrice.toFixed(2)}</td>
            <td
              className={cn(
                'text-right p-2',
                market.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
              )}
            >
              {market.priceChange24h.toFixed(2)}%
            </td>
            <td className="text-right p-2">
              ${market.volume24h.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
