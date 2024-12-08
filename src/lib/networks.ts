import { ethers } from 'ethers';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

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
      GOERLI: 'https://eth-goerli.g.alchemy.com/v2/your-api-key'
    }
  },
  BASE: {
    MAINNET: 8453,
    GOERLI: 84531,
    RPC_URLS: {
      MAINNET: 'https://mainnet.base.org',
      GOERLI: 'https://goerli.base.org'
    }
  }
};

export class NetworkManager {
  private solanaConnection: Connection;
  private ethereumProvider: ethers.providers.JsonRpcProvider;
  private baseProvider: ethers.providers.JsonRpcProvider;

  constructor(
    network: 'MAINNET' | 'TESTNET' | 'DEVNET' = 'MAINNET',
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
    this.ethereumProvider = new ethers.providers.JsonRpcProvider(
      customRpcUrls?.ETHEREUM || NETWORK_CONFIG.ETHEREUM.RPC_URLS[network]
    );

    // Initialize Base provider
    this.baseProvider = new ethers.providers.JsonRpcProvider(
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
    return ethers.utils.isAddress(address);
  }

  // Base uses the same address format as Ethereum
  async validateBaseAddress(address: string): Promise<boolean> {
    return ethers.utils.isAddress(address);
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
      const balance = await this.ethereumProvider.getBalance(address);
      const code = await this.ethereumProvider.getCode(address);

      return {
        isValid: true,
        balance: ethers.utils.formatEther(balance),
        hasContract: code !== '0x',
        address: ethers.utils.getAddress(address) // Returns checksum address
      };
    } catch (error) {
      console.error('Error getting Ethereum address details:', error);
      return {
        isValid: false,
        balance: '0',
        hasContract: false,
        address
      };
    }
  }

  async getBaseAddressDetails(address: string) {
    try {
      const balance = await this.baseProvider.getBalance(address);
      const code = await this.baseProvider.getCode(address);

      return {
        isValid: true,
        balance: ethers.utils.formatEther(balance),
        hasContract: code !== '0x',
        address: ethers.utils.getAddress(address) // Returns checksum address
      };
    } catch (error) {
      console.error('Error getting Base address details:', error);
      return {
        isValid: false,
        balance: '0',
        hasContract: false,
        address
      };
    }
  }

  async validateAddressForNetwork(network: 'SOLANA' | 'ETHEREUM' | 'BASE', address: string): Promise<boolean> {
    switch (network) {
      case 'SOLANA':
        return this.validateSolanaAddress(address);
      case 'ETHEREUM':
        return this.validateEthereumAddress(address);
      case 'BASE':
        return this.validateBaseAddress(address);
      default:
        return false;
    }
  }

  async getAddressDetails(network: 'SOLANA' | 'ETHEREUM' | 'BASE', address: string) {
    switch (network) {
      case 'SOLANA':
        return this.getSolanaAddressDetails(address);
      case 'ETHEREUM':
        return this.getEthereumAddressDetails(address);
      case 'BASE':
        return this.getBaseAddressDetails(address);
      default:
        throw new Error('Unsupported network');
    }
  }
}
