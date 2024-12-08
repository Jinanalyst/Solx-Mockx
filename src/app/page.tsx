'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PageLayout } from '@/components/layout/PageLayout';
import { HomeContent } from '@/components/home/HomeContent';

export default function Home() {
  return (
    <PageLayout>
      <main className="min-h-screen">
        <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <HomeContent />
          </Suspense>
        </ErrorBoundary>
      </main>
    </PageLayout>
  );
}
