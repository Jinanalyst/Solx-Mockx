import { ApiError, ApiErrorCode } from '../types/api';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class Cache<T> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private readonly ttl: number;

  constructor(ttlSeconds: number) {
    this.ttl = ttlSeconds * 1000; // Convert to milliseconds
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

class RateLimiter {
  private requests: number[] = [];
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);
      throw new ApiError(
        'RATE_LIMIT_EXCEEDED',
        'Rate limit exceeded. Please try again later.',
        429,
        retryAfter
      );
    }

    this.requests.push(now);
  }
}

// Create instances with appropriate limits
export const tokenPriceCache = new Cache<any>(30); // 30 seconds TTL for prices
export const tokenListCache = new Cache<any>(3600); // 1 hour TTL for token lists
export const quoteCache = new Cache<any>(5); // 5 seconds TTL for quotes

// Rate limiters for different APIs
export const coingeckoLimiter = new RateLimiter(60000, 50); // 50 requests per minute
export const jupiterLimiter = new RateLimiter(60000, 100); // 100 requests per minute

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 1000
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorCode = getErrorCode(response.status);
      throw new ApiError(
        errorCode,
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    return response;
  } catch (error) {
    if (retries > 0 && error instanceof Error) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

function getErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 429:
      return 'RATE_LIMIT_EXCEEDED';
    case 404:
      return 'TOKEN_NOT_FOUND';
    case 503:
      return 'INSUFFICIENT_LIQUIDITY';
    default:
      return 'NETWORK_ERROR';
  }
}

export async function handleApiError(error: unknown): Promise<never> {
  if (error instanceof ApiError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new ApiError('NETWORK_ERROR', error.message);
  }

  throw new ApiError('NETWORK_ERROR', 'An unknown error occurred');
}
