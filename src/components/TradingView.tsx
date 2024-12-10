'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineStyle
} from 'lightweight-charts';
import { fetchTokenOHLC } from '@/lib/api';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  IndicatorData
} from '@/lib/indicators';

interface ChartContainerProps {
  pair?: string;
}

interface Indicator {
  name: string;
  series: ISeriesApi<'Line'>;
  visible: boolean;
  color: string;
}

export function TradingView({ pair = 'SOL' }: ChartContainerProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorsRef = useRef<{ [key: string]: Indicator }>({});
  
  const [timeframe, setTimeframe] = useState<string>('1h');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeIndicators, setActiveIndicators] = useState<Set<string>>(new Set(['EMA']));
  const [error, setError] = useState<string | null>(null);

  const timeframes = [
    { label: '5m', value: '5' },
    { label: '15m', value: '15' },
    { label: '1h', value: '60' },
    { label: '4h', value: '240' },
    { label: '1d', value: '1D' },
  ];

  const indicators = [
    { label: 'EMA', value: 'EMA', color: '#2962FF' },
    { label: 'SMA', value: 'SMA', color: '#FF6B6B' },
    { label: 'RSI', value: 'RSI', color: '#33CC33' },
    { label: 'MACD', value: 'MACD', color: '#FF9933' },
    { label: 'BB', value: 'BB', color: '#9966FF' },
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current?.clientWidth || 600,
          height: chartContainerRef.current?.clientHeight || 400,
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
    });

    chartRef.current = chart;
    const candlestickSeries = chart.addCandlestickSeries();
    candlestickSeriesRef.current = candlestickSeries;
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    volumeSeriesRef.current = volumeSeries;

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      indicatorsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTokenOHLC(pair, timeframe);
        if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

        candlestickSeriesRef.current.setData(data.ohlc);
        volumeSeriesRef.current.setData(data.volume);
        updateIndicators(data.ohlc);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [pair, timeframe]);

  const updateIndicators = (data: CandlestickData[]) => {
    if (!chartRef.current || !data.length) return;

    // Remove existing indicators
    Object.values(indicatorsRef.current).forEach(indicator => {
      if (chartRef.current) {
        chartRef.current.removeSeries(indicator.series);
      }
    });
    indicatorsRef.current = {};

    try {
      activeIndicators.forEach(indicatorName => {
        switch (indicatorName) {
          case 'EMA':
            const ema = calculateEMA(data, 20);
            if (!chartRef.current) return;
            const emaSeries = chartRef.current.addLineSeries({
              color: '#2962FF',
              lineWidth: 2,
              title: 'EMA 20',
            });
            emaSeries.setData(ema);
            indicatorsRef.current['EMA'] = {
              name: 'EMA',
              series: emaSeries,
              visible: true,
              color: '#2962FF'
            };
            break;

          case 'SMA':
            const sma = calculateSMA(data, 20);
            if (!chartRef.current) return;
            const smaSeries = chartRef.current.addLineSeries({
              color: '#FF6B6B',
              lineWidth: 2,
              title: 'SMA 20',
            });
            smaSeries.setData(sma);
            indicatorsRef.current['SMA'] = {
              name: 'SMA',
              series: smaSeries,
              visible: true,
              color: '#FF6B6B'
            };
            break;

          case 'RSI':
            const rsi = calculateRSI(data);
            if (!chartRef.current) return;
            const rsiSeries = chartRef.current.addLineSeries({
              color: '#33CC33',
              lineWidth: 2,
              title: 'RSI',
              priceFormat: {
                type: 'custom',
                minMove: 0.01,
                formatter: (price: number) => price.toFixed(2),
              },
            });
            rsiSeries.setData(rsi);
            indicatorsRef.current['RSI'] = {
              name: 'RSI',
              series: rsiSeries,
              visible: true,
              color: '#33CC33'
            };
            break;

          case 'MACD':
            const macdData = calculateMACD(data);
            if (!chartRef.current) return;
            const macdSeries = chartRef.current.addLineSeries({
              color: '#FF9933',
              lineWidth: 2,
              title: 'MACD',
              priceFormat: {
                type: 'custom',
                minMove: 0.01,
                formatter: (price: number) => price.toFixed(2),
              },
            });
            const signalSeries = chartRef.current.addLineSeries({
              color: '#9966FF',
              lineWidth: 2,
              title: 'Signal',
              priceFormat: {
                type: 'custom',
                minMove: 0.01,
                formatter: (price: number) => price.toFixed(2),
              },
            });
            macdSeries.setData(macdData.macd);
            signalSeries.setData(macdData.signal);
            indicatorsRef.current['MACD'] = {
              name: 'MACD',
              series: macdSeries,
              visible: true,
              color: '#FF9933'
            };
            indicatorsRef.current['Signal'] = {
              name: 'Signal',
              series: signalSeries,
              visible: true,
              color: '#9966FF'
            };
            break;

          case 'BB':
            const bb = calculateBollingerBands(data);
            if (!chartRef.current) return;
            const upperSeries = chartRef.current.addLineSeries({
              color: '#9966FF',
              lineWidth: 1,
              lineStyle: LineStyle.Dotted,
              title: 'BB Upper',
            });
            const middleSeries = chartRef.current.addLineSeries({
              color: '#9966FF',
              lineWidth: 1,
              title: 'BB Middle',
            });
            const lowerSeries = chartRef.current.addLineSeries({
              color: '#9966FF',
              lineWidth: 1,
              lineStyle: LineStyle.Dotted,
              title: 'BB Lower',
            });
            upperSeries.setData(bb.upper);
            middleSeries.setData(bb.middle);
            lowerSeries.setData(bb.lower);
            indicatorsRef.current['BB_Upper'] = {
              name: 'BB Upper',
              series: upperSeries,
              visible: true,
              color: '#9966FF'
            };
            indicatorsRef.current['BB_Middle'] = {
              name: 'BB Middle',
              series: middleSeries,
              visible: true,
              color: '#9966FF'
            };
            indicatorsRef.current['BB_Lower'] = {
              name: 'BB Lower',
              series: lowerSeries,
              visible: true,
              color: '#9966FF'
            };
            break;
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate indicators');
    }
  };

  const toggleIndicator = (indicatorName: string) => {
    const newActiveIndicators = new Set(activeIndicators);
    if (newActiveIndicators.has(indicatorName)) {
      newActiveIndicators.delete(indicatorName);
    } else {
      newActiveIndicators.add(indicatorName);
    }
    setActiveIndicators(newActiveIndicators);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1 text-sm rounded ${
                timeframe === tf.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {indicators.map((indicator) => (
            <button
              key={indicator.value}
              onClick={() => toggleIndicator(indicator.value)}
              className={`px-3 py-1 text-sm rounded ${
                activeIndicators.has(indicator.value)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {indicator.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1" ref={chartContainerRef}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
