'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TradingPairsTable } from '@/components/trading/TradingPairsTable';
import { TradingInterface } from '@/components/trading/TradingInterface';
import { OrderBook } from '@/components/trading/OrderBook';
import { OrderForm } from '@/components/trading/OrderForm';
import { RecentTrades } from '@/components/trading/RecentTrades';
import { UserPositions } from '@/components/trading/UserPositions';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { FuturesTrading } from '@/components/trading/FuturesTrading';
import { PriceDisplay } from '@/components/trading/PriceDisplay';
import { TradeHistory } from '@/components/trading/TradeHistory';
import { useTradingContext } from '@/contexts/TradingContext';
import { TRADING_PAIRS } from '@/config/trading';
import type { TradingPair } from '@/types/trading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/utils/errorHandling';
import { usePriceUpdates } from '@/hooks/usePriceUpdates';

function TradeContent() {
  const { toast } = useToast();
  const [selectedPair, setSelectedPair] = useState<TradingPair>(TRADING_PAIRS[0]);
  const { pairPrices: prices, error, isLoading } = usePriceUpdates(5000); // Update every 5 seconds

  const handleTradingError = (error: unknown) => {
    const handledError = handleError(error);
    toast({
      title: 'Trading Error',
      description: handledError.message,
      variant: 'destructive',
    });
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load trading data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-2">
          <Card className="p-4">
            <TradingPairsTable
              pairs={[...TRADING_PAIRS]}
              selectedPair={selectedPair}
              onSelectPair={setSelectedPair}
              pairPrices={prices}
            />
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-7 space-y-4">
          {prices[selectedPair.name] && (
            <PriceDisplay
              pair={selectedPair.name}
              price={prices[selectedPair.name].price}
              high24h={prices[selectedPair.name].high24h}
              low24h={prices[selectedPair.name].low24h}
              volume24h={prices[selectedPair.name].volume24h}
              priceChange24h={prices[selectedPair.name].priceChange24h}
              priceChangePercentage24h={prices[selectedPair.name].priceChangePercentage24h}
            />
          )}

          <Card className="p-4">
            <TradingInterface
              selectedPair={selectedPair}
            />
          </Card>

          <Card className="p-4">
            <Tabs defaultValue="spot">
              <TabsList>
                <TabsTrigger value="spot">Spot Trading</TabsTrigger>
                <TabsTrigger value="futures">Futures Trading</TabsTrigger>
              </TabsList>
              <TabsContent value="spot">
                <TradingPanel
                  pair={selectedPair.name}
                  currentPrice={prices[selectedPair.name]?.price || 0}
                  onError={handleTradingError}
                />
              </TabsContent>
              <TabsContent value="futures">
                <FuturesTrading
                  pair={selectedPair.name}
                  currentPrice={prices[selectedPair.name]?.price || 0}
                  onError={handleTradingError}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="h-[400px]">
            <OrderBook
              pair={selectedPair.name}
              onError={handleTradingError}
            />
          </div>
          <div className="h-[400px]">
            <TradeHistory
              pair={selectedPair.name}
              onError={handleTradingError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradePage() {
  return (
    <div className="min-h-screen bg-background">
      <TradeContent />
    </div>
  );
}
