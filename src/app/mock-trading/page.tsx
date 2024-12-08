'use client';

import { PageLayout } from '@/components/layout/PageLayout';
import { MockTradingDashboard } from '@/components/trading/MockTradingDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { handleError } from '@/utils/errorHandling';

function MockTradingContent() {
  const { toast } = useToast();

  const onError = (error: unknown) => {
    const handledError = handleError(error);
    toast({
      title: 'Mock Trading Error',
      description: handledError.message,
      variant: 'destructive',
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mock Trading</h1>
        <Alert variant="default" className="max-w-md">
          <AlertDescription>
            This is a mock trading environment. No real assets are involved.
          </AlertDescription>
        </Alert>
      </div>

      <MockTradingDashboard onError={onError} />
    </div>
  );
}

export default function MockTradingPage() {
  return (
    <PageLayout>
      <MockTradingContent />
    </PageLayout>
  );
}
