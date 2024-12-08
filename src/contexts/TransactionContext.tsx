'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export interface TransactionRecord {
  id: string;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'confirmed' | 'failed';
  amount: number;
  token: string;
  timestamp: number;
  signature: string;
  address: string;
  fee?: number;
}

interface TransactionContextType {
  transactions: TransactionRecord[];
  pendingTransactions: TransactionRecord[];
  isLoading: boolean;
  depositToken: (token: string, amount: number) => Promise<string>;
  withdrawToken: (token: string, amount: number, address: string) => Promise<string>;
  getTransactionStatus: (signature: string) => Promise<'confirmed' | 'failed' | 'pending'>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTransactionHistory = useCallback(async () => {
    if (!connection || !publicKey) return;

    setIsLoading(true);
    try {
      const signatures = await connection.getSignaturesForAddress(publicKey);
      const transactionRecords: TransactionRecord[] = [];

      for (const { signature } of signatures) {
        const transaction = await connection.getTransaction(signature);
        const record = parseTransaction(transaction);
        if (record) {
          transactionRecords.push(record);
        }
      }

      setTransactions(transactionRecords);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  // Load transaction history
  useEffect(() => {
    if (publicKey) {
      loadTransactionHistory();
    }
  }, [publicKey, connection, loadTransactionHistory]);

  const parseTransaction = (transaction: any): TransactionRecord | null => {
    // Implement transaction parsing logic here
    // This would identify deposits and withdrawals based on transaction data
    return null;
  };

  const depositToken = async (token: string, amount: number): Promise<string> => {
    if (!connection || !publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      let transaction: Transaction;
      let signature: string;

      if (token === 'SOL') {
        // Handle SOL deposit
        transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_WALLET!),
            lamports: amount * 1e9,
          })
        );
      } else {
        // Handle SPL token deposit
        const tokenMint = new PublicKey(token);
        const tokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          publicKey,
          true
        );

        const platformTokenAccount = await getAssociatedTokenAddress(
          tokenMint,
          new PublicKey(process.env.NEXT_PUBLIC_PLATFORM_WALLET!),
          true
        );

        transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            TOKEN_PROGRAM_ID,
            tokenAccount,
            platformTokenAccount,
            publicKey,
            publicKey
          )
        );

        transaction.add(
          createAssociatedTokenAccountInstruction(
            TOKEN_PROGRAM_ID,
            tokenAccount,
            platformTokenAccount,
            publicKey,
            publicKey
          )
        );
      }

      // Add recent blockhash
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      transaction.feePayer = publicKey;

      // Sign and send transaction
      const signedTx = await signTransaction(transaction);
      signature = await connection.sendRawTransaction(signedTx.serialize());

      // Add to pending transactions
      const newTransaction: TransactionRecord = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'deposit',
        status: 'pending',
        amount,
        token,
        timestamp: Date.now(),
        signature,
        address: publicKey.toBase58(),
      };

      setPendingTransactions(prev => [...prev, newTransaction]);

      // Monitor transaction status
      monitorTransaction(signature);

      return signature;
    } catch (error) {
      console.error('Deposit error:', error);
      throw error;
    }
  };

  const withdrawToken = async (
    token: string,
    amount: number,
    address: string
  ): Promise<string> => {
    if (!connection || !publicKey || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      // Similar to deposit but reverse direction
      // Implementation would depend on your platform's withdrawal process
      const signature = 'mock-signature';

      const newTransaction: TransactionRecord = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'withdrawal',
        status: 'pending',
        amount,
        token,
        timestamp: Date.now(),
        signature,
        address,
      };

      setPendingTransactions(prev => [...prev, newTransaction]);

      // Monitor transaction status
      monitorTransaction(signature);

      return signature;
    } catch (error) {
      console.error('Withdrawal error:', error);
      throw error;
    }
  };

  const monitorTransaction = async (signature: string) => {
    try {
      const status = await connection?.confirmTransaction(signature);
      
      setPendingTransactions(prev => 
        prev.map(tx => 
          tx.signature === signature
            ? { ...tx, status: status?.value.err ? 'failed' : 'confirmed' }
            : tx
        )
      );

      // Refresh transaction history
      loadTransactionHistory();
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      setPendingTransactions(prev => 
        prev.map(tx => 
          tx.signature === signature
            ? { ...tx, status: 'failed' }
            : tx
        )
      );
    }
  };

  const getTransactionStatus = async (signature: string) => {
    try {
      const status = await connection?.confirmTransaction(signature);
      return status?.value.err ? 'failed' : 'confirmed';
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return 'failed';
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        pendingTransactions,
        isLoading,
        depositToken,
        withdrawToken,
        getTransactionStatus,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
}
