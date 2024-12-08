import { FC, useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { raydiumService } from '@/services/raydium';

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

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      width: containerRef.current.clientWidth,
      height,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const volumeHistogram = chart.addHistogramSeries({
      color: 'rgba(76, 175, 80, 0.5)',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    chartRef.current = chart;

    const fetchAndUpdateData = async () => {
      try {
        const data = await raydiumService.fetchPriceHistory(baseSymbol, quoteSymbol);
        if (data.length > 0) {
          candleSeries.setData(data);
          volumeHistogram.setData(
            data.map(candle => ({
              time: candle.time,
              value: candle.volume,
              color: candle.close >= candle.open ? 'rgba(76, 175, 80, 0.5)' : 'rgba(255, 82, 82, 0.5)',
            }))
          );
          chart.timeScale().fitContent();
        }
      } catch (error) {
        console.error('Error fetching price history:', error);
      }
    };

    fetchAndUpdateData();

    const updateInterval = setInterval(fetchAndUpdateData, 15000);

    return () => {
      clearInterval(updateInterval);
      chart.remove();
    };
  }, [baseSymbol, quoteSymbol, height]);

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
