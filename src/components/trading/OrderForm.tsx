import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import TokenService from '@/services/tokenService';
import { formatUSD } from '@/utils/format';
import { logger } from '@/utils/logger';

interface OrderFormProps {
  onError: (message: string) => void;
}

export function OrderForm({ onError }: OrderFormProps) {
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const tokenService = TokenService.getInstance();

  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!publicKey) {
      onError('Please connect your wallet');
      return;
    }

    const fetchBalances = async () => {
      try {
        setLoading(true);
        const solBalance = await tokenService.getSolBalance(publicKey.toString());
        setBalance(solBalance);
      } catch (error) {
        logger.error('Error fetching balances:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch balances',
          variant: 'destructive',
        });
        onError('Failed to fetch balances');
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [publicKey, tokenService, onError, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      onError('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      // Submit order logic here
      toast({
        title: 'Success',
        description: `${side.charAt(0).toUpperCase() + side.slice(1)} order placed successfully`,
      });
    } catch (error) {
      logger.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to place order',
        variant: 'destructive',
      });
      onError('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <Tabs value={orderType} onValueChange={(value) => setOrderType(value as 'limit' | 'market')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="limit">Limit</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant={side === 'buy' ? 'default' : 'outline'}
          onClick={() => setSide('buy')}
          className="w-full"
        >
          Buy
        </Button>
        <Button
          type="button"
          variant={side === 'sell' ? 'default' : 'outline'}
          onClick={() => setSide('sell')}
          className="w-full"
        >
          Sell
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.000001"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      {orderType === 'limit' && (
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Processing...' : `${side.charAt(0).toUpperCase() + side.slice(1)} SOLX`}
      </Button>
    </form>
  );
}
