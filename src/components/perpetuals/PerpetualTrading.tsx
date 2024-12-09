import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { usePerpetual } from '../../contexts/PerpetualContext';
import { TradeDirection, OrderParams } from '../../perpetuals/types';
import {
  Box,
  Button,
  Flex,
  Input,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/react';

export function PerpetualTrading() {
  const { publicKey } = useWallet();
  const {
    positions,
    currentPrice,
    fundingRate,
    openPosition,
    loading,
    error
  } = usePerpetual();

  const [size, setSize] = useState('');
  const [leverage, setLeverage] = useState('1');
  const [direction, setDirection] = useState<TradeDirection>(TradeDirection.Long);
  const [collateral, setCollateral] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    try {
      const params: OrderParams = {
        size: new BN(parseFloat(size) * 1e6),
        price: currentPrice!,
        leverage: parseInt(leverage),
        direction,
        collateral: new BN(parseFloat(collateral) * 1e9),
      };

      await openPosition(params);
      
      toast({
        title: 'Success',
        description: 'Position opened successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setSize('');
      setLeverage('1');
      setCollateral('');
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to open position',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Flex direction="column" gap={4}>
        {/* Market Information */}
        <Flex gap={4}>
          <Stat>
            <StatLabel>Current Price</StatLabel>
            <StatNumber>
              ${currentPrice ? (currentPrice.toNumber() / 1e6).toFixed(2) : '-.--'}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Funding Rate</StatLabel>
            <StatNumber>
              {fundingRate ? (fundingRate.toNumber() * 100).toFixed(4) : '-.--'}%
            </StatNumber>
            <StatHelpText>8h</StatHelpText>
          </Stat>
        </Flex>

        {/* Trading Interface */}
        <Tabs variant="soft-rounded">
          <TabList>
            <Tab>Market</Tab>
            <Tab>Limit</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <form onSubmit={handleSubmit}>
                <Flex direction="column" gap={4}>
                  {/* Direction Selection */}
                  <Flex gap={2}>
                    <Button
                      flex={1}
                      colorScheme={direction === TradeDirection.Long ? 'green' : 'gray'}
                      onClick={() => setDirection(TradeDirection.Long)}
                      type="button"
                    >
                      Long
                    </Button>
                    <Button
                      flex={1}
                      colorScheme={direction === TradeDirection.Short ? 'red' : 'gray'}
                      onClick={() => setDirection(TradeDirection.Short)}
                      type="button"
                    >
                      Short
                    </Button>
                  </Flex>

                  {/* Size Input */}
                  <Box>
                    <Text mb={2}>Size (SOL)</Text>
                    <Input
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="0.00"
                      type="number"
                      min="0"
                    />
                  </Box>

                  {/* Leverage Selection */}
                  <Box>
                    <Text mb={2}>Leverage</Text>
                    <Select
                      value={leverage}
                      onChange={(e) => setLeverage(e.target.value)}
                    >
                      {[1, 2, 3, 5, 10, 20].map((lev) => (
                        <option key={lev} value={lev}>
                          {lev}x
                        </option>
                      ))}
                    </Select>
                  </Box>

                  {/* Collateral Input */}
                  <Box>
                    <Text mb={2}>Collateral (SOL)</Text>
                    <Input
                      value={collateral}
                      onChange={(e) => setCollateral(e.target.value)}
                      placeholder="0.00"
                      type="number"
                      min="0"
                    />
                  </Box>

                  <Button
                    type="submit"
                    colorScheme={direction === TradeDirection.Long ? 'green' : 'red'}
                    isLoading={loading}
                    loadingText="Opening Position"
                  >
                    {direction === TradeDirection.Long ? 'Long' : 'Short'} SOL
                  </Button>
                </Flex>
              </form>
            </TabPanel>

            <TabPanel>
              <Text>Limit orders coming soon</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Box>
  );
}
