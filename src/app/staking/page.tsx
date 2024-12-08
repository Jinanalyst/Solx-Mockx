'use client';

import { Suspense } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StakingPool } from '@/components/staking/StakingPool';
import { handleError } from '@/utils/errorHandling';
import { useToast } from '@/components/ui/use-toast';

function StakingContent() {
  const { toast } = useToast();

  const handleStakingError = (error: unknown) => {
    const handledError = handleError(error, 'Staking Page');
    toast({
      title: 'Staking Error',
      description: handledError.message,
      variant: 'destructive',
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Staking</h1>
      <Suspense 
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
          </div>
        }
      >
        <StakingPool onError={handleStakingError} />
      </Suspense>
    </div>
  );
}

export default function StakingPage() {
  return (
    <PageLayout>
      <StakingContent />
    </PageLayout>
  );
}
