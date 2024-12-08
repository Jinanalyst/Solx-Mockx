import { CandlestickData, Time } from 'lightweight-charts';

export interface IndicatorData {
  time: Time;
  value: number;
}

export function calculateSMA(data: CandlestickData[], period: number): IndicatorData[] {
  const sma: IndicatorData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    sma.push({
      time: data[i].time,
      value: sum / period
    });
  }
  return sma;
}

export function calculateEMA(data: CandlestickData[], period: number): IndicatorData[] {
  const ema: IndicatorData[] = [];
  const multiplier = 2 / (period + 1);

  // First EMA uses SMA as initial value
  let initialSMA = 0;
  for (let i = 0; i < period; i++) {
    initialSMA += data[i].close;
  }
  initialSMA /= period;

  ema.push({
    time: data[period - 1].time,
    value: initialSMA
  });

  // Calculate EMA for remaining periods
  for (let i = period; i < data.length; i++) {
    const currentValue = data[i].close;
    const previousEMA = ema[ema.length - 1].value;
    const currentEMA = (currentValue - previousEMA) * multiplier + previousEMA;
    
    ema.push({
      time: data[i].time,
      value: currentEMA
    });
  }

  return ema;
}

export function calculateRSI(data: CandlestickData[], period: number = 14): IndicatorData[] {
  const rsi: IndicatorData[] = [];
  const changes: number[] = [];

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }

  // Calculate initial average gains and losses
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    if (changes[i] < 0) avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period;
  avgLoss /= period;

  // Calculate initial RSI
  let rs = avgGain / avgLoss;
  rsi.push({
    time: data[period].time,
    value: 100 - (100 / (1 + rs))
  });

  // Calculate remaining RSI values
  for (let i = period + 1; i < data.length; i++) {
    const change = changes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;

    rs = avgGain / avgLoss;
    rsi.push({
      time: data[i].time,
      value: 100 - (100 / (1 + rs))
    });
  }

  return rsi;
}

export function calculateMACD(data: CandlestickData[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): {
  macd: IndicatorData[];
  signal: IndicatorData[];
  histogram: IndicatorData[];
} {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  // Calculate MACD line
  const macdLine: IndicatorData[] = [];
  let startIndex = slowPeriod - 1;
  for (let i = 0; i < fastEMA.length && i < slowEMA.length; i++) {
    if (fastEMA[i].time === slowEMA[i].time) {
      macdLine.push({
        time: fastEMA[i].time,
        value: fastEMA[i].value - slowEMA[i].value
      });
    }
  }

  // Calculate signal line (9-day EMA of MACD)
  const signalLine: IndicatorData[] = [];
  let signalSum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    signalSum += macdLine[i].value;
  }
  let prevSignal = signalSum / signalPeriod;
  const multiplier = 2 / (signalPeriod + 1);

  for (let i = signalPeriod - 1; i < macdLine.length; i++) {
    const signal = (macdLine[i].value - prevSignal) * multiplier + prevSignal;
    signalLine.push({
      time: macdLine[i].time,
      value: signal
    });
    prevSignal = signal;
  }

  // Calculate histogram
  const histogram: IndicatorData[] = [];
  for (let i = 0; i < signalLine.length; i++) {
    const macdValue = macdLine[i + signalPeriod - 1].value;
    histogram.push({
      time: signalLine[i].time,
      value: macdValue - signalLine[i].value
    });
  }

  return {
    macd: macdLine,
    signal: signalLine,
    histogram
  };
}

export function calculateBollingerBands(data: CandlestickData[], period = 20, stdDev = 2): {
  upper: IndicatorData[];
  middle: IndicatorData[];
  lower: IndicatorData[];
} {
  const bands = {
    upper: [] as IndicatorData[],
    middle: [] as IndicatorData[],
    lower: [] as IndicatorData[]
  };

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    let sumSquares = 0;

    for (let j = 0; j < period; j++) {
      const price = data[i - j].close;
      sum += price;
      sumSquares += price * price;
    }

    const sma = sum / period;
    const variance = sumSquares / period - sma * sma;
    const standardDeviation = Math.sqrt(variance);

    bands.middle.push({
      time: data[i].time,
      value: sma
    });

    bands.upper.push({
      time: data[i].time,
      value: sma + standardDeviation * stdDev
    });

    bands.lower.push({
      time: data[i].time,
      value: sma - standardDeviation * stdDev
    });
  }

  return bands;
}
