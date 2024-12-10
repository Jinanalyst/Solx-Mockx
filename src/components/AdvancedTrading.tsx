'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { usePrice } from '@/contexts/PriceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Connection, Transaction, PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
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

interface OrderSettings {
  type: 'market' | 'limit' | 'stopLimit' | 'stopMarket';
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

interface OrderData {
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stopLimit' | 'stopMarket';
  price: number;
  amount: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
}

const formSchema = z.object({
  price: z.string().refine(
    (val) => !val || (Number(val) > 0 && !isNaN(Number(val))),
    { message: 'Price must be a positive number' }
  ),
  amount: z.string().refine(
    (val) => Number(val) > 0 && !isNaN(Number(val)),
    { message: 'Amount must be a positive number' }
  ),
  total: z.string().refine(
    (val) => !val || (Number(val) > 0 && !isNaN(Number(val))),
    { message: 'Total must be a positive number' }
  ),
  type: z.enum(['market', 'limit', 'stopLimit', 'stopMarket']),
  stopPrice: z.string().refine(
    (val) => !val || (Number(val) > 0 && !isNaN(Number(val))),
    { message: 'Stop price must be a positive number' }
  ).optional(),
  timeInForce: z.enum(['GTC', 'IOC', 'FOK']).optional(),
});

// Mock trading pairs
const TRADING_PAIRS = {
  'BTCUSDT': {
    baseDecimals: 6,
    quoteDecimals: 6,
    minOrderSize: 0.0001,
    tickSize: 0.1,
  }
} as const;

async function submitOrder(orderData: OrderData): Promise<boolean> {
  try {
    // For mock trading, we'll just simulate order submission
    // In a real implementation, this would interact with your trading backend or smart contract
    
    // Validate order data
    const tradingPair = TRADING_PAIRS['BTCUSDT'];
    if (!tradingPair) {
      throw new Error('Invalid trading pair');
    }

    // Check minimum order size
    if (orderData.amount < tradingPair.minOrderSize) {
      throw new Error(`Order size must be at least ${tradingPair.minOrderSize}`);
    }

    // Check price tick size for limit orders
    if (orderData.type !== 'market') {
      const priceRemainder = orderData.price % tradingPair.tickSize;
      if (priceRemainder !== 0) {
        throw new Error(`Price must be a multiple of ${tradingPair.tickSize}`);
      }
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log order details
    console.log('Order submitted:', {
      ...orderData,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
}

export function AdvancedTrading() {
  const { connected, publicKey, balance: availableBalance } = useWallet();
  const { getPrice, getBid, getAsk, isConnected: isPriceConnected } = usePrice();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: '',
      amount: '',
      total: '',
      type: 'limit',
      timeInForce: 'GTC',
    },
  });

  const { watch, setValue, reset } = form;
  const formValues = watch();

  const updateTotal = useCallback(() => {
    const price = Number(formValues.price);
    const amount = Number(formValues.amount);
    if (!isNaN(price) && !isNaN(amount) && price > 0 && amount > 0) {
      setValue('total', (price * amount).toFixed(6));
    } else {
      setValue('total', '');
    }
  }, [formValues.price, formValues.amount, setValue]);

  const handlePriceChange = useCallback((value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setValue('price', value);
      updateTotal();
    }
  }, [setValue, updateTotal]);

  const handleAmountChange = useCallback((value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setValue('amount', value);
      updateTotal();
    }
  }, [setValue, updateTotal]);

  const handlePercentageClick = useCallback((percentage: number) => {
    const currentPrice = getPrice('BTCUSDT');
    if (!availableBalance || !currentPrice) return;
    
    const maxAmount = side === 'buy' 
      ? availableBalance / currentPrice
      : availableBalance;
    
    const newAmount = (maxAmount * percentage / 100).toFixed(6);
    setValue('amount', newAmount);
    updateTotal();
  }, [availableBalance, getPrice, side, setValue, updateTotal]);

  const validateOrder = useCallback(() => {
    if (!connected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to trade',
        variant: 'destructive',
      });
      return false;
    }

    if (!isPriceConnected) {
      toast({
        title: 'Price Feed Error',
        description: 'Unable to get current market prices',
        variant: 'destructive',
      });
      return false;
    }

    const total = Number(formValues.total);
    if (side === 'buy' && total > availableBalance) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough balance for this trade',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  }, [connected, isPriceConnected, formValues.total, side, availableBalance]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!validateOrder()) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        side,
        type: values.type,
        price: values.type === 'market' ? getPrice('BTCUSDT') : Number(values.price),
        amount: Number(values.amount),
        stopPrice: values.stopPrice ? Number(values.stopPrice) : undefined,
        timeInForce: values.timeInForce,
      };

      await submitOrder(orderData);

      toast({
        title: 'Order Submitted',
        description: `Successfully placed ${side} order`,
      });

      reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit order';
      toast({
        title: 'Order Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update price when market data changes
  useEffect(() => {
    if (formValues.type === 'market') {
      const currentPrice = side === 'buy' ? getBid('BTCUSDT') : getAsk('BTCUSDT');
      setValue('price', currentPrice.toString());
      updateTotal();
    }
  }, [formValues.type, side, getBid, getAsk, setValue, updateTotal]);

  const orderTypeOptions = useMemo(() => [
    { value: 'market', label: 'Market' },
    { value: 'limit', label: 'Limit' },
    { value: 'stopLimit', label: 'Stop Limit' },
    { value: 'stopMarket', label: 'Stop Market' },
  ], []);

  const timeInForceOptions = useMemo(() => [
    { value: 'GTC', label: 'Good Till Cancel' },
    { value: 'IOC', label: 'Immediate or Cancel' },
    { value: 'FOK', label: 'Fill or Kill' },
  ], []);

  return (
    <div className="p-4 bg-background rounded-lg border border-border">
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => setSide('buy')}
          variant={side === 'buy' ? 'default' : 'outline'}
          className={cn(
            'flex-1',
            side === 'buy' && 'bg-green-500 hover:bg-green-600'
          )}
        >
          Buy
        </Button>
        <Button
          onClick={() => setSide('sell')}
          variant={side === 'sell' ? 'default' : 'outline'}
          className={cn(
            'flex-1',
            side === 'sell' && 'bg-red-500 hover:bg-red-600'
          )}
        >
          Sell
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select order type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {orderTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {(formValues.type === 'stopLimit' || formValues.type === 'stopMarket') && (
            <FormField
              control={form.control}
              name="stopPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      pattern="\d*\.?\d*"
                      placeholder="Enter stop price"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {formValues.type !== 'market' && (
            <FormField
              control={form.control}
              name="timeInForce"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time In Force</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time in force" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeInForceOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    pattern="\d*\.?\d*"
                    placeholder="Enter price"
                    disabled={formValues.type === 'market' || isSubmitting}
                    onChange={(e) => handlePriceChange(e.target.value)}
                  />
                </FormControl>
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
                    {...field}
                    type="text"
                    pattern="\d*\.?\d*"
                    placeholder="Enter amount"
                    disabled={isSubmitting}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percentage) => (
              <Button
                key={percentage}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePercentageClick(percentage)}
                disabled={isSubmitting}
              >
                {percentage}%
              </Button>
            ))}
          </div>

          <FormField
            control={form.control}
            name="total"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    readOnly
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className={cn(
              'w-full',
              side === 'buy'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600',
              'text-white'
            )}
            disabled={isSubmitting || !connected}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </div>
            ) : (
              `Place ${side.toUpperCase()} Order`
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
