import axios from 'axios';

class DexScreenerClient {
  private baseUrl = 'https://api.dexscreener.com/latest';

  async searchPairs(query: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/dex/search?q=${query}`);
      return response.data.pairs || [];
    } catch (error) {
      console.error('DexScreener search error:', error);
      return [];
    }
  }

  async getTopPairsByChain(chainId: string) {
    try {
      // Search for major tokens to get their pairs
      const majorTokens = ['SOL', 'BONK', 'JUP', 'RAY'];
      const allPairs = [];
      
      for (const token of majorTokens) {
        const pairs = await this.searchPairs(token);
        const solanaPairs = pairs.filter((pair: any) => 
          pair.chainId === 'solana' &&
          pair.priceUsd &&
          pair.volume &&
          pair.quoteToken?.symbol === 'USDC'
        );
        allPairs.push(...solanaPairs);
      }

      // Sort by volume and take top pairs
      const uniquePairs = Array.from(new Map(allPairs.map((pair: any) => [pair.pairAddress, pair])).values());
      
      return {
        pairs: uniquePairs
          .sort((a: any, b: any) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
          .slice(0, 20)
      };
    } catch (error) {
      console.error('DexScreener API error:', error);
      return { pairs: [] };
    }
  }
}

export const dexScreenerClient = new DexScreenerClient();

export const SUPPORTED_CHAINS = {
  ethereum: '1',
  bsc: '56',
  polygon: '137',
  avalanche: '43114',
  arbitrum: '42161',
  optimism: '10',
  fantom: '250',
  cronos: '25',
  solana: 'solana',
  base: '8453'
} as const;
