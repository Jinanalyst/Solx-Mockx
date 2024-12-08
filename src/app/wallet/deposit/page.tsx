import { Suspense } from 'react';
import { Metadata } from 'next';
import { DepositView } from '@/components/wallet/DepositView';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Deposit | SolSwap',
  description: 'Deposit funds into your SolSwap account',
};

export default function DepositPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Deposit</h1>
        <p className="text-muted-foreground">
          Deposit funds into your SolSwap account
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <DepositView />
      </Suspense>
    </div>
  );
}
