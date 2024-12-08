import { useQuery, useMutation } from '@tanstack/react-query';
import { okxApi } from '@/utils/okx';

interface MarketData {
  instId: string;
  last: string;
  askPx: string;
  bidPx: string;
  volume24h: string;
  volCcy24h: string;
  ts: string;
}

export function useOKX() {
  // Get market data for a specific trading pair
  const useMarketData = (instId: string) => {
    return useQuery({
      queryKey: ['marketData', instId],
      queryFn: async () => {
        const response = await okxApi.get(`/market/ticker/${instId}`);
        return response.data as MarketData;
      },
      refetchInterval: 5000, // Refresh every 5 seconds
    });
  };

  // Place a trade order
  const usePlaceOrder = () => {
    return useMutation({
      mutationFn: async ({
        instId,
        tdMode,
        side,
        ordType,
        sz,
        px,
      }: {
        instId: string;
        tdMode: 'cash' | 'isolated' | 'cross';
        side: 'buy' | 'sell';
        ordType: 'market' | 'limit';
        sz: string;
        px?: string;
      }) => {
        const response = await okxApi.post('/trade/order', {
          instId,
          tdMode,
          side,
          ordType,
          sz,
          px,
        });
        return response.data;
      },
    });
  };

  // Get account balance
  const useAccountBalance = () => {
    return useQuery({
      queryKey: ['accountBalance'],
      queryFn: async () => {
        const response = await okxApi.get('/account/balance');
        return response.data;
      },
      refetchInterval: 10000, // Refresh every 10 seconds
    });
  };

  return {
    useMarketData,
    usePlaceOrder,
    useAccountBalance,
  };
}

export default useOKX;
