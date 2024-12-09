'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';

const TradingViewWidget = dynamic(
  () => import('./trading/TradingViewWidget'),
  { ssr: false }
);

interface TradingChartProps {
  baseSymbol: string;
  quoteSymbol: string;
  height?: number;
}

const TradingChart: FC<TradingChartProps> = ({
  baseSymbol,
  quoteSymbol,
  height = 400
}) => {
  return (
    <div style={{ height: `${height}px` }}>
      <TradingViewWidget />
    </div>
  );
};

export default TradingChart;
