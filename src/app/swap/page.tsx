'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { SwapInterface } from '@/components/swap/SwapInterface';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/utils/errorHandling';

export default function SwapPage() {
  const { toast } = useToast();

  const onError = (error: unknown) => {
    const handledError = handleError(error);
    toast({
      title: 'Swap Error',
      description: handledError.message,
      variant: 'destructive',
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Swap</h1>
          <p className="text-muted-foreground text-center">
            Instantly swap tokens at the best rates
          </p>
        </div>
        <SwapInterface onError={onError} />
      </div>
    </PageLayout>
  );
}
