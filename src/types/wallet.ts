import { PublicKey } from '@solana/web3.js';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type TransactionType = 'deposit' | 'withdrawal';

export interface TokenInfo {
  symbol: string;
  name: string;
  mint: PublicKey;
  decimals: number;
  logoURI: string;
  minDeposit?: number;
  minWithdrawal?: number;
  withdrawalFee?: number;
  isNative?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  token: string;
  amount: number;
  status: TransactionStatus;
  fromAddress: string;
  toAddress: string;
  timestamp: number;
  txHash?: string;
  confirmations?: number;
  requiredConfirmations?: number;
  fee?: number;
}

export interface WithdrawalRequest {
  token: string;
  amount: number;
  toAddress: string;
  twoFactorCode?: string;
}

export interface DepositAddress {
  token: string;
  address: string;
  memo?: string;
  qrCode?: string;
  minimumDeposit?: number;
  expectedConfirmations: number;
}

export interface WalletBalance {
  token: string;
  total: number;
  available: number;
  locked: number;
  inOrders: number;
  pendingWithdrawal: number;
}

export interface TransactionFilters {
  type?: TransactionType;
  token?: string;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface WithdrawalLimit {
  token: string;
  daily: number;
  remaining: number;
  requiresTwoFactor: boolean;
}
