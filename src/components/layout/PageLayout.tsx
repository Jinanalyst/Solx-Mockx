'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { SolswapError } from '@/utils/errorHandling';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  const pathname = usePathname();
  const { toast } = useToast();

  // Global error boundary
  const handleError = React.useCallback((error: Error) => {
    console.error('Page error:', error);
    
    if (error instanceof SolswapError) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <main className="flex-1">
        <ErrorBoundary onError={handleError}>
          <React.Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
              </div>
            }
          >
            {children}
          </React.Suspense>
        </ErrorBoundary>
      </main>
      <Toaster />
    </div>
  );
}

class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  onError: (error: Error) => void;
}> {
  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.props.children;
  }
}
