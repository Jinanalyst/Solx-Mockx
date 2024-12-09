import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderForm } from './trading/OrderForm';
import { OrderBook } from './trading/OrderBook';
import { TradePairSelector } from './trading/TradePairSelector';
import { UserPositions } from './trading/UserPositions';
import { TradeHistory } from './trading/TradeHistory';
import TradingChart from './TradingChart';
import { TradingViewWidget } from './trading/TradingViewWidget';
import { RAYDIUM_POOLS, TOKEN_MINTS, API_ENDPOINTS, RaydiumPriceData } from '@/config/api';
import { raydiumService } from '@/services/raydium';

interface TradingInterfaceProps {
  onPositionClose?: (positionId: string) => void;
}

const TradingInterface: FC<TradingInterfaceProps> = ({ onPositionClose }) => {
  const [selectedPair, setSelectedPair] = useState('SOLX/USDC');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const wallet = useWallet();

  const handleTradePairChange = (pair: string) => {
    setSelectedPair(pair);
  };

  const handleOrderSubmit = async () => {
    if (!wallet.connected) {
      // Show connect wallet message
      return;
    }

    try {
      // Implement order submission logic
      console.log('Submitting order:', {
        pair: selectedPair,
        type: orderType,
        side,
        amount,
        price: orderType === 'limit' ? price : 'market',
      });
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Chart Section */}
      <div className="lg:col-span-2 bg-card rounded-lg p-4" style={{ height: '600px' }}>
        <TradingViewWidget 
          symbol={selectedPair.replace('/', '')} 
          theme="dark"
        />
      </div>

      {/* Trading Interface */}
      <div className="space-y-4">
        <TradePairSelector 
          selectedPair={selectedPair} 
          onPairChange={handleTradePairChange} 
        />
        
        <OrderForm
          orderType={orderType}
          setOrderType={setOrderType}
          side={side}
          setSide={setSide}
          amount={amount}
          setAmount={setAmount}
          price={price}
          setPrice={setPrice}
          onSubmit={handleOrderSubmit}
        />

        <OrderBook pair={selectedPair} />
        
        {wallet.connected && (
          <UserPositions onPositionClose={onPositionClose} />
        )}
      </div>
    </div>
  );
};

export default TradingInterface;
