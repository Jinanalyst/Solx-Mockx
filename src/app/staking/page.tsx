'use client';

import { Suspense } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { handleError } from '@/utils/errorHandling';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">SOLX Staking</h2>
            <p className="text-muted-foreground mb-4">
              Stake your SOLX tokens to earn rewards and participate in governance.
            </p>
            {/* SOLX Staking content will go here */}
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">MOCKX Staking</h2>
            <p className="text-muted-foreground mb-4">
              Practice staking with virtual tokens and learn about DeFi mechanics.
            </p>
            {/* MOCKX Staking content will go here */}
          </Card>
        </div>
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
