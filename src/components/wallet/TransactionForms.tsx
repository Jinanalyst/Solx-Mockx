'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useTransactionContext } from '@/contexts/TransactionContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { SOLANA_TOKENS } from '@/config/tokens';

const transactionSchema = z.object({
  token: z.string().min(1, 'Please select a token'),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: 'Amount must be a positive number',
    }
  ),
  address: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const SUPPORTED_TOKENS = Object.keys(SOLANA_TOKENS);

export function TransactionForms() {
  const { toast } = useToast();
  const { publicKey } = useWallet();
  const { depositToken, withdrawToken } = useTransactionContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const depositForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      token: '',
      amount: '',
    },
  });

  const withdrawForm = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      token: '',
      amount: '',
      address: '',
    },
  });

  const onDepositSubmit = async (data: TransactionFormData) => {
    if (!publicKey) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const signature = await depositToken(
        data.token,
        parseFloat(data.amount)
      );

      toast({
        title: 'Deposit Initiated',
        description: `Transaction signature: ${signature.slice(0, 8)}...`,
      });

      depositForm.reset();
    } catch (error: any) {
      toast({
        title: 'Deposit Failed',
        description: error.message || 'An error occurred while processing your deposit',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onWithdrawSubmit = async (data: TransactionFormData) => {
    if (!publicKey) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const signature = await withdrawToken(
        data.token,
        parseFloat(data.amount),
        data.address || (publicKey ? publicKey.toBase58() : '')
      );

      toast({
        title: 'Withdrawal Initiated',
        description: `Transaction signature: ${signature.slice(0, 8)}...`,
      });

      withdrawForm.reset();
    } catch (error: any) {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'An error occurred while processing your withdrawal',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!publicKey) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          Please connect your wallet to deposit or withdraw funds
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="deposit">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <Form {...depositForm}>
            <form onSubmit={depositForm.handleSubmit(onDepositSubmit)} className="space-y-6">
              <FormField
                control={depositForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPPORTED_TOKENS.map(token => (
                          <SelectItem key={token} value={token}>
                            {token}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={depositForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Deposit'}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="withdraw">
          <Form {...withdrawForm}>
            <form onSubmit={withdrawForm.handleSubmit(onWithdrawSubmit)} className="space-y-6">
              <FormField
                control={withdrawForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPPORTED_TOKENS.map(token => (
                          <SelectItem key={token} value={token}>
                            {token}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={withdrawForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter amount"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={withdrawForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Withdrawal Address (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter withdrawal address or leave empty to use connected wallet"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Withdraw'}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
