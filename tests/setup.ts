import { Connection, Keypair } from '@solana/web3.js';
import { Provider, Program, setProvider } from '@project-serum/anchor';

export const setupTest = async () => {
  // Create connection to local validator
  const connection = new Connection('http://localhost:8899', 'confirmed');
  
  // Generate a new keypair for testing
  const wallet = Keypair.generate();
  
  // Create provider
  const provider = new Provider(
    connection,
    {
      publicKey: wallet.publicKey,
      signTransaction: async (tx) => {
        tx.partialSign(wallet);
        return tx;
      },
      signAllTransactions: async (txs) => {
        txs.forEach(tx => tx.partialSign(wallet));
        return txs;
      },
    },
    { commitment: 'confirmed' }
  );
  
  setProvider(provider);
  
  return {
    connection,
    wallet,
    provider,
  };
};
