'use client';

import { FC, useState } from 'react';
import { Connection } from '@solana/web3.js';
import { Button } from '@/components/ui/button';

const NETWORKS = {
  'Mainnet Beta': 'https://api.mainnet-beta.solana.com',
  'Devnet': 'https://api.devnet.solana.com',
  'Testnet': 'https://api.testnet.solana.com',
  'Localnet': 'http://localhost:8899',
};

const NetworkTest: FC = () => {
  const [status, setStatus] = useState<string>('Click to test network connections...');

  const testConnection = async (network: string, endpoint: string) => {
    const connection = new Connection(endpoint);
    
    try {
      const version = await connection.getVersion();
      setStatus(prev => `${prev}\n${network}: Connected! Version: ${JSON.stringify(version)}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus(prev => `${prev}\n${network}: Failed - ${errorMessage}`);
    }
  };

  const testAllConnections = async () => {
    setStatus('Testing connections...\n');
    
    for (const [network, endpoint] of Object.entries(NETWORKS)) {
      await testConnection(network, endpoint);
    }
  };

  return (
    <div className="p-4 bg-card rounded-lg">
      <h2 className="text-xl font-bold mb-4">Network Connection Test</h2>
      <Button 
        onClick={testAllConnections}
        className="mb-4"
      >
        Test Connections
      </Button>
      <pre className="whitespace-pre-wrap bg-muted p-4 rounded">
        {status}
      </pre>
    </div>
  );
};

export default NetworkTest;
