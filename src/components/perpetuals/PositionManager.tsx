import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { usePerpetual } from '../../contexts/PerpetualContext';
import { Position, TradeDirection } from '../../perpetuals/types';

export function PositionManager() {
  const {
    positions,
    currentPrice,
    closePosition,
    updateLeverage,
    addCollateral,
    removeCollateral,
    loading,
  } = usePerpetual();

  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [modalAction, setModalAction] = useState<'leverage' | 'collateral' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleClose = async (position: Position) => {
    try {
      await closePosition(position.user);
      toast({
        title: 'Success',
        description: 'Position closed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to close position',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleModalAction = async () => {
    if (!selectedPosition || !modalAction) return;

    try {
      switch (modalAction) {
        case 'leverage':
          await updateLeverage(selectedPosition.user, parseFloat(inputValue));
          break;
        case 'collateral':
          if (parseFloat(inputValue) > 0) {
            await addCollateral(selectedPosition.user, new BN(parseFloat(inputValue) * 1e9));
          } else {
            await removeCollateral(selectedPosition.user, new BN(Math.abs(parseFloat(inputValue)) * 1e9));
          }
          break;
      }

      toast({
        title: 'Success',
        description: 'Position updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onClose();
      setInputValue('');
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update position',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const calculatePnL = (position: Position): number => {
    if (!currentPrice) return 0;
    
    const entryPrice = position.entryPrice.toNumber() / 1e6;
    const current = currentPrice.toNumber() / 1e6;
    const size = position.size.toNumber() / 1e9;
    
    if (position.direction === TradeDirection.Long) {
      return (current - entryPrice) * size * position.leverage;
    } else {
      return (entryPrice - current) * size * position.leverage;
    }
  };

  const calculateROE = (position: Position): number => {
    const pnl = calculatePnL(position);
    const collateral = position.collateral.toNumber() / 1e9;
    return (pnl / collateral) * 100;
  };

  return (
    <Box p={4}>
      <Text fontSize="xl" mb={4}>Open Positions</Text>
      
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Direction</Th>
            <Th>Size</Th>
            <Th>Leverage</Th>
            <Th>Entry Price</Th>
            <Th>Mark Price</Th>
            <Th>PnL</Th>
            <Th>ROE%</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {positions.map((position) => (
            <Tr key={position.user.toString()}>
              <Td color={position.direction === TradeDirection.Long ? 'green.500' : 'red.500'}>
                {position.direction}
              </Td>
              <Td>{(position.size.toNumber() / 1e9).toFixed(3)} SOL</Td>
              <Td>{position.leverage}x</Td>
              <Td>${(position.entryPrice.toNumber() / 1e6).toFixed(2)}</Td>
              <Td>${currentPrice ? (currentPrice.toNumber() / 1e6).toFixed(2) : '-'}</Td>
              <Td color={calculatePnL(position) >= 0 ? 'green.500' : 'red.500'}>
                ${calculatePnL(position).toFixed(2)}
              </Td>
              <Td color={calculateROE(position) >= 0 ? 'green.500' : 'red.500'}>
                {calculateROE(position).toFixed(2)}%
              </Td>
              <Td>
                <Button
                  size="sm"
                  colorScheme="blue"
                  mr={2}
                  onClick={() => {
                    setSelectedPosition(position);
                    setModalAction('leverage');
                    onOpen();
                  }}
                >
                  Adjust
                </Button>
                <Button
                  size="sm"
                  colorScheme="red"
                  isLoading={loading}
                  onClick={() => handleClose(position)}
                >
                  Close
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalAction === 'leverage' ? 'Adjust Leverage' : 'Adjust Collateral'}
          </ModalHeader>
          <ModalBody>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={modalAction === 'leverage' ? 'New leverage' : 'Amount (+ to add, - to remove)'}
              type="number"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleModalAction} isLoading={loading}>
              Confirm
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
