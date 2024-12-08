export class SolswapError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'error' | 'warning' | 'info' = 'error',
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'SolswapError';
  }
}

export const ErrorCodes = {
  INVALID_INPUT: 'INVALID_INPUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
} as const;

export function handleError(error: unknown, context?: string): SolswapError {
  if (error instanceof SolswapError) {
    return error;
  }

  console.error(`Error in ${context || 'unknown context'}:`, error);

  if (error instanceof Error) {
    return new SolswapError(
      error.message,
      ErrorCodes.NETWORK_ERROR,
      'error',
      { originalError: error }
    );
  }

  return new SolswapError(
    'An unexpected error occurred',
    ErrorCodes.NETWORK_ERROR,
    'error',
    { originalError: error }
  );
}
