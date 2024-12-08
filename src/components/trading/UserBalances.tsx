'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { SUPPORTED_TOKENS } from '@/config/trading';
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { RPC_ENDPOINTS } from '@/config/api';

interface TokenBalance {
  symbol: string;
  balance: number;
  usdValue: number;
}

export function UserBalances() {
  const { publicKey } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) {
        setBalances([]);
        setIsLoading(false);
        return;
      }

      try {
        const connection = new Connection(RPC_ENDPOINTS.MAINNET);
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        const balancePromises = Object.values(SUPPORTED_TOKENS).map(async (token) => {
          const tokenAccount = tokenAccounts.value.find(
            (acc) => acc.account.data.parsed.info.mint === token.mint
          );

          const balance = tokenAccount
            ? Number(tokenAccount.account.data.parsed.info.tokenAmount.uiAmount)
            : 0;

          // TODO: Fetch actual USD prices from an oracle or price feed
          const usdValue = balance * 1; // Placeholder

          return {
            symbol: token.symbol,
            balance,
            usdValue,
          };
        });

        const newBalances = await Promise.all(balancePromises);
        setBalances(newBalances);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching balances:', error);
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [publicKey]);

  if (!publicKey) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground">Connect your wallet to view balances</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground">Loading balances...</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Your Balances</h3>
      <div className="space-y-2">
        {balances.map((balance) => (
          <div
            key={balance.symbol}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex items-center space-x-2">
              <span className="font-medium">{balance.symbol}</span>
            </div>
            <div className="text-right">
              <div className="font-medium">
                {balance.balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}
              </div>
              <div className="text-sm text-muted-foreground">
                ≈ ${balance.usdValue.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
