import { Assets } from '@/components/portfolio/Assets';
import { TransactionHistory } from '@/components/portfolio/TransactionHistory';

export default function PortfolioPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Portfolio</h1>
      
      <div className="space-y-6">
        {/* Assets Section */}
        <Assets />
        
        {/* Transaction History with Tabs */}
        <TransactionHistory />
      </div>
    </main>
  );
}
