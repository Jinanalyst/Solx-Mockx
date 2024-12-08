'use client';

import React from 'react';
import { Icons } from '@/components/ui/icons';

interface Feature {
  title: string;
  description: string;
  icon: keyof typeof Icons;
}

export function FeatureSection() {
  const features: Feature[] = [
    {
      title: 'Lightning Fast Trades',
      description: "Execute trades in milliseconds on Solana's high-performance blockchain",
      icon: 'zap',
    },
    {
      title: 'Deep Liquidity',
      description: 'Access deep liquidity pools and competitive prices across trading pairs',
      icon: 'waves',
    },
    {
      title: 'Low Trading Fees',
      description: 'Enjoy some of the lowest trading fees in DeFi, with additional discounts for SOLX holders',
      icon: 'piggyBank',
    },
    {
      title: 'Secure Platform',
      description: 'Trade with confidence on our security-first platform with regular audits',
      icon: 'shield',
    },
    {
      title: 'Staking Rewards',
      description: 'Earn passive income by staking SOLX tokens and participating in liquidity pools',
      icon: 'coins',
    },
    {
      title: 'Advanced Trading Tools',
      description: 'Access professional trading tools, charts, and analytics',
      icon: 'lineChart',
    },
  ];

  const renderIcon = (iconName: keyof typeof Icons) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent className="w-8 h-8" /> : null;
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <h2 className="mb-12 text-4xl font-bold text-center">Platform Features</h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 bg-background rounded-lg border shadow-sm"
              >
                <div className="mb-4 text-primary">
                  {renderIcon(feature.icon)}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
