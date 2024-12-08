import { AssetList } from '@/components/AssetList';
import { PositionList } from '@/components/PositionList';
import { TransactionHistory } from '@/components/TransactionHistory';

export default function PortfolioPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-6 px-4 py-8">
      <h1 className="text-3xl font-bold">Portfolio</h1>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-card p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Assets</h2>
          <AssetList />
        </div>
        
        <div className="rounded-lg bg-card p-6 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Active Positions</h2>
          <PositionList />
        </div>
      </div>
      
      <div className="rounded-lg bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Transaction History</h2>
        <TransactionHistory />
      </div>
    </main>
  );
}
