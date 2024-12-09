import { FC, useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { raydiumService } from '@/services/raydium';
import { useTheme } from 'next-themes';

interface TradingChartProps {
  baseSymbol: string;
  quoteSymbol: string;
  height?: number;
}

const TradingChart: FC<TradingChartProps> = ({
  baseSymbol,
  quoteSymbol,
  height = 400
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    const isDarkTheme = theme === 'dark';

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: isDarkTheme ? '#1a1b1e' : '#ffffff' },
        textColor: isDarkTheme ? '#d1d5db' : '#333333',
      },
      grid: {
        vertLines: { color: isDarkTheme ? '#2d2d2d' : '#f0f0f0' },
        horzLines: { color: isDarkTheme ? '#2d2d2d' : '#f0f0f0' },
      },
      width: containerRef.current.clientWidth,
      height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    const volumeHistogram = chart.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Fetch and update data
    const fetchData = async () => {
      const data = await raydiumService.fetchPriceHistory(baseSymbol, quoteSymbol);
      candleSeries.setData(data);
      volumeHistogram.setData(
        data.map(item => ({
          time: item.time,
          value: item.volume,
          color: item.close >= item.open ? '#22c55e80' : '#ef444480',
        }))
      );
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000); // Update every minute

    chartRef.current = chart;

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(intervalId);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [baseSymbol, quoteSymbol, height, theme]);

  return (
    <div className="w-full">
      <div className="text-sm font-semibold mb-2">
        {baseSymbol}/{quoteSymbol} Chart
      </div>
      <div ref={containerRef} />
    </div>
  );
};

export default TradingChart;
