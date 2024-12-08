export interface FuturesPosition {
  entryPrice: number;
  leverage: number;
  margin: number;
  positionSize: number;
  side: 'long' | 'short';
  maintenanceMargin: number;
  stopLoss: number | null;
  takeProfit: number | null;
}

export const LEVERAGE_OPTIONS = [1, 2, 5, 10, 20] as const;
export type LeverageOption = typeof LEVERAGE_OPTIONS[number];

export const calculatePositionSize = (margin: number, leverage: number): number => {
  return margin * leverage;
};

export const calculateRequiredMargin = (positionSize: number, leverage: number): number => {
  return positionSize / leverage;
};

export const calculateLiquidationPrice = (position: FuturesPosition): number => {
  const { entryPrice, leverage, side, maintenanceMargin } = position;
  
  // Maintenance margin is typically a percentage of the position size
  const maintenanceMarginRate = maintenanceMargin / 100;
  
  if (side === 'long') {
    // For long positions, liquidation occurs when:
    // Entry Price * (1 - (1 / leverage) + maintenanceMarginRate)
    return entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
  } else {
    // For short positions, liquidation occurs when:
    // Entry Price * (1 + (1 / leverage) - maintenanceMarginRate)
    return entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
  }
};

export const calculatePnL = (
  position: FuturesPosition,
  currentPrice: number
): number => {
  const { entryPrice, positionSize, side } = position;
  
  if (side === 'long') {
    return positionSize * ((currentPrice - entryPrice) / entryPrice);
  } else {
    return positionSize * ((entryPrice - currentPrice) / entryPrice);
  }
};

export const formatUSD = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
