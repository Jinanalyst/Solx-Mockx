'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { ThemeToggle } from './ThemeToggle';
import { WalletButton } from './solana/WalletButton';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Trade', href: '/trade' },
  { name: 'Swap', href: '/solana-swap' },
  { name: 'Mock Trading', href: '/mock-trading' },
  { name: 'Staking', href: '/staking' },
  { name: 'Portfolio', href: '/portfolio' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold">
            SOLX
          </Link>
          <div className="hidden md:flex md:items-center md:space-x-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                asChild
                className={cn(
                  'text-muted-foreground',
                  pathname === item.href && 'text-foreground'
                )}
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
