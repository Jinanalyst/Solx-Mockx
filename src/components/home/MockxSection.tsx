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
            <div className="relative">
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
              <div id="dexscreener-embed" className="rounded-lg overflow-hidden border bg-muted">
                <iframe 
                  src="https://dexscreener.com/solana/GYMFTekFZMkYLctpQ8YUvBD1PhHF5ncsYtNrEr53qKHV?embed=1&loadChartSettings=0&trades=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15"
                  title="DEXScreener MOCKX/USDC"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
