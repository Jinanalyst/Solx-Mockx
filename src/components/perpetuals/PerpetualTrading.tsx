import React, { useState, useEffect, useMemo } from 'react';
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
  Grid,
  Stack,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@chakra-ui/react';

export function PerpetualTrading() {
  const { publicKey } = useWallet();
  const {
    positions,
    currentPrice,
    fundingRate,
    balance,
    openPosition,
    loading,
    error
  } = usePerpetual();

  const [size, setSize] = useState('');
  const [leverage, setLeverage] = useState('1');
  const [direction, setDirection] = useState<TradeDirection>(TradeDirection.Long);
  const [collateral, setCollateral] = useState('');
  const toast = useToast();

  const formattedBalance = useMemo(() => {
    if (!balance) return '0.00';
    return (balance.toNumber() / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }, [balance]);

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

  const calculateRequiredCollateral = () => {
    const leverageValue = Number(leverage);
    const sizeValue = Number(size);
    const requiredCollateral = (sizeValue / leverageValue) * 100;
    return requiredCollateral.toFixed(2);
  };

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Perpetual Futures Trading</Text>
        <Stat textAlign="right">
          <StatLabel>Available Balance</StatLabel>
          <StatNumber>${formattedBalance} USDT</StatNumber>
        </Stat>
      </Flex>

      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <Box>
          <Tabs variant="enclosed">
            <TabList>
              <Tab>Long</Tab>
              <Tab>Short</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                    <FormControl>
                      <FormLabel>Size (SOL)</FormLabel>
                      <Input
                        type="number"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        placeholder="Enter size"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Leverage (1-20x)</FormLabel>
                      <Input
                        type="number"
                        value={leverage}
                        onChange={(e) => setLeverage(e.target.value)}
                        min="1"
                        max="20"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Required Collateral (USDT)</FormLabel>
                      <Input
                        value={calculateRequiredCollateral()}
                        isReadOnly
                      />
                      <FormHelperText>
                        {Number(leverage)}x leverage requires {(100 / Number(leverage)).toFixed(2)}% collateral
                      </FormHelperText>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme={direction === TradeDirection.Long ? 'green' : 'red'}
                      isLoading={loading}
                      isDisabled={!publicKey || !size || Number(size) <= 0}
                    >
                      {direction === TradeDirection.Long ? 'Long' : 'Short'} SOL/USDT
                    </Button>
                  </Stack>
                </form>
              </TabPanel>
              <TabPanel>
                {/* Similar form for Short position */}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        <Box>
          <Stat mb={4}>
            <StatLabel>Current SOL Price</StatLabel>
            <StatNumber>
              ${currentPrice ? (currentPrice.toNumber() / 1e9).toFixed(2) : '0.00'}
            </StatNumber>
            <StatHelpText>
              Funding Rate: {fundingRate ? (fundingRate.toNumber() / 1e6 * 100).toFixed(4) : '0.0000'}%
            </StatHelpText>
          </Stat>

          {/* Position list */}
          {positions.map(position => (
            <Box key={position.id}>
              {/* PositionCard component */}
            </Box>
          ))}
        </Box>
      </Grid>
    </Box>
  );
}
