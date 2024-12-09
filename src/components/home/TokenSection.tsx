'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getSolxTokenInfo, formatNumber, TokenInfo } from '@/services/tokenService';
import { Skeleton } from '@/components/ui/skeleton';

export function TokenSection() {
  const [tokenData, setTokenData] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const data = await getSolxTokenInfo();
        setTokenData(data);
      } catch (error) {
        console.error('Error fetching token data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTokenData, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderSkeleton = () => (
    <div className="animate-pulse">
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-6 w-24" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-center mb-8">SOLX Token</h1>
      
      {/* Price Card */}
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Price</p>
            {loading ? renderSkeleton() : (
              <p className="text-3xl font-bold">${tokenData?.price.toFixed(4)}</p>
            )}
          </div>
          <div className="text-right">
            {loading ? renderSkeleton() : (
              <>
                <span className={`text-lg ${tokenData?.change24h && tokenData.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tokenData?.change24h && tokenData.change24h >= 0 ? '▲' : '▼'} 
                  {tokenData?.change24h ? Math.abs(tokenData.change24h).toFixed(2) : 0}%
                </span>
                <p className="text-sm text-muted-foreground">24h Change</p>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Tokenomics Card */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Tokenomics</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
              </svg>
              <span className="text-muted-foreground">Total Supply</span>
            </div>
            {loading ? renderSkeleton() : (
              <span className="font-medium">{tokenData?.totalSupply ? formatNumber(tokenData.totalSupply) : '0'}</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" />
              </svg>
              <span className="text-muted-foreground">Circulating Supply</span>
            </div>
            {loading ? renderSkeleton() : (
              <span className="font-medium">{tokenData?.circulatingSupply ? formatNumber(tokenData.circulatingSupply) : '0'}</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-muted-foreground">Market Cap</span>
            </div>
            {loading ? renderSkeleton() : (
              <span className="font-medium">${tokenData?.marketCap ? formatNumber(tokenData.marketCap) : '0'}</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span className="text-muted-foreground">Holders</span>
            </div>
            {loading ? renderSkeleton() : (
              <span className="font-medium">{tokenData?.holders ? formatNumber(tokenData.holders) : '0'}</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span className="text-muted-foreground">24h Volume</span>
            </div>
            {loading ? renderSkeleton() : (
              <span className="font-medium">${tokenData?.volume24h ? formatNumber(tokenData.volume24h) : '0'}</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
