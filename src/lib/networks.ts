import { JsonRpcProvider, isAddress, formatEther, getAddress } from 'ethers';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export type NetworkType = 'MAINNET' | 'TESTNET' | 'DEVNET';

export const NETWORK_CONFIG = {
  SOLANA: {
    MAINNET: 'mainnet-beta',
    TESTNET: 'testnet',
    DEVNET: 'devnet',
    RPC_URLS: {
      MAINNET: 'https://api.mainnet-beta.solana.com',
      TESTNET: 'https://api.testnet.solana.com',
      DEVNET: 'https://api.devnet.solana.com'
    }
  },
  ETHEREUM: {
    MAINNET: 1,
    GOERLI: 5,
    RPC_URLS: {
      MAINNET: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
      TESTNET: 'https://eth-goerli.g.alchemy.com/v2/your-api-key',
      DEVNET: 'https://eth-goerli.g.alchemy.com/v2/your-api-key'
    }
  },
  BASE: {
    MAINNET: 8453,
    GOERLI: 84531,
    RPC_URLS: {
      MAINNET: 'https://mainnet.base.org',
      TESTNET: 'https://goerli.base.org',
      DEVNET: 'https://goerli.base.org'
    }
  }
};

export class NetworkManager {
  private solanaConnection: Connection;
  private ethereumProvider: JsonRpcProvider;
  private baseProvider: JsonRpcProvider;

  constructor(
    network: NetworkType = 'MAINNET',
    customRpcUrls?: {
      SOLANA?: string;
      ETHEREUM?: string;
      BASE?: string;
    }
  ) {
    // Initialize Solana connection
    this.solanaConnection = new Connection(
      customRpcUrls?.SOLANA || NETWORK_CONFIG.SOLANA.RPC_URLS[network],
      'confirmed'
    );

    // Initialize Ethereum provider
    this.ethereumProvider = new JsonRpcProvider(
      customRpcUrls?.ETHEREUM || NETWORK_CONFIG.ETHEREUM.RPC_URLS[network]
    );

    // Initialize Base provider
    this.baseProvider = new JsonRpcProvider(
      customRpcUrls?.BASE || NETWORK_CONFIG.BASE.RPC_URLS[network]
    );
  }

  async validateSolanaAddress(address: string): Promise<boolean> {
    try {
      const pubKey = new PublicKey(address);
      return PublicKey.isOnCurve(pubKey);
    } catch {
      return false;
    }
  }

  async validateEthereumAddress(address: string): Promise<boolean> {
    return isAddress(address);
  }

  // Base uses the same address format as Ethereum
  async validateBaseAddress(address: string): Promise<boolean> {
    return isAddress(address);
  }

  async getSolanaAddressDetails(address: string) {
    try {
      const pubKey = new PublicKey(address);
      const balance = await this.solanaConnection.getBalance(pubKey);
      const accountInfo = await this.solanaConnection.getAccountInfo(pubKey);

      return {
        isValid: true,
        balance: balance / 1e9, // Convert lamports to SOL
        hasContract: accountInfo?.executable || false,
        address: pubKey.toString()
      };
    } catch (error) {
      console.error('Error getting Solana address details:', error);
      return {
        isValid: false,
        balance: 0,
        hasContract: false,
        address
      };
    }
  }

  async getEthereumAddressDetails(address: string) {
    try {
      const checksumAddress = getAddress(address);
      const balance = await this.ethereumProvider.getBalance(checksumAddress);
      const code = await this.ethereumProvider.getCode(checksumAddress);

      return {
        isValid: true,
        balance: parseFloat(formatEther(balance)),
        hasContract: code !== '0x',
        address: checksumAddress
      };
    } catch (error) {
      console.error('Error getting Ethereum address details:', error);
      return {
        isValid: false,
        balance: 0,
        hasContract: false,
        address
      };
    }
  }

  async getBaseAddressDetails(address: string) {
    try {
      const checksumAddress = getAddress(address);
      const balance = await this.baseProvider.getBalance(checksumAddress);
      const code = await this.baseProvider.getCode(checksumAddress);

      return {
        isValid: true,
        balance: parseFloat(formatEther(balance)),
        hasContract: code !== '0x',
        address: checksumAddress
      };
    } catch (error) {
      console.error('Error getting Base address details:', error);
      return {
        isValid: false,
        balance: 0,
        hasContract: false,
        address
      };
    }
  }

  getSolanaConnection(): Connection {
    return this.solanaConnection;
  }

  getEthereumProvider(): JsonRpcProvider {
    return this.ethereumProvider;
  }

  getBaseProvider(): JsonRpcProvider {
    return this.baseProvider;
  }

  getSolanaEndpoint(): string {
    return this.solanaConnection.rpcEndpoint;
  }
}
