'use client';

import { useEffect, useRef, memo } from 'react';
import { useTheme } from 'next-themes';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
}

export const TradingViewWidget = memo(({ 
  symbol = 'BTCUSDT',
  interval = 'D',
  theme: themeOverride
}: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme: systemTheme } = useTheme();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      autosize: true,
      symbol: `BINANCE:${symbol}`,
      interval: interval,
      timezone: "Etc/UTC",
      theme: themeOverride || (systemTheme === 'dark' ? 'dark' : 'light'),
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_side_toolbar: false,
      withdateranges: true,
      details: true,
      hotlist: true,
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      drawings: {
        enabled: true,
        tools: {
          Position: {
            enabled: true,
            showInToolbar: true,
            toolbarPosition: 'top'
          }
        }
      }
    };

    script.innerHTML = JSON.stringify(config);

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, systemTheme, themeOverride]);

  return (
    <div ref={containerRef} className="tradingview-widget-container" style={{ height: '100%', width: '100%' }} />
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

export default TradingViewWidget;
