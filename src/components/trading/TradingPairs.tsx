'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';

interface TradingPair {
  label: string;
  value: string;
  price: string;
  change: string;
  volume: string;
  isPositive: boolean;
  liquidity: string;
  marketCap?: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
}

export function TradingPairs({ onSelectPair }: { onSelectPair: (pair: TradingPair) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: pairs, isLoading } = useQuery({
    queryKey: ['tradingPairs'],
    queryFn: async () => {
      const response = await fetch('/api/pairs');
      if (!response.ok) throw new Error('Failed to fetch pairs');
      return response.json();
    },
  });

  const filteredPairs = pairs?.filter((pair: TradingPair) =>
    pair.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.baseToken.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pair.quoteToken.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search pairs..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="text-sm text-muted-foreground">
                <th className="text-left p-4">Pair</th>
                <th className="text-right p-4">Price</th>
                <th className="text-right p-4">24h Change</th>
                <th className="text-right p-4">Volume</th>
              </tr>
            </thead>
            <tbody>
              {filteredPairs.map((pair: TradingPair) => (
                <tr
                  key={pair.pairAddress}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onSelectPair(pair)}
                >
                  <td className="p-4">
                    <div className="flex items-center">
                      <span className="font-medium">{pair.label}</span>
                    </div>
                  </td>
                  <td className="text-right p-4">{pair.price}</td>
                  <td className={`text-right p-4 ${pair.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {pair.change}
                  </td>
                  <td className="text-right p-4">{pair.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
