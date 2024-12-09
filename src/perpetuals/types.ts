import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export enum TradeDirection {
  Long = 'long',
  Short = 'short'
}

export interface Position {
  user: PublicKey;
  size: BN;
  entryPrice: BN;
  leverage: number;
  direction: TradeDirection;
  collateral: BN;
  liquidationPrice: BN;
  lastFundingTime: BN;
  accumulatedFunding: BN;
}

export interface MarketState {
  baseAsset: string;
  quoteAsset: string;
  maxLeverage: number;
  minCollateral: BN;
  totalLongPositions: BN;
  totalShortPositions: BN;
  fundingRate: BN;
  lastFundingTime: BN;
  insuranceFund: BN;
  liquidationFee: number;
  maintenanceMargin: number;
  initialMargin: number;
}

export interface OrderParams {
  size: BN;
  price: BN;
  leverage: number;
  direction: TradeDirection;
  collateral: BN;
}

export interface FundingRate {
  rate: BN;
  timestamp: BN;
  isPositive: boolean;
}
