import { Connection, clusterApiUrl, Commitment } from '@solana/web3.js';

// RPC Endpoints configuration
export const RPC_ENDPOINTS = {
  MAINNET: process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET || 'https://api.mainnet-beta.solana.com',
  DEVNET: process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET || 'https://api.devnet.solana.com',
  TESTNET: process.env.NEXT_PUBLIC_SOLANA_RPC_TESTNET || 'https://api.testnet.solana.com',
};

// Connection configuration
const connectionConfig = {
  commitment: 'processed' as Commitment,
  confirmTransactionInitialTimeout: 60000,
  disableRetryOnRateLimit: false,
  wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS_ENDPOINT,
};

// Create a connection with retry mechanism
const createConnectionWithRetry = (endpoint: string) => {
  const connection = new Connection(endpoint, connectionConfig);
  
  // Wrap the connection methods with retry logic
  const originalGetBalance = connection.getBalance.bind(connection);
  connection.getBalance = async (...args) => {
    try {
      return await originalGetBalance(...args);
    } catch (error) {
      console.error('Error in getBalance, retrying with different endpoint...', error);
      // Try mainnet if devnet fails, or vice versa
      const fallbackEndpoint = endpoint.includes('devnet') ? RPC_ENDPOINTS.MAINNET : RPC_ENDPOINTS.DEVNET;
      const fallbackConnection = new Connection(fallbackEndpoint, connectionConfig);
      return await fallbackConnection.getBalance(...args);
    }
  };

  return connection;
};

// Create connections with retry mechanism
export const connections = {
  mainnet: createConnectionWithRetry(RPC_ENDPOINTS.MAINNET),
  devnet: createConnectionWithRetry(RPC_ENDPOINTS.DEVNET),
  testnet: createConnectionWithRetry(RPC_ENDPOINTS.TESTNET),
};

// Helper to check connection health
export const checkConnection = async (connection: Connection): Promise<boolean> => {
  try {
    const version = await connection.getVersion();
    return version !== null;
  } catch (error) {
    console.error('Connection check failed:', error);
    return false;
  }
};

// Default to devnet for development, mainnet for production
export const defaultConnection = process.env.NODE_ENV === 'production' 
  ? connections.mainnet 
  : connections.devnet;
