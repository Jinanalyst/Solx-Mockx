export const NETWORKS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    rpc: 'https://eth.llamarpc.com',
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    dexes: ['uniswap', 'sushiswap']
  },
  bsc: {
    id: 56,
    name: 'BSC',
    rpc: 'https://bsc-dataseed.binance.org',
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3',
    dexes: ['pancakeswap']
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange',
    dexes: ['quickswap', 'sushiswap']
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    rpc: 'https://api.mainnet-beta.solana.com',
    dexes: ['raydium', 'orca']
  },
  avalanche: {
    id: 43114,
    name: 'Avalanche',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange',
    dexes: ['traderjoe', 'pangolin']
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    rpc: 'https://arb1.arbitrum.io/rpc',
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange',
    dexes: ['sushiswap', 'camelot']
  }
} as const;

export const DEX_SUBGRAPH_ENDPOINTS = {
  uniswap_v3: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  sushiswap: 'https://api.thegraph.com/subgraphs/name/sushi-v3/v3-ethereum',
  pancakeswap: 'https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3',
  quickswap: 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap-v3',
  traderjoe: 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange-v2'
};

export const JUPITER_API_ENDPOINT = 'https://quote-api.jup.ag/v6';
export const RAYDIUM_API_ENDPOINT = 'https://api.raydium.io/v2/main';
