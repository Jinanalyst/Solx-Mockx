import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useWallet } from '@solana/wallet-adapter-react';
import TradingInterface from '../TradingInterface';
import { tradingBalanceService } from '@/services/tradingBalanceService';

// Mock wallet adapter
vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: vi.fn(),
  useConnection: () => ({
    connection: {},
  }),
}));

// Mock trading balance service
vi.mock('@/services/tradingBalanceService', () => ({
  tradingBalanceService: {
    getBalance: vi.fn(),
    executeTrade: vi.fn(),
    initializeUserBalance: vi.fn(),
  },
}));

describe('TradingInterface', () => {
  const mockWallet = {
    publicKey: { toString: () => '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8' },
    connected: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useWallet as any).mockReturnValue(mockWallet);
    tradingBalanceService.getBalance.mockResolvedValue(1000);
    tradingBalanceService.executeTrade.mockResolvedValue(true);
  });

  describe('Order Placement', () => {
    it('should handle market buy orders', async () => {
      render(<TradingInterface />);

      // Fill order form
      fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
      fireEvent.click(screen.getByText(/market/i));
      fireEvent.click(screen.getByText(/buy/i));

      // Submit order
      fireEvent.click(screen.getByText(/place order/i));

      await waitFor(() => {
        expect(tradingBalanceService.executeTrade).toHaveBeenCalledWith(
          mockWallet.publicKey.toString(),
          'SOLX',
          'USDT',
          100,
          expect.any(Number),
          true
        );
      });
    });

    it('should handle limit sell orders', async () => {
      render(<TradingInterface />);

      // Fill order form
      fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50' } });
      fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '20' } });
      fireEvent.click(screen.getByText(/limit/i));
      fireEvent.click(screen.getByText(/sell/i));

      // Submit order
      fireEvent.click(screen.getByText(/place order/i));

      await waitFor(() => {
        expect(tradingBalanceService.executeTrade).toHaveBeenCalledWith(
          mockWallet.publicKey.toString(),
          'SOLX',
          'USDT',
          50,
          20,
          false
        );
      });
    });
  });

  describe('Balance Display', () => {
    it('should display user balances', async () => {
      tradingBalanceService.getBalance
        .mockResolvedValueOnce(100)  // SOLX balance
        .mockResolvedValueOnce(5000); // USDT balance

      render(<TradingInterface />);

      await waitFor(() => {
        expect(screen.getByText(/100\.00/)).toBeInTheDocument();
        expect(screen.getByText(/5,000\.00/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error for insufficient balance', async () => {
      tradingBalanceService.executeTrade.mockResolvedValue(false);

      render(<TradingInterface />);

      // Try to place order
      fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '10000' } });
      fireEvent.click(screen.getByText(/place order/i));

      await waitFor(() => {
        expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument();
      });
    });
  });
});
