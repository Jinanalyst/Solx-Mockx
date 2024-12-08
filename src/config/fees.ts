export const FEE_CONFIG = {
  MOCKX: {
    // Fee percentage for MOCKX trades (e.g., 0.3%)
    FEE_PERCENTAGE: 0.003,
    
    // Fee receiving addresses by chain
    RECEIVERS: {
      SOLANA: '479FWEwyej91C8vrSZWkK8Yeob9EdTguPLD5Wnc4HSce',
      ETHEREUM: '0xeF0DDc5434822042f24e516507cAf33B1F625D1E',
      BASE: '0xeF0DDc5434822042f24e516507cAf33B1F625D1E'
    },
    
    // Minimum fee amounts by chain
    MIN_FEE: {
      SOLANA: 0.01,  // 0.01 MOCKX
      ETHEREUM: 0.01, // 0.01 MOCKX
      BASE: 0.01      // 0.01 MOCKX
    }
  }
};

export const validateFeeAddress = (chain: keyof typeof FEE_CONFIG.MOCKX.RECEIVERS, address: string): boolean => {
  const receiver = FEE_CONFIG.MOCKX.RECEIVERS[chain];
  return receiver.toLowerCase() === address.toLowerCase();
};

export const calculateTradingFee = (amount: number): number => {
  return amount * FEE_CONFIG.MOCKX.FEE_PERCENTAGE;
};

export const getMinimumFee = (chain: keyof typeof FEE_CONFIG.MOCKX.MIN_FEE): number => {
  return FEE_CONFIG.MOCKX.MIN_FEE[chain];
};

export const getFeeReceiver = (chain: keyof typeof FEE_CONFIG.MOCKX.RECEIVERS): string => {
  return FEE_CONFIG.MOCKX.RECEIVERS[chain];
};
