'use client';

interface DexScreenerChartProps {
  pairAddress?: string;
  theme?: 'dark' | 'light';
}

export function DexScreenerChart({ pairAddress = 'raydium/8HoQnePLqPj4M7PUDzfw8e3Ymdwgc7NLGnaTUapubyvu', theme = 'dark' }: DexScreenerChartProps) {
  return (
    <iframe
      src={`https://dexscreener.com/solana/${pairAddress}?embed=1&theme=${theme}&trades=0`}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
      title="DexScreener Chart"
    />
  );
}
