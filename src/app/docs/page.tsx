'use client';

export default function Documentation() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Solswap Documentation</h1>
      
      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p>Welcome to Solswap, a decentralized exchange built on Solana.</p>
            <p>To start trading:</p>
            <ol>
              <li>Connect your Solana wallet using the button in the top right</li>
              <li>Navigate to the Trade page to swap tokens</li>
              <li>Visit the Pools page to provide liquidity and earn rewards</li>
              <li>Track your positions and earnings in the Portfolio section</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="text-xl font-medium mb-2">Trading</h3>
              <p>Swap tokens with minimal slippage using our optimized AMM protocol</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-xl font-medium mb-2">Liquidity Pools</h3>
              <p>Earn fees by providing liquidity to trading pairs</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="text-xl font-medium mb-2">Portfolio Tracking</h3>
              <p>Monitor your positions, rewards, and trading history</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
