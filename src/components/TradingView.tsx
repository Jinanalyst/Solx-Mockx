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

  const updateIndicators = (data: CandlestickData[]) => {
    // Remove existing indicators
    Object.values(indicatorsRef.current).forEach(indicator => {
      if (chartRef.current) {
        chartRef.current.removeSeries(indicator.series);
      }
    });
    indicatorsRef.current = {};

    if (!chartRef.current || !data.length) return;

    activeIndicators.forEach(indicatorName => {
      switch (indicatorName) {
        case 'EMA':
          const ema = calculateEMA(data, 20);
          if (chartRef.current) {
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
          }
          break;

        case 'SMA':
          const sma = calculateSMA(data, 20);
          if (chartRef.current) {
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
          }
          break;

        case 'RSI':
          const rsi = calculateRSI(data);
          if (chartRef.current) {
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
          }
          break;

        case 'MACD':
          const macdData = calculateMACD(data);
          if (chartRef.current) {
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
          }
          break;

        case 'BB':
          const bb = calculateBollingerBands(data);
          if (chartRef.current) {
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
          }
          break;
      }
    });
  };

  const fetchOHLCData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTokenOHLC(pair, timeframe);
      
      if (!data || data.length === 0) {
        throw new Error('No OHLC data found');
      }

      const candleData: CandlestickData[] = data.map((item: any) => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close
      }));

      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(candleData);
        updateIndicators(candleData);
      }

      if (volumeSeriesRef.current) {
        const volumeData = data.map((item: any) => ({
          time: item.time,
          value: item.volume,
          color: item.close >= item.open ? 'rgba(0, 150, 136, 0.3)' : 'rgba(255, 82, 82, 0.3)'
        }));
        volumeSeriesRef.current.setData(volumeData);
      }
    } catch (error) {
      console.error('Error fetching OHLC data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: '#404040' },
        horzLines: { color: '#404040' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00897B',
      downColor: '#FF5252',
      borderVisible: false,
      wickUpColor: '#00897B',
      wickDownColor: '#FF5252',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    fetchOHLCData();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    fetchOHLCData();
  }, [pair, timeframe]);

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
            <div className="text-sm text-muted-foreground">Loading chart...</div>
          </div>
        )}
      </div>
    </div>
  );
}
