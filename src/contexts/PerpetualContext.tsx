import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { PerpetualContract } from '../perpetuals/perpetualContract';
import { PriceOracle } from '../perpetuals/priceOracle';
import { VirtualAMM } from '../perpetuals/virtualAMM';
import { Position, OrderParams, TradeDirection, MarketState } from '../perpetuals/types';

interface PerpetualContextState {
  positions: Position[];
  marketState: MarketState | null;
  currentPrice: BN | null;
  fundingRate: BN | null;
  openPosition: (params: OrderParams) => Promise<string>;
  closePosition: (positionId: PublicKey) => Promise<string>;
  updateLeverage: (positionId: PublicKey, newLeverage: number) => Promise<void>;
  addCollateral: (positionId: PublicKey, amount: BN) => Promise<void>;
  removeCollateral: (positionId: PublicKey, amount: BN) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const PerpetualContext = createContext<PerpetualContextState | undefined>(undefined);

export function PerpetualProvider({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [positions, setPositions] = useState<Position[]>([]);
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [currentPrice, setCurrentPrice] = useState<BN | null>(null);
  const [fundingRate, setFundingRate] = useState<BN | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contracts and services
  const perpetualContract = PerpetualContract.getInstance(connection, {} as any); // Replace with actual program
  const priceOracle = PriceOracle.getInstance(connection);
  const vamm = VirtualAMM.getInstance(new BN(1000000), new BN(1000000)); // Initial liquidity

  useEffect(() => {
    if (!publicKey) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Initialize price oracle
        await priceOracle.initialize();
        
        // Fetch user positions
        const userPositions = await fetchUserPositions(publicKey);
        setPositions(userPositions);
        
        // Fetch market state
        const state = await fetchMarketState();
        setMarketState(state);
        
        // Start price updates
        startPriceUpdates();
        
        // Start funding rate updates
        startFundingRateUpdates();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      priceOracle.stop();
    };
  }, [publicKey]);

  const startPriceUpdates = () => {
    const updatePrice = async () => {
      try {
        const price = await priceOracle.getPrice('SOL/USD');
        setCurrentPrice(price);
      } catch (err) {
        console.error('Failed to update price:', err);
      }
    };

    updatePrice();
    const interval = setInterval(updatePrice, 1000);
    return () => clearInterval(interval);
  };

  const startFundingRateUpdates = () => {
    const updateFundingRate = async () => {
      try {
        const result = await perpetualContract.updateFundingRate();
        setFundingRate(result.rate);
      } catch (err) {
        console.error('Failed to update funding rate:', err);
      }
    };

    updateFundingRate();
    const interval = setInterval(updateFundingRate, 60000); // Update every minute
    return () => clearInterval(interval);
  };

  const openPosition = async (params: OrderParams): Promise<string> => {
    try {
      setLoading(true);
      const txId = await perpetualContract.openPosition(params);
      await fetchUserPositions(publicKey!);
      return txId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open position');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const closePosition = async (positionId: PublicKey): Promise<string> => {
    try {
      setLoading(true);
      const txId = await perpetualContract.closePosition(positionId);
      await fetchUserPositions(publicKey!);
      return txId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close position');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLeverage = async (positionId: PublicKey, newLeverage: number) => {
    // Implement leverage update logic
  };

  const addCollateral = async (positionId: PublicKey, amount: BN) => {
    // Implement add collateral logic
  };

  const removeCollateral = async (positionId: PublicKey, amount: BN) => {
    // Implement remove collateral logic
  };

  const fetchUserPositions = async (user: PublicKey): Promise<Position[]> => {
    // Implement fetching user positions
    return [];
  };

  const fetchMarketState = async (): Promise<MarketState> => {
    // Implement fetching market state
    return {} as MarketState;
  };

  return (
    <PerpetualContext.Provider
      value={{
        positions,
        marketState,
        currentPrice,
        fundingRate,
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
