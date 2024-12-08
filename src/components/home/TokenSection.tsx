'use client';

import React, { useState, useEffect } from 'react';
import { useSerumMarket } from '@/hooks/useSerumMarket';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatNumber, formatPercent } from '@/utils/format';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Icons } from '@/components/ui/icons';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface TokenInfo {
  title: string;
  value: string;
  icon: keyof typeof Icons;
}

const MARKET_ADDRESSES = {
  'SOL/USDC': 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1',  // Serum SOL/USDC market
  'BTC/USDC': '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',  // Serum BTC/USDC market
  'ETH/USDC': '4tSvZvnbyzHXLMTiFonMyxZoHmFqau1XArcRCVHLZ5gX',  // Serum ETH/USDC market
  'RAY/USDC': '2xiv8A5xrJ7RnGdxXB42uFEkYHJjszEhaJyKKt4WaLep',  // Serum RAY/USDC market
  'SRM/USDC': 'ByRys5tuUWDgL73G8JBAEfkdFf8JWBzPBDHsBVQ5vbQA',  // Serum SRM/USDC market
};

const IconWrapper = ({ iconName }: { iconName: keyof typeof Icons }) => {
  const IconComponent = Icons[iconName];
  if (!IconComponent) {
    throw new Error(`Icon ${iconName} not found`);
  }
  return <IconComponent className="w-6 h-6" />;
};

const getTokenLogo = (symbol: string) => {
  const baseSymbol = symbol.split('/')[0].toLowerCase();
  return `/images/tokens/${baseSymbol}.png`;
};

export function TokenSection() {
  const { theme } = useTheme();
  const [markets, setMarkets] = useState<Array<{ pair: string; data: any }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const solMarket = useSerumMarket(MARKET_ADDRESSES['SOL/USDC']);
  const btcMarket = useSerumMarket(MARKET_ADDRESSES['BTC/USDC']);
  const ethMarket = useSerumMarket(MARKET_ADDRESSES['ETH/USDC']);
  const rayMarket = useSerumMarket(MARKET_ADDRESSES['RAY/USDC']);
  const srmMarket = useSerumMarket(MARKET_ADDRESSES['SRM/USDC']);

  useEffect(() => {
    const marketData = [
      { pair: 'SOL/USDC', data: solMarket.marketData },
      { pair: 'BTC/USDC', data: btcMarket.marketData },
      { pair: 'ETH/USDC', data: ethMarket.marketData },
      { pair: 'RAY/USDC', data: rayMarket.marketData },
      { pair: 'SRM/USDC', data: srmMarket.marketData },
    ].filter(market => market.data !== null);

    setMarkets(marketData);
    setIsLoading(false);
  }, [solMarket.marketData, btcMarket.marketData, ethMarket.marketData, rayMarket.marketData, srmMarket.marketData]);

  const tokenomics: TokenInfo[] = [
    {
      title: 'Total Supply',
      value: '100,000,000 SOLX',
      icon: 'coins',
    },
    {
      title: 'Trading Fee',
      value: '0.1%',
      icon: 'percentage',
    },
    {
      title: 'Staking APY',
      value: 'Up to 15%',
      icon: 'trendingUp',
    },
  ];

  const renderIcon = (iconName: keyof typeof Icons) => {
    return (
      <ErrorBoundary fallback={<div className="w-6 h-6 bg-muted rounded-full" />}>
        <IconWrapper iconName={iconName} />
      </ErrorBoundary>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <h2 className="mb-12 text-4xl font-bold text-center">SOLX Token</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Platform Native Token</h3>
              <p className="text-muted-foreground">
                SOLX is the native token of the Solx platform, powering our ecosystem 
                and providing holders with exclusive benefits and governance rights.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Reduced trading fees when paying with SOLX</li>
                <li>• Stake SOLX to earn a share of platform revenue</li>
                <li>• Participate in governance decisions</li>
                <li>• Access to exclusive features and trading pairs</li>
              </ul>
              
              <style dangerouslySetInnerHTML={{ __html: `
                #dexscreener-embed{
                  position:relative;
                  width:100%;
                  padding-bottom:125%;
                }
                @media(min-width:1400px){
                  #dexscreener-embed{
                    padding-bottom:65%;
                  }
                }
                #dexscreener-embed iframe{
                  position:absolute;
                  width:100%;
                  height:100%;
                  top:0;
                  left:0;
                  border:0;
                }
              `}} />
              <div id="dexscreener-embed" className="mt-6">
                <iframe 
                  src="https://dexscreener.com/solana/6xCSREemPY8K9mVE5oQSEPMUa8XU7Je2XKnY6sqU9M1E?embed=1&loadChartSettings=0&trades=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15"
                  title="DEXScreener SOLX/USDC"
                />
              </div>
            </div>

            <div className="grid gap-6">
              {tokenomics.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-background">
                  {renderIcon(item.icon)}
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-4 mt-8">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {markets.map(({ pair, data }) => (
                  <div
                    key={pair}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative w-8 h-8">
                        <Image
                          src={getTokenLogo(pair)}
                          alt={pair}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pair}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Vol: ${formatNumber(data.volume24h)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${formatNumber(data.price)}</p>
                      <p
                        className={
                          data.change24h >= 0
                            ? 'text-green-500 dark:text-green-400'
                            : 'text-red-500 dark:text-red-400'
                        }
                      >
                        {formatPercent(data.change24h)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </section>
  );
}
