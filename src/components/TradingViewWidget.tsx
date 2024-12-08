'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewProps {
  pair: string;
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

const formatTradingSymbol = (pair: string): string => {
  const [base, quote] = pair.replace(/\s+/g, '').split('/');
  
  const symbolMap: { [key: string]: string } = {
    'SOLX': 'SOLX',
    'BTC': 'BTC',
    'USDT': 'USDT',
    'ETH': 'ETH',
  };

  const baseSymbol = symbolMap[base] || base;
  const quoteSymbol = symbolMap[quote] || quote;

  return `BINANCE:${baseSymbol}${quoteSymbol}`;
}

export function TradingViewWidget({ 
  pair,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const widgetContainer = document.createElement('div');
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/tv.js';
    
    script.onload = () => {
      if (window.TradingView && widgetContainer) {
        new window.TradingView.widget({
          container: widgetContainer,
          symbol: formatTradingSymbol(pair),
          interval: interval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: chartType,
          locale: 'en',
          toolbar_bg: backgroundColor,
          enable_publishing: false,
          allow_symbol_change: true,
          save_image: true,
          height: height,
          width: width,
          studies: indicators,
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          hide_side_toolbar: !showToolbar,
          withdateranges: true,
          hide_volume: false,
          scalesProperties: {
            backgroundColor: backgroundColor,
            lineColor: gridColor,
            textColor: theme === 'dark' ? '#d1d4dc' : '#131722',
          },
          gridProperties: {
            color: gridColor,
          },
          studies_overrides: {
            "volume.volume.color.0": theme === 'dark' ? "#363A45" : "#E91E63",
            "volume.volume.color.1": theme === 'dark' ? "#2196F3" : "#4CAF50",
          },
          overrides: {
            "paneProperties.background": backgroundColor,
            "paneProperties.vertGridProperties.color": gridColor,
            "paneProperties.horzGridProperties.color": gridColor,
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": theme === 'dark' ? '#AAA' : '#555',
          },
        });
      }
    };

    const existingScript = document.querySelector('script[src*="tradingview"]');
    if (existingScript) {
      existingScript.remove();
    }

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove();
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [pair, theme, interval, chartType, backgroundColor, gridColor, indicators, showToolbar, height, width]);

  return (
    <div 
      ref={containerRef} 
      style={{ height, width }}
      className="rounded-lg overflow-hidden"
    />
  );
}
