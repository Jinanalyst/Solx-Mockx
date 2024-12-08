'use client';

import { Suspense } from 'react';
import { HeroSection } from './HeroSection';
import { TokenSection } from './TokenSection';
import { MockxSection } from './MockxSection';
import { FeatureSection } from './FeatureSection';

export function HomeContent() {
  return (
    <>
      <Suspense fallback={<div>Loading Hero Section...</div>}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<div>Loading Token Section...</div>}>
        <TokenSection />
      </Suspense>
      <Suspense fallback={<div>Loading MockX Section...</div>}>
        <MockxSection />
      </Suspense>
      <Suspense fallback={<div>Loading Feature Section...</div>}>
        <FeatureSection />
      </Suspense>
    </>
  );
}
