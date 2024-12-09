import { create } from 'zustand';
import { PortfolioService } from '@/services/portfolioService';
import { PortfolioType, TransactionType } from '@prisma/client';

interface PortfolioState {
  portfolios: any[];
  currentPortfolio: any | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializePortfolio: (userId: string, type: PortfolioType) => Promise<void>;
  executeTransaction: (transactionInput: any) => Promise<void>;
  fetchPortfolioSummary: (portfolioId: string) => Promise<void>;
  setCurrentPortfolio: (portfolioId: string) => void;
}

const portfolioService = new PortfolioService();

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  error: null,

  initializePortfolio: async (userId: string, type: PortfolioType) => {
    try {
      set({ isLoading: true, error: null });
      const portfolio = await portfolioService.createPortfolio(userId, type);
      set((state) => ({
        portfolios: [...state.portfolios, portfolio],
        currentPortfolio: portfolio,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  executeTransaction: async (transactionInput) => {
    try {
      set({ isLoading: true, error: null });
      const result = await portfolioService.executeTransaction(transactionInput);
      
      // Update the portfolio in state
      set((state) => ({
        portfolios: state.portfolios.map((p) =>
          p.id === result.portfolio.id ? result.portfolio : p
        ),
        currentPortfolio:
          state.currentPortfolio?.id === result.portfolio.id
            ? result.portfolio
            : state.currentPortfolio,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchPortfolioSummary: async (portfolioId: string) => {
    try {
      set({ isLoading: true, error: null });
      const summary = await portfolioService.getPortfolioSummary(portfolioId);
      
      set((state) => ({
        portfolios: state.portfolios.map((p) =>
          p.id === portfolioId ? summary : p
        ),
        currentPortfolio:
          state.currentPortfolio?.id === portfolioId
            ? summary
            : state.currentPortfolio,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setCurrentPortfolio: (portfolioId: string) => {
    const portfolio = get().portfolios.find((p) => p.id === portfolioId);
    if (portfolio) {
      set({ currentPortfolio: portfolio });
    }
  },
}));
