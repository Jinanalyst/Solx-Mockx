'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTradingContext, OrderType, OrderSide } from '@/contexts/TradingContext';
import { TradePairSelector } from './TradePairSelector';
import { TRADING_CONFIG, calculateLiquidationPrice } from '@/config/trading';

const orderSchema = z.object({
  market: z.string(),
  side: z.enum(['BUY', 'SELL']),
  type: z.enum(['MARKET', 'LIMIT', 'STOP_LIMIT', 'OCO']),
  size: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Size must be a positive number',
  }),
  price: z.string().optional(),
  stopPrice: z.string().optional(),
  limitPrice: z.string().optional(),
  leverage: z.number().min(1).max(20),
  postOnly: z.boolean().optional(),
  reduceOnly: z.boolean().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const MARKETS = [
  { value: 'SOL-PERP', label: 'SOL-PERP' },
  { value: 'BTC-PERP', label: 'BTC-PERP' },
  { value: 'ETH-PERP', label: 'ETH-PERP' },
];

type OrderFormProps = {
  type: 'spot' | 'margin' | 'futures';
  side: 'buy' | 'sell';
  amount: string;
  price: string;
  leverage: number;
  onTypeChange: (type: 'spot' | 'margin' | 'futures') => void;
  onSideChange: (side: 'buy' | 'sell') => void;
  onAmountChange: (amount: string) => void;
  onPriceChange: (price: string) => void;
  onLeverageChange: (leverage: number) => void;
  onSubmit: () => void;
};

