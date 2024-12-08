'use client';

import { useEffect, useState } from 'react';
import { Connection } from '@solana/web3.js';
import { Button } from '@/components/ui/button';

export function NetworkTest() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing connections...');

    const endpoints = {
      mainnet: 'https://api.mainnet-beta.solana.com',
      devnet: 'https://api.devnet.solana.com',
      testnet: 'https://api.testnet.solana.com'
    };

    for (const [network, endpoint] of Object.entries(endpoints)) {
      try {
        setStatus(`Testing ${network}...`);
        const connection = new Connection(endpoint);
        const version = await connection.getVersion();
        setStatus(prev => `${prev}\n${network}: Connected! Version: ${JSON.stringify(version)}`);
      } catch (error) {
        setStatus(prev => `${prev}\n${network}: Failed - ${error.message}`);
      }
    }

    setLoading(false);
  };

  return (
    <div className="p-4 space-y-4">
      <Button 
        onClick={testConnection}
        disabled={loading}
      >
        Test Network Connections
      </Button>
      <pre className="p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">
        {status || 'Click button to test connections'}
      </pre>
    </div>
  );
}
