import { SolswapError, ErrorCodes } from './errorHandling';
import { BigNumber } from 'ethers';

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
  code: string;
}

export function createValidator<T>(rules: ValidationRule<T>[]) {
  return (value: T): void => {
    for (const rule of rules) {
      if (!rule.validate(value)) {
        throw new SolswapError(rule.message, rule.code);
      }
    }
  };
}

// Common validation rules
export const tokenAmountRules = [
  {
    validate: (value: string | number) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return !isNaN(num) && num > 0;
    },
    message: 'Token amount must be a positive number',
    code: ErrorCodes.INVALID_INPUT,
  },
  {
    validate: (value: string | number) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return num <= Number.MAX_SAFE_INTEGER;
    },
    message: 'Token amount is too large',
    code: ErrorCodes.INVALID_INPUT,
  },
];

export const addressRules = [
  {
    validate: (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value),
    message: 'Invalid wallet address',
    code: ErrorCodes.INVALID_INPUT,
  },
];

export function validateTokenAmount(amount: string | number): void {
  const validator = createValidator(tokenAmountRules);
  validator(amount);
}

export function validateAddress(address: string): void {
  const validator = createValidator(addressRules);
  validator(address);
}

export function validateBalance(
  balance: BigNumber,
  amount: BigNumber,
  tokenSymbol: string
): void {
  if (balance.lt(amount)) {
    throw new SolswapError(
      `Insufficient ${tokenSymbol} balance`,
      ErrorCodes.INSUFFICIENT_BALANCE
    );
  }
}
