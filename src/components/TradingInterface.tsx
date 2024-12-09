import React from 'react';
import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderForm } from './trading/OrderForm';
import { OrderBook } from './trading/OrderBook';
import { TradePairSelector } from './trading/TradePairSelector';
import { SolxPositions } from './trading/SolxPositions';
import { MockxPositions } from './trading/MockxPositions';
import { TradeHistory } from './trading/TradeHistory';
import TradingChart from './TradingChart';
import { TradingViewWidget } from './trading/TradingViewWidget';
import { RAYDIUM_POOLS, TOKEN_MINTS, API_ENDPOINTS, RaydiumPriceData } from '@/config/api';
import { raydiumService } from '@/services/raydium';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { FeeCalculator } from '@/utils/feeCalculator';
import { calculateTokenAmount } from '@/utils/tokenCalculator';
import { TradingRewardsCalculator } from '@/utils/tradingRewards';
import {
  Box,
  Grid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { PerpetualProvider } from '../contexts/PerpetualContext';
import { PerpetualTrading } from './perpetuals/PerpetualTrading';
import { PositionManager } from './perpetuals/PositionManager';
import { MarketStats } from './perpetuals/MarketStats';
import { tradingBalanceService } from '@/services/tradingBalanceService';
import { Card, CardContent } from '@/components/ui/card';

interface TradingInterfaceProps {
  onPositionClose?: (positionId: string) => void;
}

const TradingInterface: FC<TradingInterfaceProps> = ({ onPositionClose }) => {
  const [selectedPair, setSelectedPair] = useState('SOLX/USDT');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [baseBalance, setBaseBalance] = useState<number>(0);
  const [quoteBalance, setQuoteBalance] = useState<number>(0);
  const wallet = useWallet();
  const { toast } = useToast();

  useEffect(() => {
    fetchLatestPrice();
    const interval = setInterval(fetchLatestPrice, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [selectedPair]);

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      fetchBalances();
    } else {
      setBaseBalance(0);
      setQuoteBalance(0);
    }
  }, [wallet.connected, wallet.publicKey, selectedPair]);

  const fetchBalances = async () => {
    if (!wallet.publicKey) return;

    const [baseToken, quoteToken] = selectedPair.split('/');
    const walletAddress = wallet.publicKey.toString();

    try {
      const [base, quote] = await Promise.all([
        tradingBalanceService.getBalance(walletAddress, baseToken),
        tradingBalanceService.getBalance(walletAddress, quoteToken)
      ]);

      setBaseBalance(base);
      setQuoteBalance(quote);
    } catch (error) {
      console.error('Error fetching balances:', error);
      setError('Failed to fetch balances');
    }
  };

  const fetchLatestPrice = async () => {
    try {
      const [base, quote] = selectedPair.split('/');
      const priceData = await raydiumService.fetchPriceHistory(base, quote);
      if (priceData.length > 0) {
        const latest = priceData[priceData.length - 1];
        setLastPrice(latest.close);
        
        // Calculate 24h price change
        const prev24h = priceData.find(d => 
          (latest.time as number) - (d.time as number) >= 24 * 60 * 60
        );
        if (prev24h) {
          const change = ((latest.close - prev24h.close) / prev24h.close) * 100;
          setPriceChange24h(change);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching price:', err);
      setError('Unable to fetch latest price');
    }
  };

  const handleTradePairChange = (pair: string) => {
    setSelectedPair(pair);
    setAmount('');
    setPrice('');
    setError(null);
  };

  const validateOrder = () => {
    if (!wallet.connected) {
      setError('Please connect your wallet to trade');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (orderType === 'limit' && (!price || parseFloat(price) <= 0)) {
      setError('Please enter a valid price');
      return false;
    }

    const orderAmount = parseFloat(amount);
    const orderPrice = orderType === 'limit' ? parseFloat(price) : lastPrice || 0;
    const totalCost = orderAmount * orderPrice;

    if (side === 'buy' && totalCost > quoteBalance) {
      setError(`Insufficient ${selectedPair.split('/')[1]} balance`);
      return false;
    }
    if (side === 'sell' && orderAmount > baseBalance) {
      setError(`Insufficient ${selectedPair.split('/')[0]} balance`);
      return false;
    }

    return true;
  };

  const handleTrade = async () => {
    if (!validateOrder() || !wallet.publicKey) return;

    const orderAmount = parseFloat(amount);
    const orderPrice = orderType === 'limit' ? parseFloat(price) : lastPrice || 0;
    const [baseToken, quoteToken] = selectedPair.split('/');
    const walletAddress = wallet.publicKey.toString();

    setIsLoading(true);
    try {
      const success = await tradingBalanceService.executeTrade(
        walletAddress,
        baseToken,
        quoteToken,
        orderAmount,
        orderPrice,
        side === 'buy'
      );

      if (success) {
        toast({
          title: "Trade Successful",
          description: `Successfully ${side} ${orderAmount} ${baseToken} at ${orderPrice} ${quoteToken}`,
        });
        setAmount('');
        setPrice('');
        fetchBalances();
      } else {
        setError('Insufficient balance for trade');
      }
    } catch (err) {
      console.error('Trade error:', err);
      setError('Failed to execute trade');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PerpetualProvider>
      <Box p={4}>
        <Grid templateColumns="3fr 1fr" gap={4}>
          {/* Left Column */}
          <Box>
            {/* TradingView Chart */}
            <Box height="500px" mb={4}>
              <TradingViewWidget symbol="SOLUSD" />
            </Box>

            {/* Market Stats */}
            <MarketStats />

            {/* Position Manager */}
            <Box mt={4}>
              <PositionManager />
            </Box>
          </Box>

          {/* Right Column - Trading Interface */}
          <Box>
            <PerpetualTrading />
            <Box className="flex justify-between items-center">
              <TradePairSelector
                selectedPair={selectedPair}
                onPairChange={handleTradePairChange}
              />
              <Card className="p-2">
                <CardContent className="flex space-x-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedPair.split('/')[0]} Balance
                    </p>
                    <p className="font-medium">{baseBalance.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedPair.split('/')[1]} Balance
                    </p>
                    <p className="font-medium">{quoteBalance.toFixed(4)}</p>
                  </div>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Grid>
      </Box>
    </PerpetualProvider>
  );
};

export default TradingInterface;
