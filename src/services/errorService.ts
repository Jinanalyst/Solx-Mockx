export class SolxError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'SolxError';
  }
}

export const ErrorCodes = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export function createError(code: ErrorCode, message: string, details?: unknown): SolxError {
  return new SolxError(message, code, details);
}
