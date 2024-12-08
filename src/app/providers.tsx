'use client';

import { ThemeProvider } from 'next-themes';
import { WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WALLET_ADAPTERS, RPC_ENDPOINT } from '@/config/wallet';
import { useMemo } from 'react';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletProvider } from '@/contexts/WalletContext';
import { TransactionProvider } from '@/contexts/TransactionContext';
import { TradingProvider } from '@/contexts/TradingContext';
import { MarketDataProvider } from '@/contexts/MarketDataContext';
import { MockTradingProvider } from '@/contexts/MockTradingContext';

require('@solana/wallet-adapter-react-ui/styles.css');

export function Providers({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => WALLET_ADAPTERS.map(Adapter => new Adapter()), []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ConnectionProvider endpoint={RPC_ENDPOINT}>
        <SolanaWalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <WalletProvider>
              <TransactionProvider>
                <MarketDataProvider>
                  <TradingProvider>
                    <MockTradingProvider>
                      {children}
                    </MockTradingProvider>
                  </TradingProvider>
                </MarketDataProvider>
              </TransactionProvider>
            </WalletProvider>
          </WalletModalProvider>
        </SolanaWalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}
