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
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-4">
          <TradePairSelector />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <TradingViewWidget symbol={selectedMarket} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <TradingTabs />
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingInterface;
