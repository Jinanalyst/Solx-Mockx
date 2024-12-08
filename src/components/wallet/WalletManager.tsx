'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TransactionForms } from './TransactionForms';
import { TransactionHistory } from './TransactionHistory';

interface DepositDialogProps {
  token: {
    symbol: string;
    logoURI?: string;
  };
  address: string;
}

function DepositDialog({ token, address }: DepositDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Deposit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit {token.symbol}</DialogTitle>
          <DialogDescription>
            Send {token.symbol} to the following address
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg break-all">
            {address}
          </div>
          <div className="text-sm text-muted-foreground">
            Only send {token.symbol} to this address. Sending any other token may result in permanent loss.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface WithdrawDialogProps {
  token: {
    symbol: string;
    balance: number;
    logoURI?: string;
  };
  onWithdraw: (amount: number, address: string) => Promise<void>;
}

function WithdrawDialog({ token, onWithdraw }: WithdrawDialogProps) {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || !address) return;

    setIsLoading(true);
    try {
      await onWithdraw(Number(amount), address);
      setAmount('');
      setAddress('');
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Withdraw</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw {token.symbol}</DialogTitle>
          <DialogDescription>
            Available balance: {token.balance} {token.symbol}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max={token.balance}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Destination Address</label>
            <Input
              placeholder="Enter destination address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleWithdraw}
            disabled={!amount || !address || isLoading}
          >
            {isLoading ? 'Processing...' : 'Withdraw'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WalletManager() {
  const {
    connected,
    publicKey,
    balances,
    isLoadingBalances,
    refreshBalances,
  } = useWallet();

  const formatNumber = (num: number, decimals: number = 6) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const handleWithdraw = async (amount: number, address: string) => {
    // Implement withdrawal logic here
    console.log('Withdraw:', { amount, address });
  };

  if (!connected) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Connect your wallet to start trading</p>
          <WalletMultiButton />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Wallet</h2>
          <WalletMultiButton />
        </div>
        
        {publicKey ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {balances.map((balance) => (
                <div
                  key={balance.symbol}
                  className="p-4 rounded-lg border bg-card text-card-foreground"
                >
                  <div className="text-sm text-muted-foreground">{balance.symbol}</div>
                  <div className="text-2xl font-semibold">{formatNumber(balance.balance)}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            Connect your wallet to view balances
          </div>
        )}
      </Card>

      <TransactionForms />
      <TransactionHistory />
    </div>
  );
}
