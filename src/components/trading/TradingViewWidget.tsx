'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { useTheme } from 'next-themes';
import { binanceService } from '@/services/binance';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewWidgetProps {
  symbol?: string;
}

export const TradingViewWidget = memo(({ symbol = 'BTCUSDT' }: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    // Get initial price
    binanceService.getCurrentPrice().then(setCurrentPrice).catch(console.error);

    // Subscribe to real-time price updates
    const priceCallback = (price: number) => {
      setCurrentPrice(price);
    };
    
    binanceService.subscribeToPriceUpdates('btcusdt', priceCallback);
    
    return () => {
      binanceService.unsubscribeFromPriceUpdates('btcusdt', priceCallback);
    };
  }, []);

  useEffect(() => {
    const loadTradingViewScript = async () => {
      if (typeof window.TradingView !== 'undefined') {
        createWidget();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = createWidget;
      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };

    loadTradingViewScript();
  }, [theme]);

  function createWidget() {
    if (!containerRef.current || typeof window.TradingView === 'undefined') return;

    // Clean up any existing widgets
    containerRef.current.innerHTML = '';

    const widget = new window.TradingView.widget({
      container: containerRef.current,
      symbol: 'BINANCE:BTCUSDT',
      interval: '1',
      timezone: 'Etc/UTC',
      theme: theme === 'dark' ? 'dark' : 'light',
      style: '1',
      locale: 'en',
      toolbar_bg: theme === 'dark' ? '#1a1b1e' : '#f8f9fa',
      enable_publishing: false,
      allow_symbol_change: false,
      save_image: false,
      studies: ['MASimple@tv-basicstudies', 'RSI@tv-basicstudies'],
      width: '100%',
      height: '100%',
      hide_side_toolbar: false,
      hide_legend: false,
      withdateranges: true,
      details: true,
      hotlist: true,
      calendar: true,
      show_popup_button: true,
      popup_width: '1000',
      popup_height: '650',
      disabled_features: [
        'header_symbol_search',
        'symbol_search_hot_key',
        'header_compare'
      ],
      enabled_features: ['hide_left_toolbar_by_default']
    });
  }

  return (
    <div className="w-full h-full min-h-[500px] relative">
      {currentPrice && (
        <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg z-10">
          BTCUSDT: ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

export default TradingViewWidget;
