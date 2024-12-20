import { FEE_CONFIG, calculateTradingFee, getMinimumFee, getFeeReceiver } from '../config/fees';
import { NetworkManager } from './networks';
import { parseEther } from 'ethers';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

export type Chain = 'SOLANA' | 'ETHEREUM' | 'BASE';

export class FeeHandler {
  private networkManager: NetworkManager;
  private chain: Chain;

  constructor(networkManager: NetworkManager, chain: Chain) {
    this.networkManager = networkManager;
    this.chain = chain;
  }

  async validateFeeAddress(): Promise<boolean> {
    const address = getFeeReceiver(this.chain);
    switch (this.chain) {
      case 'SOLANA':
        return this.networkManager.validateSolanaAddress(address);
      case 'ETHEREUM':
        return this.networkManager.validateEthereumAddress(address);
      case 'BASE':
        return this.networkManager.validateBaseAddress(address);
      default:
        return false;
    }
  }

  async getFeeAddressDetails() {
    const address = getFeeReceiver(this.chain);
    switch (this.chain) {
      case 'SOLANA':
        return this.networkManager.getSolanaAddressDetails(address);
      case 'ETHEREUM':
        return this.networkManager.getEthereumAddressDetails(address);
      case 'BASE':
        return this.networkManager.getBaseAddressDetails(address);
      default:
        throw new Error('Unsupported chain');
    }
  }

  calculateFee(tradeAmount: number): {
    feeAmount: number;
    receiverAddress: string;
    netAmount: number;
  } {
    const feeAmount = Math.max(
      calculateTradingFee(tradeAmount),
      getMinimumFee(this.chain)
    );

    return {
      feeAmount,
      receiverAddress: getFeeReceiver(this.chain),
      netAmount: tradeAmount - feeAmount
    };
  }

  async sendFee(
    amount: number,
    senderWallet: any // This should be a wallet/signer appropriate for the chain
  ): Promise<boolean> {
    try {
      const receiverAddress = getFeeReceiver(this.chain);
      
      // Validate receiver address before sending
      const isValid = await this.validateFeeAddress();
      if (!isValid) {
        throw new Error(`Invalid fee receiver address for ${this.chain}`);
      }

      switch (this.chain) {
        case 'SOLANA': {
          if (!('publicKey' in senderWallet)) {
            throw new Error('Invalid Solana wallet');
          }
          
          const connection = new Connection(this.networkManager.getSolanaEndpoint());
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: senderWallet.publicKey,
              toPubkey: new PublicKey(receiverAddress),
              lamports: amount * 1e9 // Convert SOL to lamports
            })
          );
          
          const signature = await connection.sendTransaction(transaction, [senderWallet]);
          await connection.confirmTransaction(signature);
          return true;
        }
        
        case 'ETHEREUM':
        case 'BASE': {
          if (!('sendTransaction' in senderWallet)) {
            throw new Error(`Invalid ${this.chain} wallet`);
          }
          
          const tx = {
            to: receiverAddress,
            value: parseEther(amount.toString())
          };
          
          const transaction = await senderWallet.sendTransaction(tx);
          await transaction.wait();
          return true;
        }
        
        default:
          throw new Error(`Unsupported chain: ${this.chain}`);
      }
    } catch (error) {
      console.error(`Error sending fee on ${this.chain}:`, error);
      return false;
    }
  }

  getFeeDetails() {
    return {
      feePercentage: FEE_CONFIG.MOCKX.FEE_PERCENTAGE,
      minimumFee: getMinimumFee(this.chain),
      receiverAddress: getFeeReceiver(this.chain),
      chain: this.chain
    };
  }
}
