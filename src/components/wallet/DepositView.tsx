'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { formatNumber } from '@/utils/format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SUPPORTED_TOKENS } from '@/config/trading';
import { WalletService } from '@/services/walletService';
import { DepositAddress, Transaction } from '@/types/wallet';
import { shortenAddress } from '@/lib/utils';

export function DepositView() {
  const { publicKey } = useWallet();
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [depositAddress, setDepositAddress] = useState<DepositAddress | null>(null);
  const [recentDeposits, setRecentDeposits] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);

  const walletService = WalletService.getInstance('https://api.mainnet-beta.solana.com');

  useEffect(() => {
    if (selectedToken) {
      generateDepositAddress();
      loadRecentDeposits();
    }
  }, [selectedToken]);

  const generateDepositAddress = async () => {
    try {
      const address = await walletService.generateDepositAddress(selectedToken);
      setDepositAddress(address);
    } catch (error) {
      console.error('Error generating deposit address:', error);
    }
  };

  const loadRecentDeposits = async () => {
    try {
      const transactions = await walletService.getTransactions({
        type: 'deposit',
        token: selectedToken,
      });
      setRecentDeposits(transactions);
    } catch (error) {
      console.error('Error loading recent deposits:', error);
    }
  };

  const copyAddress = async () => {
    if (depositAddress?.address) {
      await navigator.clipboard.writeText(depositAddress.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!publicKey) {
    return (
      <Alert>
        <AlertDescription>
          Please connect your wallet to view deposit addresses.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Deposit Funds</h2>
        
        {/* Token selector */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Select Token</label>
          <Select
            value={selectedToken}
            onValueChange={setSelectedToken}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a token" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SUPPORTED_TOKENS).map(([symbol, token]) => (
                <SelectItem key={symbol} value={symbol}>
                  <div className="flex items-center gap-2">
                    {token.logoURI && (
                      <Image
                        src={token.logoURI}
                        alt={token.name}
                        width={20}
                        height={20}
                      />
                    )}
                    <span>{token.name} ({symbol})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Deposit address */}
        {depositAddress && (
          <div className="space-y-4">
            {depositAddress.qrCode && (
              <div className="flex justify-center">
                <Image
                  src={depositAddress.qrCode}
                  alt="Deposit QR Code"
                  width={200}
                  height={200}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">Deposit Address</label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={depositAddress.address}
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  onClick={copyAddress}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {depositAddress.minimumDeposit && (
              <Alert>
                <AlertDescription>
                  Minimum deposit: {formatNumber(depositAddress.minimumDeposit)} {selectedToken}
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                Required confirmations: {depositAddress.expectedConfirmations}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </Card>

      {/* Recent deposits */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Deposits</h2>
        <div className="space-y-4">
          {recentDeposits.map((deposit) => (
            <div
              key={deposit.id}
              className="rounded-lg border p-4"
            >
              <div className="flex justify-between">
                <span className="font-medium">
                  {formatNumber(deposit.amount)} {deposit.token}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(deposit.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-mono">
                    {shortenAddress(deposit.fromAddress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={
                    deposit.status === 'completed'
                      ? 'text-green-500'
                      : deposit.status === 'failed'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  }>
                    {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                  </span>
                </div>
                {deposit.confirmations !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmations:</span>
                    <span>
                      {deposit.confirmations}/{deposit.requiredConfirmations || 1}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {recentDeposits.length === 0 && (
            <div className="text-center text-muted-foreground">
              No recent deposits
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
