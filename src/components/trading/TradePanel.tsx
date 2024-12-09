import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

interface TradePanelProps {
  theme?: 'light' | 'dark';
}

export const TradePanel: React.FC<TradePanelProps> = ({ theme = 'dark' }) => {
  const { connected } = useWallet();
  const [tradeType, setTradeType] = useState('spot');
  const [orderType, setOrderType] = useState('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sliderValue, setSliderValue] = useState(0);

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-200';

  const tradeTypes = [
    { id: 'spot', label: 'Spot' },
    { id: 'margin', label: 'Margin 10X' },
    { id: 'convert', label: 'Convert' },
  ];

  const orderTypes = [
    { id: 'limit', label: 'Limit' },
    { id: 'market', label: 'Market' },
    { id: 'tp-sl', label: 'TP/SL' },
  ];

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-[#0b0e11]' : 'bg-white'}`}>
      {/* Trade Type Selector */}
      <div className="flex items-center border-b border-gray-800">
        <div className="flex-1 flex">
          {tradeTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setTradeType(type.id)}
              className={`px-4 py-3 text-sm font-medium ${
                tradeType === type.id
                  ? 'text-[#f0b90b] border-b-2 border-[#f0b90b]'
                  : mutedTextColor
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        <button className="px-4 py-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="p-4 pb-0">
        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-800/50 rounded">
          <button
            onClick={() => setSide('buy')}
            className={`py-2 text-center rounded ${
              side === 'buy'
                ? 'bg-[#02c076] text-white'
                : 'text-gray-400'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`py-2 text-center rounded ${
              side === 'sell'
                ? 'bg-[#f6465d] text-white'
                : 'text-gray-400'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Order Type Tabs */}
      <div className="px-4 flex space-x-4 border-b border-gray-800">
        {orderTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setOrderType(type.id)}
            className={`py-3 text-sm ${
              orderType === type.id
                ? 'text-[#f0b90b]'
                : mutedTextColor
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Order Form */}
      <div className="p-4 space-y-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className={mutedTextColor}>Available Balance</span>
              <span className={textColor}>-- USDT</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className={mutedTextColor}>Order Price</span>
              <span className={mutedTextColor}>USDT</span>
            </div>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#161920] rounded p-3 text-right outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className={mutedTextColor}>Qty</span>
              <span className={mutedTextColor}>BTC</span>
            </div>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#161920] rounded p-3 text-right outline-none"
              placeholder="0"
            />
          </div>

          {/* Percentage Slider */}
          <div className="pt-2">
            <div className="flex justify-between mb-2">
              <button 
                className="text-xs text-gray-400 hover:text-white"
                onClick={() => setSliderValue(0)}
              >
                0
              </button>
              <button 
                className="text-xs text-gray-400 hover:text-white"
                onClick={() => setSliderValue(25)}
              >
                25%
              </button>
              <button 
                className="text-xs text-gray-400 hover:text-white"
                onClick={() => setSliderValue(50)}
              >
                50%
              </button>
              <button 
                className="text-xs text-gray-400 hover:text-white"
                onClick={() => setSliderValue(75)}
              >
                75%
              </button>
              <button 
                className="text-xs text-gray-400 hover:text-white"
                onClick={() => setSliderValue(100)}
              >
                100%
              </button>
            </div>
            <Slider
              value={[sliderValue]}
              onValueChange={(value) => setSliderValue(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className={mutedTextColor}>Order Value</span>
              <span className={textColor}>-- USDT</span>
            </div>
            <div className="flex justify-end">
              <span className="text-xs text-gray-500">≈ -- USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Button */}
      {!connected ? (
        <div className="p-4">
          <WalletMultiButton className="w-full" />
        </div>
      ) : (
        <div className="p-4">
          <button
            className={`w-full py-3 rounded font-medium ${
              side === 'buy'
                ? 'bg-[#02c076] text-white'
                : 'bg-[#f6465d] text-white'
            }`}
          >
            {side === 'buy' ? 'Buy' : 'Sell'} BTC
          </button>
        </div>
      )}
    </div>
  );
};
