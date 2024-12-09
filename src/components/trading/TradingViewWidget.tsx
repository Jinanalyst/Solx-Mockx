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
}

export const TradingViewWidget = memo(({ symbol = 'BTCUSDT' }: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      autosize: true,
      symbol: `BINANCE:${symbol}`,
      interval: "D",
      timezone: "Etc/UTC",
      theme: theme === 'dark' ? 'dark' : 'light',
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
          },
          'Stop & Target': {
            enabled: true,
            showInToolbar: true,
            toolbarPosition: 'top'
          }
        }
      },
      overlays: {
        enabled: true,
        default: []
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
  }, [theme, symbol]);

  return (
    <div className="w-full h-full min-h-[400px]">
      <div className="tradingview-widget-container" ref={containerRef} />
    </div>
  );
});

TradingViewWidget.displayName = 'TradingViewWidget';

export default TradingViewWidget;
