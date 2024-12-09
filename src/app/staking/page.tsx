'use client';

import { Suspense } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { StakingPool, StakingPoolContainer } from '@/components/staking/StakingPool';
import { TestStaking } from '@/components/staking/TestStaking';
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
        <div className="space-y-8">
          <StakingPool onError={handleStakingError} />
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-4">Test Staking Interface</h2>
            <TestStaking />
          </div>
        </div>
      </Suspense>
    </div>
  );
}

export default function StakingPage() {
  const { toast } = useToast();

  const onError = (error: unknown) => {
    handleError(error, (message) => {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Staking</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Suspense fallback={<div>Loading staking pools...</div>}>
            <StakingPoolContainer onError={onError} />
          </Suspense>
          <div>
            <h2 className="text-2xl font-bold mb-4">Test Staking</h2>
            <TestStaking />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
