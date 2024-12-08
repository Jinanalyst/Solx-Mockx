import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TradePanelProps {
  theme?: 'light' | 'dark';
}

export const TradePanel: React.FC<TradePanelProps> = ({ theme = 'dark' }) => {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState('trade');
  const [orderType, setOrderType] = useState('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-[#0b0e11]' : 'bg-white'}`}>
      {/* Main Tabs */}
      <Tabs defaultValue="trade" className="w-full">
        <TabsList className="w-full border-b border-gray-800">
          <TabsTrigger 
            value="trade"
            className={`flex-1 ${activeTab === 'trade' ? 'text-[#f7a600]' : mutedTextColor}`}
            onClick={() => setActiveTab('trade')}
          >
            Trade
          </TabsTrigger>
          <TabsTrigger 
            value="current-orders"
            className={`flex-1 ${activeTab === 'current-orders' ? 'text-[#f7a600]' : mutedTextColor}`}
            onClick={() => setActiveTab('current-orders')}
          >
            Current Orders (0)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trade" className="p-4">
          {/* Order Type Tabs */}
          <div className="flex border-b border-gray-800 mb-4">
            <button
              className={`px-4 py-2 text-sm ${
                orderType === 'limit' ? 'text-[#f7a600] border-b-2 border-[#f7a600]' : mutedTextColor
              }`}
              onClick={() => setOrderType('limit')}
            >
              Limit & Market Orders
            </button>
            <button
              className={`px-4 py-2 text-sm ${
                orderType === 'tp-sl' ? 'text-[#f7a600] border-b-2 border-[#f7a600]' : mutedTextColor
              }`}
              onClick={() => setOrderType('tp-sl')}
            >
              TP/SL Order
            </button>
          </div>

          {/* Order Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSide('buy')}
                className={`py-2 px-4 rounded ${
                  side === 'buy'
                    ? 'bg-[#02c076] text-white'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setSide('sell')}
                className={`py-2 px-4 rounded ${
                  side === 'sell'
                    ? 'bg-[#f6465d] text-white'
                    : theme === 'dark'
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Order Fields */}
            <div className="space-y-2">
              <div className={`p-3 rounded border ${borderColor}`}>
                <div className="flex justify-between mb-1">
                  <span className={mutedTextColor}>Price</span>
                  <span className={mutedTextColor}>USDT</span>
                </div>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-transparent text-right outline-none"
                  placeholder="0"
                />
              </div>

              <div className={`p-3 rounded border ${borderColor}`}>
                <div className="flex justify-between mb-1">
                  <span className={mutedTextColor}>Amount</span>
                  <span className={mutedTextColor}>BTC</span>
                </div>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-transparent text-right outline-none"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className={mutedTextColor}>Available</span>
                <span className={textColor}>0 USDT</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="current-orders" className="p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <button className={`px-4 py-2 text-sm rounded ${hoverBg}`}>
                Limit & Market Orders
              </button>
              <button className={`px-4 py-2 text-sm rounded ${hoverBg}`}>
                TP/SL Order
              </button>
              <button className={`px-4 py-2 text-sm rounded ${hoverBg}`}>
                Conditional Order
              </button>
              <button className={`px-4 py-2 text-sm rounded ${hoverBg}`}>
                OCO
              </button>
            </div>

            <div className={`text-center py-8 ${mutedTextColor}`}>
              {connected ? (
                <span>Please add your orders here.</span>
              ) : (
                <span>Please Log In or Sign Up first.</span>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Connect Wallet / Trade Button */}
      <div className="mt-auto p-4">
        {!connected ? (
          <WalletMultiButton className="w-full" />
        ) : (
          <button
            className={`w-full py-3 rounded font-medium ${
              side === 'buy'
                ? 'bg-[#02c076] text-white'
                : 'bg-[#f6465d] text-white'
            }`}
          >
            {side === 'buy' ? 'Buy' : 'Sell'} BTC
          </button>
        )}
      </div>
    </div>
  );
};
