'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SUPPORTED_TOKENS } from '@/config/trading';
import { WalletService } from '@/services/walletService';
import { Transaction, WithdrawalLimit } from '@/types/wallet';
import { formatNumber, shortenAddress } from '@/lib/utils';

const withdrawalSchema = z.object({
  token: z.string().min(1, 'Please select a token'),
  amount: z.number().positive('Amount must be positive'),
  address: z.string().min(32, 'Invalid wallet address'),
  twoFactorCode: z.string().length(6, '2FA code must be 6 digits').optional(),
});

export function WithdrawView() {
  const { publicKey } = useWallet();
  const [withdrawalLimit, setWithdrawalLimit] = useState<WithdrawalLimit | null>(null);
  const [recentWithdrawals, setRecentWithdrawals] = useState<Transaction[]>([]);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  const walletService = WalletService.getInstance('https://api.mainnet-beta.solana.com');

  const form = useForm<z.infer<typeof withdrawalSchema>>({
    resolver: zodResolver(withdrawalSchema),
  });

  useEffect(() => {
    if (form.watch('token')) {
      loadWithdrawalLimit();
      loadRecentWithdrawals();
    }
  }, [form.watch('token')]);

  const loadWithdrawalLimit = async () => {
    try {
      const limit = await walletService.getWithdrawalLimits(form.watch('token'));
      setWithdrawalLimit(limit);
      setRequiresTwoFactor(limit.requiresTwoFactor);
    } catch (error) {
      console.error('Error loading withdrawal limit:', error);
    }
  };

  const loadRecentWithdrawals = async () => {
    try {
      const transactions = await walletService.getTransactions({
        type: 'withdrawal',
        token: form.watch('token'),
      });
      setRecentWithdrawals(transactions);
    } catch (error) {
      console.error('Error loading recent withdrawals:', error);
    }
  };

  const onSubmit = async (data: z.infer<typeof withdrawalSchema>) => {
    try {
      if (requiresTwoFactor && !data.twoFactorCode) {
        form.setError('twoFactorCode', {
          type: 'manual',
          message: '2FA code is required',
        });
        return;
      }

      const withdrawal = await walletService.initiateWithdrawal({
        token: data.token,
        amount: data.amount,
        toAddress: data.address,
        twoFactorCode: data.twoFactorCode,
      });

      form.reset();
      loadRecentWithdrawals();
    } catch (error) {
      console.error('Error initiating withdrawal:', error);
    }
  };

  if (!publicKey) {
    return (
      <Alert>
        <AlertDescription>
          Please connect your wallet to make withdrawals.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Withdraw Funds</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Token</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a token" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                      value={field.value}
                      placeholder="0.00"
                    />
                  </FormControl>
                  {withdrawalLimit && (
                    <p className="text-sm text-muted-foreground">
                      Daily limit remaining: {formatNumber(withdrawalLimit.remaining)} {form.watch('token')}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter wallet address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiresTwoFactor && (
              <FormField
                control={form.control}
                name="twoFactorCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2FA Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter 2FA code"
                        maxLength={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full">
              Withdraw
            </Button>
          </form>
        </Form>
      </Card>

      {/* Recent withdrawals */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Withdrawals</h2>
        <div className="space-y-4">
          {recentWithdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="rounded-lg border p-4"
            >
              <div className="flex justify-between">
                <span className="font-medium">
                  {formatNumber(withdrawal.amount)} {withdrawal.token}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(withdrawal.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="mt-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-mono">
                    {shortenAddress(withdrawal.toAddress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={
                    withdrawal.status === 'completed'
                      ? 'text-green-500'
                      : withdrawal.status === 'failed'
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  }>
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </span>
                </div>
                {withdrawal.txHash && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction:</span>
                    <a
                      href={`https://solscan.io/tx/${withdrawal.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {shortenAddress(withdrawal.txHash)}
                    </a>
                  </div>
                )}
                {withdrawal.confirmations !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Confirmations:</span>
                    <span>
                      {withdrawal.confirmations}/{withdrawal.requiredConfirmations || 1}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {recentWithdrawals.length === 0 && (
            <div className="text-center text-muted-foreground">
              No recent withdrawals
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
