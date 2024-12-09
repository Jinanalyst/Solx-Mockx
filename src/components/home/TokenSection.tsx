'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Icons } from '@/components/ui/icons';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { RealTrading } from '@/components/trading/RealTrading';
import { MockTrading } from '@/components/trading/MockTrading';

interface TokenInfo {
  title: string;
  value: string;
  icon: keyof typeof Icons;
}

const IconWrapper = ({ iconName }: { iconName: keyof typeof Icons }) => {
  const IconComponent = Icons[iconName];
  if (!IconComponent) {
    throw new Error(`Icon ${iconName} not found`);
  }
  return <IconComponent className="w-6 h-6" />;
};

export function TokenSection() {
  const pathname = usePathname();
  const isMockTrading = pathname.includes('/mock-trading');

  const tokenomics: TokenInfo[] = [
    {
      title: 'Total Supply',
      value: '10,000,000',
      icon: 'coins',
    },
    {
      title: 'Circulating Supply',
      value: '8,750,000',
      icon: 'circleSlash',
    },
    {
      title: 'Market Cap',
      value: '$87,500,000',
      icon: 'barChart',
    },
  ];

  const renderIcon = (iconName: keyof typeof Icons) => {
    return (
      <ErrorBoundary fallback={<div className="w-6 h-6 bg-muted rounded-full" />}>
        <IconWrapper iconName={iconName} />
      </ErrorBoundary>
    );
  };

  return (
    <section className="py-20 bg-muted/50">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <h2 className="mb-12 text-4xl font-bold text-center">SOLX Token</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isMockTrading ? <MockTrading /> : <RealTrading />}
            <Card>
              <ScrollArea className="h-[400px]">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Tokenomics</h3>
                  <div className="space-y-6">
                    {tokenomics.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {renderIcon(item.icon)}
                          <span className="text-sm text-muted-foreground">
                            {item.title}
                          </span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
