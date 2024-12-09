import React from 'react';
import {
  Box,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Text,
} from '@chakra-ui/react';
import { usePerpetual } from '../../contexts/PerpetualContext';
import BN from 'bn.js';

export function MarketStats() {
  const { marketState, currentPrice, fundingRate } = usePerpetual();

  const formatUSD = (value: BN | null): string => {
    if (!value) return '$-.--';
    return `$${(value.toNumber() / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(4)}%`;
  };

  const calculatePriceChange = (): { change: number; isPositive: boolean } => {
    // This should be implemented with actual 24h price data
    return { change: 0.0075, isPositive: true };
  };

  const priceChange = calculatePriceChange();

  return (
    <Box p={4} borderRadius="lg" bg="white" shadow="sm">
      <Text fontSize="xl" mb={4}>Market Statistics</Text>
      
      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        {/* Price Information */}
        <Stat>
          <StatLabel>SOL-PERP Price</StatLabel>
          <StatNumber>{formatUSD(currentPrice)}</StatNumber>
          <StatHelpText>
            <StatArrow type={priceChange.isPositive ? 'increase' : 'decrease'} />
            {formatPercentage(priceChange.change)} (24h)
          </StatHelpText>
        </Stat>

        {/* Funding Rate */}
        <Stat>
          <StatLabel>Funding Rate (8h)</StatLabel>
          <StatNumber>
            {fundingRate ? formatPercentage(fundingRate.toNumber() / 1e6) : '-.---%'}
          </StatNumber>
          <StatHelpText>
            Next funding in: {/* Add countdown timer */}
          </StatHelpText>
        </Stat>

        {/* Trading Volume */}
        <Stat>
          <StatLabel>24h Volume</StatLabel>
          <StatNumber>
            {marketState ? formatUSD(marketState.totalLongPositions.add(marketState.totalShortPositions)) : '$-.--'}
          </StatNumber>
        </Stat>
      </Grid>

      <Divider my={4} />

      <Grid templateColumns="repeat(4, 1fr)" gap={6}>
        {/* Market Details */}
        <Stat>
          <StatLabel>Open Interest (Long)</StatLabel>
          <StatNumber>
            {marketState ? formatUSD(marketState.totalLongPositions) : '$-.--'}
          </StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Open Interest (Short)</StatLabel>
          <StatNumber>
            {marketState ? formatUSD(marketState.totalShortPositions) : '$-.--'}
          </StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Insurance Fund</StatLabel>
          <StatNumber>
            {marketState ? formatUSD(marketState.insuranceFund) : '$-.--'}
          </StatNumber>
        </Stat>

        <Stat>
          <StatLabel>Max Leverage</StatLabel>
          <StatNumber>
            {marketState ? `${marketState.maxLeverage}x` : '--x'}
          </StatNumber>
        </Stat>
      </Grid>

      <Divider my={4} />

      <Grid templateColumns="repeat(3, 1fr)" gap={6}>
        {/* Fee Information */}
        <Box>
          <Text fontWeight="bold" mb={2}>Trading Fees</Text>
          <Text>Maker: 0.02%</Text>
          <Text>Taker: 0.05%</Text>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>Liquidation</Text>
          <Text>Maintenance Margin: {marketState ? formatPercentage(marketState.maintenanceMargin) : '-.--'}</Text>
          <Text>Liquidation Fee: {marketState ? formatPercentage(marketState.liquidationFee) : '-.--'}</Text>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>Min/Max Position</Text>
          <Text>Min Collateral: {marketState ? formatUSD(marketState.minCollateral) : '$-.--'}</Text>
          <Text>Max Leverage: {marketState ? `${marketState.maxLeverage}x` : '--x'}</Text>
        </Box>
      </Grid>
    </Box>
  );
}
