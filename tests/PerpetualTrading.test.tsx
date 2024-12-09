import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PerpetualTrading } from '../src/components/perpetuals/PerpetualTrading';
import { PerpetualProvider } from '../src/contexts/PerpetualContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { BN } from '@project-serum/anchor';
import { TradeDirection } from '../src/perpetuals/types';

// Mock wallet adapter
vi.mock('@solana/wallet-adapter-react', () => ({
  useWallet: vi.fn(),
}));

// Mock the context
vi.mock('../src/contexts/PerpetualContext', () => ({
  usePerpetual: () => ({
    positions: [],
    currentPrice: new BN(50_000_000), // $50
    fundingRate: new BN(0),
    openPosition: vi.fn().mockResolvedValue('tx-id'),
    loading: false,
    error: null,
  }),
  PerpetualProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('PerpetualTrading', () => {
  beforeEach(() => {
    (useWallet as any).mockImplementation(() => ({
      publicKey: 'mock-public-key',
      connected: true,
    }));
  });

  it('renders trading interface correctly', () => {
    render(
      <PerpetualProvider>
        <PerpetualTrading />
      </PerpetualProvider>
    );

    expect(screen.getByText('Long')).toBeInTheDocument();
    expect(screen.getByText('Short')).toBeInTheDocument();
    expect(screen.getByText('Size (SOL)')).toBeInTheDocument();
    expect(screen.getByText('Leverage')).toBeInTheDocument();
  });

  it('handles long position creation', async () => {
    const { getByText, getByPlaceholderText } = render(
      <PerpetualProvider>
        <PerpetualTrading />
      </PerpetualProvider>
    );

    // Fill form
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '1' } });
    fireEvent.click(getByText('Long'));

    // Submit form
    fireEvent.click(getByText('Long SOL'));

    await waitFor(() => {
      expect(screen.getByText('Position opened successfully')).toBeInTheDocument();
    });
  });

  it('handles short position creation', async () => {
    const { getByText, getByPlaceholderText } = render(
      <PerpetualProvider>
        <PerpetualTrading />
      </PerpetualProvider>
    );

    // Fill form
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '1' } });
    fireEvent.click(getByText('Short'));

    // Submit form
    fireEvent.click(getByText('Short SOL'));

    await waitFor(() => {
      expect(screen.getByText('Position opened successfully')).toBeInTheDocument();
    });
  });

  it('validates input fields', async () => {
    const { getByText } = render(
      <PerpetualProvider>
        <PerpetualTrading />
      </PerpetualProvider>
    );

    // Try to submit without filling fields
    fireEvent.click(getByText('Long SOL'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument();
    });
  });

  it('displays loading state during position creation', async () => {
    const { getByText, getByPlaceholderText } = render(
      <PerpetualProvider>
        <PerpetualTrading />
      </PerpetualProvider>
    );

    // Fill form
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '1' } });
    fireEvent.click(getByText('Long'));

    // Submit form
    fireEvent.click(getByText('Long SOL'));

    expect(getByText('Opening Position')).toBeInTheDocument();
  });

  it('displays error message on failed position creation', async () => {
    // Mock error
    vi.mock('../src/contexts/PerpetualContext', () => ({
      usePerpetual: () => ({
        positions: [],
        currentPrice: new BN(50_000_000),
        fundingRate: new BN(0),
        openPosition: vi.fn().mockRejectedValue(new Error('Insufficient funds')),
        loading: false,
        error: 'Insufficient funds',
      }),
    }));

    const { getByText, getByPlaceholderText } = render(
      <PerpetualProvider>
        <PerpetualTrading />
      </PerpetualProvider>
    );

    // Fill form and submit
    fireEvent.change(getByPlaceholderText('0.00'), { target: { value: '1' } });
    fireEvent.click(getByText('Long SOL'));

    await waitFor(() => {
      expect(screen.getByText('Insufficient funds')).toBeInTheDocument();
    });
  });
});
