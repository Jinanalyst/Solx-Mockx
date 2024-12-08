import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { logger } from './logger';

export async function signAndSendTransaction(
  connection: Connection,
  transaction: Transaction,
  feePayer: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
) {
  try {
    transaction.feePayer = feePayer;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signed = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    const confirmation = await connection.confirmTransaction(signature);
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    return signature;
  } catch (error) {
    logger.error('Transaction failed:', error);
    throw error;
  }
}

export async function simulateTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  feePayer: PublicKey
) {
  try {
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = feePayer;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const simulation = await connection.simulateTransaction(transaction);
    
    if (simulation.value.err) {
      throw new Error(`Transaction simulation failed: ${simulation.value.err}`);
    }

    return simulation;
  } catch (error) {
    logger.error('Transaction simulation failed:', error);
    throw error;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
