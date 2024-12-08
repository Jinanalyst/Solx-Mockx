export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  chainId: number | string;
  logoURI?: string;
}

export interface PoolInfo {
  address: string;
  token0: TokenInfo;
  token1: TokenInfo;
  reserve0: string;
  reserve1: string;
  totalSupply?: string;
  tvlUSD: number;
  volume24h?: number;
  fee?: number;
  apr?: number;
  dex: string;
  chain: string;
}

export interface DexProtocol {
  name: string;
  chain: string;
  getPools(): Promise<PoolInfo[]>;
  getPool(address: string): Promise<PoolInfo>;
}
