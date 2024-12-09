import { createContext, useContext, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Position, OrderParams, MarketState, TradeDirection } from '../perpetuals/types';
import { MockPerpetualTrading } from '../services/mockPerpetualTrading';
import { useToast } from '@chakra-ui/react';

interface PerpetualContextState {
  positions: Position[];
  marketState: MarketState | null;
  currentPrice: BN | null;
  fundingRate: BN | null;
  balance: BN | null;
  openPosition: (params: OrderParams) => Promise<{ txId: string; mockxReward: number }>;
  closePosition: (positionId: string) => Promise<{ txId: string; pnl: BN; mockxReward: number }>;
  updateLeverage: (positionId: string, newLeverage: number) => Promise<void>;
  addCollateral: (positionId: string, amount: BN) => Promise<void>;
  removeCollateral: (positionId: string, amount: BN) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const PerpetualContext = createContext<PerpetualContextState | undefined>(undefined);

export function PerpetualProvider({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const [positions, setPositions] = useState<Position[]>([]);
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [currentPrice, setCurrentPrice] = useState<BN | null>(null);
  const [fundingRate, setFundingRate] = useState<BN | null>(null);
  const [balance, setBalance] = useState<BN | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const mockTrading = MockPerpetualTrading.getInstance();

  useEffect(() => {
    if (!publicKey) return;

    const fetchData = async () => {
      try {
        const [price, rate, userPositions, userBalance] = await Promise.all([
          mockTrading.getMarketPrice(),
          mockTrading.getFundingRate(),
          mockTrading.getPositions(publicKey),
          mockTrading.getBalance(publicKey)
        ]);

        setCurrentPrice(price);
        setFundingRate(rate);
        setPositions(userPositions);
        setBalance(userBalance);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const openPosition = async (params: OrderParams) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      const { positionId, mockxReward } = await mockTrading.openPosition(publicKey, params);
      
      // Refresh positions
      const userPositions = await mockTrading.getPositions(publicKey);
      setPositions(userPositions);

      toast({
        title: 'Position Opened',
        description: `Earned ${mockxReward.toFixed(2)} MOCKX tokens!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      return { txId: positionId, mockxReward };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open position';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const closePosition = async (positionId: string) => {
    if (!publicKey) throw new Error('Wallet not connected');
    
    try {
      setLoading(true);
      const { pnl, mockxReward } = await mockTrading.closePosition(positionId);
      
      // Refresh positions
      const userPositions = await mockTrading.getPositions(publicKey);
      setPositions(userPositions);

      toast({
        title: 'Position Closed',
        description: `PnL: ${pnl.toNumber() / 1e9} SOL, Earned ${mockxReward.toFixed(2)} MOCKX tokens!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      return { txId: Math.random().toString(36).substring(7), pnl, mockxReward };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to close position';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Implement other position management methods similarly
  const updateLeverage = async (positionId: string, newLeverage: number) => {
    throw new Error('Not implemented in mock trading');
  };

  const addCollateral = async (positionId: string, amount: BN) => {
    throw new Error('Not implemented in mock trading');
  };

  const removeCollateral = async (positionId: string, amount: BN) => {
    throw new Error('Not implemented in mock trading');
  };

  return (
    <PerpetualContext.Provider
      value={{
        positions,
        marketState,
        currentPrice,
        fundingRate,
        balance,
        openPosition,
        closePosition,
        updateLeverage,
        addCollateral,
        removeCollateral,
        loading,
        error,
      }}
    >
      {children}
    </PerpetualContext.Provider>
  );
}

export function usePerpetual() {
  const context = useContext(PerpetualContext);
  if (context === undefined) {
    throw new Error('usePerpetual must be used within a PerpetualProvider');
  }
  return context;
}
