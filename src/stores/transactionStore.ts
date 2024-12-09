import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'buy' | 'sell' | 'stake' | 'unstake' | 'swap' | 'mock_buy' | 'mock_sell';

export interface Transaction {
  id: string;
  type: TransactionType;
  asset: string;
  amount: number;
  price: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
  fee?: number;
  toAsset?: string; // For swap transactions
  toAmount?: number; // For swap transactions
  apy?: number; // For staking transactions
  isMock: boolean;
}

interface Position {
  asset: string;
  amount: number;
  averageEntryPrice: number;
  realizedPnL: number;
  unrealizedPnL: number;
  isMock: boolean;
}

interface StakePosition {
  asset: string;
  amount: number;
  startTime: number;
  apy: number;
  rewards: number;
}

interface TransactionStore {
  transactions: Transaction[];
  positions: Position[];
  stakePositions: StakePosition[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  updatePosition: (transaction: Transaction) => void;
  addStakePosition: (position: StakePosition) => void;
  updateStakePosition: (asset: string, rewards: number) => void;
  getPositionPnL: (asset: string, isMock: boolean) => { realized: number; unrealized: number };
  getTotalPnL: (isMock: boolean) => { realized: number; unrealized: number };
  getTransactionHistory: (type?: TransactionType) => Transaction[];
}

const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      positions: [],
      stakePositions: [],

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        };

        set((state) => ({
          transactions: [newTransaction, ...state.transactions],
        }));

        get().updatePosition(newTransaction);
      },

      updatePosition: (transaction) => {
        set((state) => {
          const positions = [...state.positions];
          const existingPosition = positions.find(
            (p) => p.asset === transaction.asset && p.isMock === transaction.isMock
          );

          if (existingPosition) {
            // Update existing position
            if (transaction.type === 'buy' || transaction.type === 'mock_buy') {
              const newAmount = existingPosition.amount + transaction.amount;
              const newCost = existingPosition.averageEntryPrice * existingPosition.amount +
                            transaction.price * transaction.amount;
              existingPosition.averageEntryPrice = newCost / newAmount;
              existingPosition.amount = newAmount;
            } else if (transaction.type === 'sell' || transaction.type === 'mock_sell') {
              const pnl = (transaction.price - existingPosition.averageEntryPrice) * transaction.amount;
              existingPosition.realizedPnL += pnl;
              existingPosition.amount -= transaction.amount;
            }
          } else {
            // Create new position
            positions.push({
              asset: transaction.asset,
              amount: transaction.amount,
              averageEntryPrice: transaction.price,
              realizedPnL: 0,
              unrealizedPnL: 0,
              isMock: transaction.isMock,
            });
          }

          return { positions };
        });
      },

      addStakePosition: (position) => {
        set((state) => ({
          stakePositions: [...state.stakePositions, position],
        }));
      },

      updateStakePosition: (asset, rewards) => {
        set((state) => ({
          stakePositions: state.stakePositions.map((pos) =>
            pos.asset === asset ? { ...pos, rewards: pos.rewards + rewards } : pos
          ),
        }));
      },

      getPositionPnL: (asset, isMock) => {
        const position = get().positions.find((p) => p.asset === asset && p.isMock === isMock);
        return {
          realized: position?.realizedPnL || 0,
          unrealized: position?.unrealizedPnL || 0,
        };
      },

      getTotalPnL: (isMock) => {
        const positions = get().positions.filter((p) => p.isMock === isMock);
        return positions.reduce(
          (acc, pos) => ({
            realized: acc.realized + pos.realizedPnL,
            unrealized: acc.unrealized + pos.unrealizedPnL,
          }),
          { realized: 0, unrealized: 0 }
        );
      },

      getTransactionHistory: (type) => {
        const transactions = get().transactions;
        if (!type) return transactions;
        return transactions.filter((tx) => tx.type === type);
      },
    }),
    {
      name: 'solx-transactions',
    }
  )
);

export { useTransactionStore };
