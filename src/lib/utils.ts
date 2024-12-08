import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(
  value: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  } | number = {}
): string {
  if (typeof options === 'number') {
    // Legacy support
    const decimals = options;
    if (value === 0) return '0';
    if (Math.abs(value) < 0.01) return '<0.01';
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }

  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 6,
    notation = 'standard'
  } = options;

  if (value === 0) return '0';
  if (Math.abs(value) < Math.pow(10, -maximumFractionDigits)) {
    return `<${Math.pow(10, -maximumFractionDigits)}`;
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
  }).format(value);
}

export function formatPrice(price: number): string {
  return formatNumber(price, {
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  });
}

export function formatPnL(value: number): string {
  const formatted = formatNumber(Math.abs(value), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value >= 0 ? '+' : '-'}${formatted}`;
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return '';
  const start = address.slice(0, chars);
  const end = address.slice(-chars);
  return `${start}...${end}`;
}
