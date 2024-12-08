import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { WalletProvider } from '@/components/solana/WalletProvider';
import { Navbar } from '@/components/Navbar';
import { ThemeProvider } from '../contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'SOLX - Next-Gen DEX on Solana',
  description: 'A next-generation decentralized exchange built on Solana',
};

const fontClass = 'font-sans';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontClass}>
      <body>
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
