import { Suspense } from 'react';
import { Metadata } from 'next';
import { WithdrawView } from '@/components/wallet/WithdrawView';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Withdraw | SolSwap',
  description: 'Withdraw funds from your SolSwap account',
};

export default function WithdrawPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Withdraw</h1>
        <p className="text-muted-foreground">
          Withdraw funds from your SolSwap account
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <WithdrawView />
      </Suspense>
    </div>
  );
}
