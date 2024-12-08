'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMarketData } from '@/contexts/MarketDataContext';
import { cn } from '@/lib/utils';

const orderSchema = z.object({
  type: z.enum(['market', 'limit', 'stop', 'tp_sl']),
  side: z.enum(['buy', 'sell']),
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  price: z.string().optional(),
  stopPrice: z.string().optional(),
  leverage: z.number().min(1).max(20).optional(),
  postOnly: z.boolean().optional(),
  reduceOnly: z.boolean().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  pair: string;
  mode?: 'spot' | 'margin' | 'convert';
  onOrderSubmit?: (order: OrderFormValues) => void;
  onError?: (error: unknown) => void;
}

export function OrderForm({ pair, mode = 'spot', onOrderSubmit, onError }: OrderFormProps) {
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const { getTokenPrice, getTokenBalance } = useMarketData();
  const [balances, setBalances] = useState<{ base: number; quote: number }>({ base: 0, quote: 0 });
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market' | 'tp_sl'>('limit');
  const [percentageAmount, setPercentageAmount] = useState(0);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      type: 'limit',
      side: 'buy',
      amount: '',
      price: '',
      stopPrice: '',
      leverage: 1,
      postOnly: false,
      reduceOnly: false,
    },
  });

  const { watch, setValue, reset } = form;
  const amount = watch('amount');
  const price = watch('price');

  // Update price periodically
  useEffect(() => {
    const updatePrice = async () => {
      if (!pair) return;
      try {
        const [baseToken] = pair.split('/');
        const tokenPrice = await getTokenPrice(baseToken);
        if (tokenPrice) {
          setCurrentPrice(tokenPrice.usd);
          if (!price) {
            setValue('price', tokenPrice.usd.toString());
          }
        }
      } catch (error) {
        console.error('Failed to fetch market price:', error);
        if (onError) onError(error);
      }
    };

    updatePrice();
    const interval = setInterval(updatePrice, 10000);
    return () => clearInterval(interval);
  }, [pair, getTokenPrice, setValue, price]);

  // Update balances
  useEffect(() => {
    const updateBalances = async () => {
      if (!publicKey) return;
      try {
        const [baseToken, quoteToken] = pair.split('/');
        const baseBalance = await getTokenBalance(baseToken);
        const quoteBalance = await getTokenBalance(quoteToken);
        setBalances({ base: baseBalance, quote: quoteBalance });
      } catch (error) {
        console.error('Failed to fetch balances:', error);
      }
    };

    updateBalances();
    const interval = setInterval(updateBalances, 10000);
    return () => clearInterval(interval);
  }, [publicKey, pair, getTokenBalance]);

  const percentageButtons = [25, 50, 75, 100];

  const updateAmountByPercentage = (percentage: number) => {
    setPercentageAmount(percentage);
    if (!currentPrice) return;

    const maxAmount = orderSide === 'buy'
      ? balances.quote / currentPrice
      : balances.base;

    setValue('amount', ((maxAmount * percentage) / 100).toString());
  };

  const onSubmit = (values: OrderFormValues) => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to trade',
        variant: 'destructive',
      });
      return;
    }

    if (onOrderSubmit) {
      onOrderSubmit({
        ...values,
        side: orderSide,
        type: orderType,
      });
    }
  };

  const [baseToken, quoteToken] = pair.split('/');

  return (
    <div className="p-4">
      {/* Buy/Sell Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button
          variant={orderSide === 'buy' ? 'default' : 'outline'}
          className={cn(
            'w-full',
            orderSide === 'buy' ? 'bg-green-500 hover:bg-green-600' : ''
          )}
          onClick={() => setOrderSide('buy')}
        >
          Buy
        </Button>
        <Button
          variant={orderSide === 'sell' ? 'default' : 'outline'}
          className={cn(
            'w-full',
            orderSide === 'sell' ? 'bg-red-500 hover:bg-red-600' : ''
          )}
          onClick={() => setOrderSide('sell')}
        >
          Sell
        </Button>
      </div>

      {/* Order Type Tabs */}
      <Tabs value={orderType} onValueChange={(v: any) => setOrderType(v)} className="mb-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="limit">Limit</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="tp_sl">TP/SL</TabsTrigger>
        </TabsList>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Price Input */}
          {orderType !== 'market' && (
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ({quoteToken})</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="any"
                      placeholder={currentPrice?.toString() || '0.00'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Amount Input */}
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount ({baseToken})</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="any"
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Percentage Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {percentageButtons.map(percent => (
              <Button
                key={percent}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  'w-full',
                  percentageAmount === percent ? 'bg-primary text-primary-foreground' : ''
                )}
                onClick={() => updateAmountByPercentage(percent)}
              >
                {percent}%
              </Button>
            ))}
          </div>

          {/* Advanced Options */}
          {mode === 'margin' && (
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="postOnly"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Post Only</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reduceOnly"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Reduce Only</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Order Value */}
          {currentPrice && amount && (
            <div className="text-sm text-muted-foreground">
              Order Value: {(parseFloat(amount) * currentPrice).toFixed(2)} {quoteToken}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className={cn(
              'w-full',
              orderSide === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
            )}
          >
            {orderSide === 'buy' ? 'Buy' : 'Sell'} {baseToken}
          </Button>
        </form>
      </Form>
    </div>
  );
}
