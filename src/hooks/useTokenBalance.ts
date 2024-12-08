'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token';

export function useTokenBalance(mintAddress: string) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ['tokenBalance', mintAddress, publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) {
        return null;
      }

      try {
        const tokenAccounts = await connection.getTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        const account = tokenAccounts.value.find(async ({ pubkey }) => {
          try {
            const tokenAccount = await getAccount(connection, pubkey);
            return tokenAccount.mint.toBase58() === mintAddress;
          } catch {
            return false;
          }
        });

        if (!account) {
          return '0';
        }

        const tokenAccount = await getAccount(connection, account.pubkey);
        return tokenAccount.amount.toString();
      } catch (error) {
        console.error('Error fetching token balance:', error);
        return '0';
      }
    },
    enabled: !!publicKey && !!mintAddress,
  });
}
