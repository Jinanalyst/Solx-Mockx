'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MockxSection() {
  return (
    <section className="py-20">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="mb-6 text-4xl font-bold">Practice with MockX</h2>
              <p className="mb-6 text-muted-foreground">
                New to trading? Start your journey with MockX, our risk-free trading simulator. 
                Practice trading strategies, learn the platform, and gain confidence before 
                trading with real assets.
              </p>
              <ul className="mb-8 space-y-4">
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  Risk-free trading environment
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  Real-time market data simulation
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  Practice advanced trading features
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-green-500">✓</span>
                  Track performance and learn from mistakes
                </li>
              </ul>
              <Link href="/mock-trading">
                <Button size="lg">Try MockX Now</Button>
              </Link>
            </div>
            <div className="relative aspect-square">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-lg" />
              <div className="relative h-full rounded-lg overflow-hidden border bg-muted">
                {/* Add a mock trading interface screenshot here */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  Mock Trading Interface Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
