import { PublicKey } from '@solana/web3.js';

export interface TokenInfo {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  extensions?: {
    website?: string;
    bridgeContract?: string;
    assetContract?: string;
    address?: string;
    explorer?: string;
    twitter?: string;
    github?: string;
    medium?: string;
    tgann?: string;
    tggroup?: string;
    discord?: string;
    serumV3Usdt?: string;
    serumV3Usdc?: string;
    coingeckoId?: string;
    imageUrl?: string;
    description?: string;
  };
}

// Popular Solana DEX tokens from CoinGecko
export const SOLANA_TOKENS: { [key: string]: TokenInfo } = {
  SOL: {
    chainId: 101, // MainnetBeta
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    extensions: {
      coingeckoId: 'solana',
    }
  },
  USDC: {
    chainId: 101,
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    extensions: {
      coingeckoId: 'usd-coin',
    }
  },
  RAY: {
    chainId: 101,
    address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    symbol: 'RAY',
    name: 'Raydium',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
    extensions: {
      coingeckoId: 'raydium',
    }
  },
  BONK: {
    chainId: 101,
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png',
    extensions: {
      coingeckoId: 'bonk',
    }
  },
  JUP: {
    chainId: 101,
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZxPy3uK',
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZxPy3uK/logo.png',
    extensions: {
      coingeckoId: 'jupiter',
    }
  },
  ORCA: {
    chainId: 101,
    address: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    symbol: 'ORCA',
    name: 'Orca',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE/logo.png',
    extensions: {
      coingeckoId: 'orca',
    }
  },
  MNGO: {
    chainId: 101,
    address: 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac',
    symbol: 'MNGO',
    name: 'Mango',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac/logo.png',
    extensions: {
      coingeckoId: 'mango-markets',
    }
  },
  SAMO: {
    chainId: 101,
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    symbol: 'SAMO',
    name: 'Samoyedcoin',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU/logo.png',
    extensions: {
      coingeckoId: 'samoyedcoin',
    }
  },
  PYTH: {
    chainId: 101,
    address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    symbol: 'PYTH',
    name: 'Pyth Network',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3/logo.png',
    extensions: {
      coingeckoId: 'pyth-network',
    }
  },
  MEAN: {
    chainId: 101,
    address: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
    symbol: 'MEAN',
    name: 'Mean Protocol',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD/logo.png',
    extensions: {
      coingeckoId: 'mean-protocol',
    }
  },
  RENDER: {
    chainId: 101,
    address: 'RNDRwGcWPDDe6cJQxKBvhxqiWFZ5LFrVvXtHbwSB7skr',
    symbol: 'RENDER',
    name: 'Render Token',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/RNDRwGcWPDDe6cJQxKBvhxqiWFZ5LFrVvXtHbwSB7skr/logo.png',
    extensions: {
      coingeckoId: 'render-token',
    }
  }
};

// Export supported tokens as an array for easier use in components
export const SUPPORTED_TOKENS = Object.values(SOLANA_TOKENS);
