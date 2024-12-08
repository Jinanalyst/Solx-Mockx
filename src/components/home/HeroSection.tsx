'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export function HeroSection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-background/90 to-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="mb-8 text-5xl font-bold tracking-tight">
            Welcome to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-purple-500">
              SOLX
            </span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            A next-generation decentralized exchange built on Solana, offering lightning-fast trades, 
            deep liquidity, and innovative features for both experienced traders and newcomers.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/trade">
              <Button size="lg" className="px-8">
                Start Trading
              </Button>
            </Link>
            <Link href="/mock-trading">
              <Button size="lg" variant="outline" className="px-8">
                Try Mock Trading
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
