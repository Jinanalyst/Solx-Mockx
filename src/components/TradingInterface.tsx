import React from 'react';
import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TradePairSelector } from './trading/TradePairSelector';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useMockTrading } from '@/contexts/MockTradingContext';

const TradingViewWidget = dynamic(
  () => import('./trading/TradingViewWidget'),
  { ssr: false }
);

const TradingTabs = dynamic(
  () => import('./perpetuals/TradingTabs').then(mod => mod.TradingTabs),
  { ssr: false }
);

const TradingInterface: FC = () => {
  const { connected } = useWallet();
  const { selectedMarket } = useMockTrading();

  if (!connected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Please connect your wallet to start trading.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Market selector - spans full width */}
        <div className="col-span-12">
          <Card>
            <CardContent className="p-4">
              <TradePairSelector />
            </CardContent>
          </Card>
        </div>

        {/* Main trading area - chart */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="overflow-hidden h-[600px]">
            <CardContent className="p-0 h-full">
              <TradingViewWidget symbol={selectedMarket} />
            </CardContent>
          </Card>
        </div>

        {/* Trading form and info - right side */}
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardContent className="p-4">
              <TradingTabs />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;
