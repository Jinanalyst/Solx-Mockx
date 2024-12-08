'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewProps {
  pair?: string;
  theme?: 'light' | 'dark';
  interval?: '1' | '3' | '5' | '15' | '30' | '60' | '120' | '240' | '1D' | '1W' | '1M';
  chartType?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  height?: string;
  width?: string;
  indicators?: string[];
  showToolbar?: boolean;
  backgroundColor?: string;
  gridColor?: string;
}

const DEFAULT_PAIR = 'SOL/USDC';
const CONTAINER_ID = 'tradingview_widget';

const formatTradingSymbol = (pair: string = DEFAULT_PAIR): string => {
  const [base, quote] = pair.replace(/\s+/g, '').split('/');
  
  const symbolMap: { [key: string]: string } = {
    'SOL': 'SOL',
    'SOLX': 'SOLX',
    'BTC': 'BTC',
    'USDC': 'USDC',
    'USDT': 'USDT',
    'ETH': 'ETH',
  };

  const baseSymbol = symbolMap[base] || base;
  const quoteSymbol = symbolMap[quote] || quote;

  // Default to Binance for now, but we can add more exchanges later
  return `BINANCE:${baseSymbol}${quoteSymbol}`;
};

export function TradingViewWidget({ 
  pair = DEFAULT_PAIR,
  theme = 'dark',
  interval = '15',
  chartType = '1',
  height = '500px',
  width = '100%',
  indicators = ['RSI', 'MASimple@tv-basicstudies', 'MACD@tv-basicstudies'],
  showToolbar = true,
  backgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff',
  gridColor = theme === 'dark' ? '#363c4e' : '#f0f3fa',
}: TradingViewProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTradingViewScript = () => {
      return new Promise<void>((resolve) => {
        if (window.TradingView) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const initWidget = async () => {
      if (!container.current) return;

      try {
        await loadTradingViewScript();
        setIsScriptLoaded(true);

        const symbol = formatTradingSymbol(pair);
        
        if (container.current) {
          new window.TradingView.widget({
            container_id: CONTAINER_ID,
            symbol,
            interval,
            theme,
            style: chartType,
            locale: 'en',
            toolbar_bg: backgroundColor,
            enable_publishing: false,
            allow_symbol_change: true,
            save_image: false,
            height,
            width,
            studies: indicators,
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
            hide_side_toolbar: !showToolbar,
            backgroundColor,
            gridColor,
            library_path: '/charting_library/',
            charts_storage_url: 'https://saveload.tradingview.com',
            charts_storage_api_version: '1.1',
            client_id: 'tradingview.com',
            user_id: 'public_user',
            fullscreen: false,
            autosize: true,
            studies_overrides: {},
            overrides: {
              'mainSeriesProperties.candleStyle.upColor': '#26a69a',
              'mainSeriesProperties.candleStyle.downColor': '#ef5350',
              'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
              'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350',
            },
          });
        }
      } catch (error) {
        console.error('Failed to initialize TradingView widget:', error);
      }
    };

    if (!isScriptLoaded) {
      initWidget();
    }

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [pair, theme, interval, chartType, height, width, indicators, showToolbar, backgroundColor, gridColor, isScriptLoaded]);

  return (
    <div 
      ref={container} 
      id={CONTAINER_ID}
      style={{ height, width }}
      className="w-full h-full"
    />
  );
}
