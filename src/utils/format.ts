import { BigNumber } from '@ethersproject/bignumber';

export function formatAmount(amount: number | string | BigNumber, decimals: number = 9): string {
  let value: number;
  
  if (typeof amount === 'string') {
    value = parseFloat(amount);
  } else if (BigNumber.isBigNumber(amount)) {
    value = parseFloat(amount.toString());
  } else {
    value = amount;
  }

  // Handle zero case
  if (value === 0) return '0.00';

  // Convert to fixed decimal places
  const formatted = value.toFixed(decimals);

  // Remove trailing zeros after decimal point
  const trimmed = formatted.replace(/\.?0+$/, '');

  // Add commas for thousands
  const parts = trimmed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

// Add formatNumber as an alias for formatAmount for backward compatibility
export const formatNumber = formatAmount;

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

// Add alias for formatPercent
export const formatPercent = formatPercentage;

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatDate(date: Date | number | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${Math.round(remainingSeconds)}s`);

  return parts.join(' ');
}

export function formatTokenAmount(amount: number | string, symbol: string): string {
  const formattedAmount = formatAmount(amount);
  return `${formattedAmount} ${symbol}`;
}

export function parseInputAmount(input: string): number {
  // Remove commas and other non-numeric characters except decimal point
  const cleaned = input.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
