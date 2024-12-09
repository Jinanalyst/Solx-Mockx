import { PublicKey } from '@solana/web3.js';

// Drift Protocol Program ID (Mainnet)
export const DRIFT_PROGRAM_ID = new PublicKey('dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH');

// Market Indices
export const MARKET_INDICES = {
  SOL_USD: 0,
  BTC_USD: 1,
  ETH_USD: 2,
};

// Funding Interval (8 hours in seconds)
export const FUNDING_INTERVAL = 8 * 60 * 60;

// Maximum Leverage
export const MAX_LEVERAGE = 20;

// Minimum Collateral (in USD)
export const MIN_COLLATERAL = 10;

// Fee Tiers (in basis points)
export const FEE_TIERS = {
  MAKER: 1, // 0.01%
  TAKER: 5, // 0.05%
};

// Insurance Fund Address
export const INSURANCE_FUND = new PublicKey('6zkf4DviZZkpWVEh53MrcQV6vGXGpESnNXgAvU6KpBUH');

// Liquidation Parameters
export const LIQUIDATION_PARAMS = {
  MAINTENANCE_MARGIN: 0.0625, // 6.25%
  LIQUIDATION_FEE: 0.0125,   // 1.25%
  PARTIAL_LIQUIDATION_RATIO: 0.25, // 25%
};
