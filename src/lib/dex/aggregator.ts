import axios from 'axios';
import { NETWORKS, DEX_SUBGRAPH_ENDPOINTS, JUPITER_API_ENDPOINT, RAYDIUM_API_ENDPOINT } from './config';
import { PoolInfo, TokenInfo } from './types';

export class DexAggregator {
  private async fetchGraphQLPools(endpoint: string, query: string): Promise<any> {
    try {
      const response = await axios.post(endpoint, { query });
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      return null;
    }
  }

  private async getPoolCount(dex: string): Promise<number> {
    const queries = {
      uniswap_v3: `{ factories(first: 1) { poolCount } }`,
      pancakeswap: `{ pancakeFactories(first: 1) { poolCount } }`,
      sushiswap: `{ factories(first: 1) { poolCount } }`,
      quickswap: `{ factories(first: 1) { poolCount } }`
    };

    const query = queries[dex as keyof typeof queries];
    if (!query) return 0;

    const data = await this.fetchGraphQLPools(DEX_SUBGRAPH_ENDPOINTS[dex as keyof typeof DEX_SUBGRAPH_ENDPOINTS], query);
    if (!data) return 0;

    if (dex === 'uniswap_v3') return parseInt(data.factories[0]?.poolCount || '0');
    if (dex === 'pancakeswap') return parseInt(data.pancakeFactories[0]?.poolCount || '0');
    return parseInt(data.factories[0]?.poolCount || '0');
  }

  private async fetchUniswapV3Pools(skip: number = 0, first: number = 1000): Promise<PoolInfo[]> {
    const query = `{
      pools(first: ${first}, skip: ${skip}, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        token0 { id symbol name decimals }
        token1 { id symbol name decimals }
        totalValueLockedToken0
        totalValueLockedToken1
        totalValueLockedUSD
        feeTier
        token0Price
        token1Price
      }
    }`;

    const data = await this.fetchGraphQLPools(DEX_SUBGRAPH_ENDPOINTS.uniswap_v3, query);
    if (!data) return [];

    return data.pools.map((pool: any) => ({
      address: pool.id,
      token0: {
        address: pool.token0.id,
        symbol: pool.token0.symbol,
        decimals: parseInt(pool.token0.decimals),
        name: pool.token0.name,
        chainId: NETWORKS.ethereum.id
      },
      token1: {
        address: pool.token1.id,
        symbol: pool.token1.symbol,
        decimals: parseInt(pool.token1.decimals),
        name: pool.token1.name,
        chainId: NETWORKS.ethereum.id
      },
      reserve0: pool.totalValueLockedToken0,
      reserve1: pool.totalValueLockedToken1,
      tvlUSD: parseFloat(pool.totalValueLockedUSD),
      fee: parseInt(pool.feeTier) / 10000,
      dex: 'Uniswap V3',
      chain: 'ethereum'
    }));
  }

  private async fetchRaydiumPools(): Promise<{ pools: PoolInfo[], total: number }> {
    try {
      const response = await axios.get(`${RAYDIUM_API_ENDPOINT}/pools`);
      const pools = response.data.data.map((pool: any) => ({
        address: pool.id,
        token0: {
          address: pool.baseMint,
          symbol: pool.baseSymbol,
          decimals: pool.baseDecimals,
          name: pool.baseSymbol,
          chainId: 'solana'
        },
        token1: {
          address: pool.quoteMint,
          symbol: pool.quoteSymbol,
          decimals: pool.quoteDecimals,
          name: pool.quoteSymbol,
          chainId: 'solana'
        },
        reserve0: pool.baseReserve,
        reserve1: pool.quoteReserve,
        tvlUSD: parseFloat(pool.liquidity),
        apr: pool.apr24h,
        dex: 'Raydium',
        chain: 'solana'
      }));
      return { pools, total: response.data.data.length };
    } catch (error) {
      console.error('Error fetching Raydium pools:', error);
      return { pools: [], total: 0 };
    }
  }

  async getDexPoolCounts(): Promise<{ [key: string]: number }> {
    const counts: { [key: string]: number } = {};
    
    // Get EVM-based DEX counts
    const dexes = ['uniswap_v3', 'pancakeswap', 'sushiswap', 'quickswap'];
    await Promise.all(
      dexes.map(async (dex) => {
        counts[dex] = await this.getPoolCount(dex);
      })
    );

    // Get Raydium count
    const { total: raydiumCount } = await this.fetchRaydiumPools();
    counts['raydium'] = raydiumCount;

    return counts;
  }

  async getAllPools(page: number = 1, limit: number = 100): Promise<{ pools: PoolInfo[], total: number }> {
    const skip = (page - 1) * limit;
    const [uniswapPools, { pools: raydiumPools }] = await Promise.all([
      this.fetchUniswapV3Pools(skip, limit),
      this.fetchRaydiumPools()
    ]);

    const pools = [...uniswapPools, ...raydiumPools];
    const total = await this.getPoolCount('uniswap_v3') + raydiumPools.length;

    return {
      pools: pools.slice(0, limit),
      total
    };
  }

  async getPoolsByToken(tokenSymbol: string, page: number = 1, limit: number = 100): Promise<{ pools: PoolInfo[], total: number }> {
    const { pools, total } = await this.getAllPools(page, limit);
    const filteredPools = pools.filter(pool => 
      pool.token0.symbol.toLowerCase() === tokenSymbol.toLowerCase() ||
      pool.token1.symbol.toLowerCase() === tokenSymbol.toLowerCase()
    );

    return {
      pools: filteredPools,
      total: filteredPools.length
    };
  }

  async getTopPoolsByTVL(limit: number = 10): Promise<PoolInfo[]> {
    const { pools } = await this.getAllPools(1, limit);
    return pools
      .sort((a, b) => b.tvlUSD - a.tvlUSD)
      .slice(0, limit);
  }
}

export const dexAggregator = new DexAggregator();
