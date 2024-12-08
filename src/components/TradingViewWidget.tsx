'use client';

import React, { useEffect, useRef } from 'react';
import { formatTradingPair } from '@/utils/tradingView';

export interface TradingViewWidgetProps {
  theme?: 'light' | 'dark';
  symbol?: string;
  interval?: string;
  container?: string;
  width?: string;
  height?: string;
}

let tvScriptLoadingPromise: Promise<void>;

export default function TradingViewWidget({ 
  theme = 'dark', 
  symbol = 'BTCUSDT',
  interval = 'D',
  container = 'tradingview_widget',
  width = '100%',
  height = '100%'
}: TradingViewWidgetProps) {
  const onLoadScriptRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = resolve as () => void;
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById(container) && 'TradingView' in window) {
        const [base, quote] = symbol.match(/([A-Z]+)/g) || ['BTC', 'USDT'];
        const formattedSymbol = formatTradingPair(base, quote);

        new (window as any).TradingView.widget({
          autosize: true,
          symbol: formattedSymbol,
          interval: interval,
          timezone: "Etc/UTC",
          theme: theme,
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: container,
          hide_side_toolbar: false,
          studies: [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies"
          ],
          save_image: false,
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
        });
      }
    }
  }, [theme, symbol, interval, container]);

  return (
    <div className='tradingview-widget-container' style={{ height, width }}>
      <div id={container} style={{ height: 'calc(100% - 32px)', width: '100%' }} />
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener noreferrer" target="_blank">
          <span className="blue-text">Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
}
