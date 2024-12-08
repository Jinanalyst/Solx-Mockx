import React from 'react';
import useOKX from '@/hooks/useOKX';

interface MarketDataProps {
  instId: string;
}

export const MarketData: React.FC<MarketDataProps> = ({ instId }) => {
  const { useMarketData } = useOKX();
  const { data, isLoading, error } = useMarketData(instId);

  if (isLoading) return <div>Loading market data...</div>;
  if (error) return <div>Error loading market data</div>;
  if (!data) return null;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">{instId} Market Data</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Last Price</p>
          <p className="text-lg font-medium">{data.last}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">24h Volume</p>
          <p className="text-lg font-medium">{data.volume24h}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Ask Price</p>
          <p className="text-lg font-medium text-red-500">{data.askPx}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Bid Price</p>
          <p className="text-lg font-medium text-green-500">{data.bidPx}</p>
        </div>
      </div>
    </div>
  );
};

export default MarketData;
