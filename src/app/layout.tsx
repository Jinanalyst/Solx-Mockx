import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { WalletProvider } from '@/components/solana/WalletProvider';
import { Navbar } from '@/components/Navbar';
import { ThemeProvider } from '../contexts/ThemeContext';
import { setInitialTheme } from './theme-script';

export const metadata: Metadata = {
  title: 'SOLX - Next-Gen DEX on Solana',
  description: 'A next-generation decentralized exchange built on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: setInitialTheme(),
          }}
        />
      </head>
      <body suppressHydrationWarning className="font-sans">
        <ThemeProvider>
          <Providers>
            <WalletProvider>
              <div className="min-h-screen bg-background">
                <Navbar />
                <main>{children}</main>
              </div>
            </WalletProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