export function OrderForm({
  type,
  side,
  amount,
  price,
  leverage,
  onTypeChange,
  onSideChange,
  onAmountChange,
  onPriceChange,
  onLeverageChange,
  onSubmit
}: OrderFormProps) {
  const { toast } = useToast();
  const {
    placeMarketOrder,
    placeLimitOrder,
    placeStopLimitOrder,
    placeOCOOrder,
    markPrice,
    availableBalance,
  } = useTradingContext();

  const [activeTab, setActiveTab] = useState<OrderType>('MARKET');
  const [selectedPair, setSelectedPair] = useState('SOL/USDC');

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      market: selectedPair,
      side: 'BUY',
      type: 'MARKET',
      size: '',
      leverage: 1,
      postOnly: false,
      reduceOnly: false,
    },
  });

  useEffect(() => {
    form.setValue('market', selectedPair);
  }, [selectedPair, form]);

  const onSubmitForm = async (data: OrderFormData) => {
    try {
      let orderId: string;

      // Convert string values to numbers
      const orderParams: any = {
        ...data,
        size: parseFloat(data.size),
        price: data.price ? parseFloat(data.price) : undefined,
        stopPrice: data.stopPrice ? parseFloat(data.stopPrice) : undefined,
        limitPrice: data.limitPrice ? parseFloat(data.limitPrice) : undefined,
      };

      switch (data.type) {
        case 'MARKET':
          orderId = await placeMarketOrder(orderParams);
          break;
        case 'LIMIT':
          if (!orderParams.price) throw new Error('Price is required for limit orders');
          orderId = await placeLimitOrder(orderParams);
          break;
        case 'STOP_LIMIT':
          if (!orderParams.stopPrice || !orderParams.limitPrice) {
            throw new Error('Stop price and limit price are required for stop-limit orders');
          }
          orderId = await placeStopLimitOrder(orderParams);
          break;
        case 'OCO':
          if (!orderParams.price || !orderParams.stopPrice || !orderParams.limitPrice) {
            throw new Error('Price, stop price, and limit price are required for OCO orders');
          }
          orderId = await placeOCOOrder(orderParams);
          break;
        default:
          throw new Error('Invalid order type');
      }

      toast({
        title: 'Order placed successfully',
        description: `Order ID: ${orderId}`,
      });

      form.reset();
    } catch (error) {
      console.error('Failed to place order:', error);
      toast({
        title: 'Failed to place order',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  const updateLeverageValue = (value: number[]) => {
    form.setValue('leverage', value[0]);
  };

  const calculateFees = useCallback(() => {
    const size = form.watch('size');
    const leverage = form.watch('leverage');
    const currentPrice = markPrice[selectedPair];

    if (!size || !leverage || !currentPrice) return null;

    return TRADING_CONFIG.feeCalculator.calculateTradingFee({
      baseSize: parseFloat(size),
      leverage: leverage,
      assetPrice: currentPrice,
    });
  }, [form.watch('size'), form.watch('leverage'), markPrice, selectedPair]);

  const fees = useMemo(() => calculateFees(), [calculateFees]);

  const totalCost = useMemo(() => {
    const size = form.watch('size');
    const leverage = form.watch('leverage');
    const currentPrice = markPrice[selectedPair];

    if (!size || !leverage || !currentPrice) return 0;
    const positionValue = parseFloat(size) * currentPrice;
    const requiredMargin = positionValue / leverage;
    const tradingFees = fees?.feeInUSD || 0;
    return requiredMargin + tradingFees;
  }, [form.watch('size'), form.watch('leverage'), markPrice, selectedPair, fees]);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <TradePairSelector
          selectedPair={selectedPair}
          onPairSelect={setSelectedPair}
        />
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrderType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="MARKET">Market</TabsTrigger>
          <TabsTrigger value="LIMIT">Limit</TabsTrigger>
          <TabsTrigger value="STOP_LIMIT">Stop Limit</TabsTrigger>
          <TabsTrigger value="OCO">OCO</TabsTrigger>
        </TabsList>

        <div className="mt-6 mb-6">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={side === 'buy' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => {
                onSideChange('buy');
                form.setValue('side', 'BUY');
              }}
            >
              Buy/Long
            </Button>
            <Button
              variant={side === 'sell' ? 'default' : 'outline'}
              className="w-full"
              onClick={() => {
                onSideChange('sell');
                form.setValue('side', 'SELL');
              }}
            >
              Sell/Short
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-6">
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Enter size"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {activeTab !== 'MARKET' && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter limit price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(activeTab === 'STOP_LIMIT' || activeTab === 'OCO') && (
              <FormField
                control={form.control}
                name="stopPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter stop price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {activeTab === 'STOP_LIMIT' && (
              <FormField
                control={form.control}
                name="limitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Enter limit price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-2">
              <FormLabel>Leverage: {form.watch('leverage')}x</FormLabel>
              <Slider
                defaultValue={[1]}
                max={20}
                min={1}
                step={1}
                onValueChange={updateLeverageValue}
              />
            </div>

            <div className="space-y-4">
              {activeTab !== 'MARKET' && (
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
              )}

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

            <div className="grid gap-2">
              <Label>Order Summary</Label>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <span className="text-muted-foreground">Position Size:</span>
                <span>{form.watch('size') ? `${form.watch('size')} SOL` : '-'}</span>
                
                <span className="text-muted-foreground">Leverage:</span>
                <span>{form.watch('leverage')}x</span>
                
                <span className="text-muted-foreground">Required Margin:</span>
                <span>{totalCost ? `$${totalCost.toFixed(2)}` : '-'}</span>
                
                <span className="text-muted-foreground">Trading Fee:</span>
                <span>{fees ? TRADING_CONFIG.feeCalculator.formatFeeForDisplay(fees) : '-'}</span>
                
                <span className="text-muted-foreground">Liquidation Price:</span>
                <span>
                  {form.watch('size') && form.watch('leverage') && markPrice && selectedPair
                    ? `$${calculateLiquidationPrice(
                        markPrice[selectedPair],
                        form.watch('leverage'),
                        side === 'buy'
                      ).toFixed(2)}`
                    : '-'}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                variant={side === 'buy' ? 'default' : 'destructive'}
              >
                {side === 'buy' ? 'Buy/Long' : 'Sell/Short'} {form.watch('market')}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </Card>
  );
}
