'use client';

import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Loader2, Wallet } from 'lucide-react';

export function WalletButton() {
  const { connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connecting) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting
      </Button>
    );
  }

  if (connected) {
    return (
      <Button variant="outline" onClick={() => disconnect()}>
        Disconnect
      </Button>
    );
  }

  return (
    <Button variant="outline" onClick={() => setVisible(true)}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
