'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MockBalance {
  symbol: string;
  balance: number;
  usdValue: number;
  logoURI?: string;
}

interface MockBalanceContextType {
  mockBalances: MockBalance[];
  updateBalance: (symbol: string, amount: number) => void;
  addBalance: (symbol: string, amount: number) => void;
}

const initialMockBalances: MockBalance[] = [
  {
    symbol: 'USDT',
    balance: 10000,
    usdValue: 10000,
    logoURI: '/images/tokens/usdt.png'
  },
  {
    symbol: 'BTC',
    balance: 0.5,
    usdValue: 49723.99,
    logoURI: '/images/tokens/btc.png'
  },
  {
    symbol: 'ETH',
    balance: 2.5,
    usdValue: 9764.65,
    logoURI: '/images/tokens/eth.png'
  },
  {
    symbol: 'SOL',
    balance: 50,
    usdValue: 11529,
    logoURI: '/images/tokens/sol.png'
  }
];

const MockBalanceContext = createContext<MockBalanceContextType | undefined>(undefined);

export function MockBalanceProvider({ children }: { children: ReactNode }) {
  const [mockBalances, setMockBalances] = useState<MockBalance[]>(initialMockBalances);

  const updateBalance = (symbol: string, amount: number) => {
    setMockBalances(prev => prev.map(balance => {
      if (balance.symbol === symbol) {
        return {
          ...balance,
          balance: amount,
          usdValue: amount * (balance.usdValue / balance.balance)
        };
      }
      return balance;
    }));
  };

  const addBalance = (symbol: string, amount: number) => {
    setMockBalances(prev => prev.map(balance => {
      if (balance.symbol === symbol) {
        const newBalance = balance.balance + amount;
        return {
          ...balance,
          balance: newBalance,
          usdValue: newBalance * (balance.usdValue / balance.balance)
        };
      }
      return balance;
    }));
  };

  return (
    <MockBalanceContext.Provider value={{ mockBalances, updateBalance, addBalance }}>
      {children}
    </MockBalanceContext.Provider>
  );
}

export function useMockBalance() {
  const context = useContext(MockBalanceContext);
  if (context === undefined) {
    throw new Error('useMockBalance must be used within a MockBalanceProvider');
  }
  return context;
}
