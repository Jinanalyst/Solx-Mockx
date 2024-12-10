'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { formatNumber } from '@/lib/utils';
import { fetchTokenPrice, fetchTokenOrderbook } from '@/lib/api';

interface AdvancedTradingProps {
  pair: {
    baseToken: {
      address: string;
      symbol: string;
    };
    priceUsd: number;
  };
}

type OrderType = 'limit' | 'market' | 'stopLimit' | 'stopMarket' | 'postOnly' | 'fok' | 'ioc';
type TimeInForce = 'gtc' | 'fok' | 'ioc';
type TriggerType = 'lastPrice' | 'markPrice' | 'indexPrice';

interface OrderSettings {
  type: OrderType;
  timeInForce: TimeInForce;
  postOnly: boolean;
  reduceOnly: boolean;
  triggerType?: TriggerType;
  stopPrice?: number;
  leverage: number;
}

export function AdvancedTrading({ pair }: AdvancedTradingProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  
  // Order form state
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [total, setTotal] = useState<string>('');
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  
  // Advanced settings
  const [settings, setSettings] = useState<OrderSettings>({
    type: 'limit',
    timeInForce: 'gtc',
    postOnly: false,
    reduceOnly: false,
    leverage: 1,
  });

  // Market data
  const [markPrice, setMarkPrice] = useState<number | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [indexPrice, setIndexPrice] = useState<number | null>(null);
  const [bestBid, setBestBid] = useState<number | null>(null);
  const [bestAsk, setBestAsk] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastPriceUpdateId, setLastPriceUpdateId] = useState(0);

  // Percentage buttons for quick amount selection
  const percentages = [25, 50, 75, 100];

  const validateInputs = () => {
    if (!publicKey) {
      setError('Please connect your wallet');
      return false;
    }

    if (settings.type !== 'market') {
      if (!price || parseFloat(price) <= 0) {
        setError('Invalid price');
        return false;
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Invalid amount');
      return false;
    }

    if (settings.type === 'stopLimit' || settings.type === 'stopMarket') {
      if (!settings.stopPrice || settings.stopPrice <= 0) {
        setError('Invalid stop price');
        return false;
      }
    }

    const totalValue = parseFloat(total);
    if (isNaN(totalValue) || totalValue <= 0) {
      setError('Invalid total value');
      return false;
    }

    if (side === 'buy' && totalValue > availableBalance) {
      setError('Insufficient balance');
      return false;
    }

    return true;
  };

  useEffect(() => {
    const updateId = lastPriceUpdateId + 1;
    setLastPriceUpdateId(updateId);

    const fetchPriceData = async () => {
      setIsLoading(true);
      try {
        // Fetch current prices
        const tokenPrice = await fetchTokenPrice(pair.baseToken.address);
        if (tokenPrice && updateId === lastPriceUpdateId) {
          setMarkPrice(tokenPrice);
          setLastPrice(tokenPrice);
          setIndexPrice(tokenPrice);
        }

        // Fetch orderbook for best bid/ask
        const orderbook = await fetchTokenOrderbook(pair.baseToken.address);
        if (orderbook && updateId === lastPriceUpdateId) {
          if (orderbook.bids?.length > 0) setBestBid(orderbook.bids[0].price);
          if (orderbook.asks?.length > 0) setBestAsk(orderbook.asks[0].price);
        }
      } catch (err) {
        if (updateId === lastPriceUpdateId) {
          setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        }
      } finally {
        if (updateId === lastPriceUpdateId) {
          setIsLoading(false);
        }
      }
    };

    fetchPriceData();
    const interval = setInterval(fetchPriceData, 3000);
    return () => clearInterval(interval);
  }, [pair.baseToken.address]);

  const handlePriceChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
      if (value && amount) {
        const total = (parseFloat(value) * parseFloat(amount)).toFixed(6);
        setTotal(total);
      }
    }
  };

  const handleAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (value && price) {
        const total = (parseFloat(value) * parseFloat(price)).toFixed(6);
        setTotal(total);
      }
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validateInputs()) return;

    setIsSubmitting(true);
    try {
      // Implement order submission logic here
      await submitOrder({
        side,
        price: settings.type === 'market' ? markPrice : parseFloat(price),
        amount: parseFloat(amount),
        total: parseFloat(total),
        settings,
      });

      // Reset form
      setAmount('');
      setPrice('');
      setTotal('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    if (!availableBalance || !markPrice) return;
    
    const maxAmount = side === 'buy' 
      ? availableBalance / (markPrice || 0)
      : availableBalance;
    const newAmount = (maxAmount * percentage / 100).toFixed(6);
    setAmount(newAmount);
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 border-l border-border">
      {/* Trading type tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            side === 'buy'
              ? 'bg-green-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium ${
            side === 'sell'
              ? 'bg-red-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order type selector */}
      <div className="mb-4">
        <select
          value={settings.type}
          onChange={(e) => setSettings({ ...settings, type: e.target.value as OrderType })}
          className="w-full bg-muted p-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="limit">Limit</option>
          <option value="market">Market</option>
          <option value="stopLimit">Stop Limit</option>
          <option value="stopMarket">Stop Market</option>
          <option value="postOnly">Post Only</option>
          <option value="fok">Fill or Kill</option>
          <option value="ioc">Immediate or Cancel</option>
        </select>
      </div>

      {/* Price input */}
      {settings.type !== 'market' && (
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-1 block">
            Price
          </label>
          <div className="relative">
            <input
              type="text"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              className="w-full bg-muted p-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
              pattern="\d*\.?\d*"
              disabled={isSubmitting}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              USDC
            </span>
          </div>
        </div>
      )}

      {/* Stop price input for stop orders */}
      {(settings.type === 'stopLimit' || settings.type === 'stopMarket') && (
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mb-1 block">
            Stop Price
          </label>
          <div className="relative">
            <input
              type="number"
              value={settings.stopPrice || ''}
              onChange={(e) => setSettings({ ...settings, stopPrice: parseFloat(e.target.value) })}
              className="w-full bg-muted p-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00"
              step="0.000001"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              USDC
            </span>
          </div>
        </div>
      )}

      {/* Amount input */}
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-1 block">
          Amount
        </label>
        <div className="relative">
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="w-full bg-muted p-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0.00"
            pattern="\d*\.?\d*"
            disabled={isSubmitting}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {pair.baseToken.symbol}
          </span>
        </div>
      </div>

      {/* Percentage buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {percentages.map((percentage) => (
          <button
            key={percentage}
            onClick={() => handlePercentageClick(percentage)}
            className="py-1 px-2 text-sm rounded bg-muted hover:bg-muted/80 text-muted-foreground"
          >
            {percentage}%
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-1 block">
          Total
        </label>
        <div className="relative">
          <input
            type="text"
            value={total}
            readOnly
            disabled
            className="w-full bg-muted p-2 rounded-lg border border-border focus:outline-none"
            placeholder="0.00"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            USDC
          </span>
        </div>
      </div>

      {/* Advanced settings */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">Time in force</label>
          <select
            value={settings.timeInForce}
            onChange={(e) => setSettings({ ...settings, timeInForce: e.target.value as TimeInForce })}
            className="bg-muted p-1 rounded border border-border text-sm"
          >
            <option value="gtc">Good till cancelled</option>
            <option value="fok">Fill or kill</option>
            <option value="ioc">Immediate or cancel</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">Post only</label>
          <input
            type="checkbox"
            checked={settings.postOnly}
            onChange={(e) => setSettings({ ...settings, postOnly: e.target.checked })}
            className="rounded border-border"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-muted-foreground">Reduce only</label>
          <input
            type="checkbox"
            checked={settings.reduceOnly}
            onChange={(e) => setSettings({ ...settings, reduceOnly: e.target.checked })}
            className="rounded border-border"
          />
        </div>
      </div>

      {/* Market prices */}
      <div className="mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Mark Price</span>
          <span>{markPrice ? formatNumber(markPrice, 6) : '-'} USDC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Price</span>
          <span>{lastPrice ? formatNumber(lastPrice, 6) : '-'} USDC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Index Price</span>
          <span>{indexPrice ? formatNumber(indexPrice, 6) : '-'} USDC</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !publicKey}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          isSubmitting
            ? 'bg-muted cursor-not-allowed'
            : side === 'buy'
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Place ${side.toUpperCase()} Order`
        )}
      </button>
    </div>
  );
}
