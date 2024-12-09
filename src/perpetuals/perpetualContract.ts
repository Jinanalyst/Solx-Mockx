import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, BN } from '@project-serum/anchor';
import { Position, OrderParams, MarketState, TradeDirection, FundingRate } from './types';

export class PerpetualContract {
  private static instance: PerpetualContract;
  private readonly PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');
  private readonly INSURANCE_FUND_ACCOUNT = new PublicKey('6zkf4DviZZkpWVEh53MrcQV6vGXGpESnNXgAvU6KpBUH');
  
  private constructor(
    private connection: Connection,
    private program: Program
  ) {}

  static getInstance(connection: Connection, program: Program): PerpetualContract {
    if (!PerpetualContract.instance) {
      PerpetualContract.instance = new PerpetualContract(connection, program);
    }
    return PerpetualContract.instance;
  }

  async openPosition(params: OrderParams): Promise<string> {
    try {
      const { size, price, leverage, direction, collateral } = params;
      
      // Calculate position details
      const liquidationPrice = this.calculateLiquidationPrice(price, leverage, direction);
      const maintenanceMargin = this.calculateMaintenanceMargin(size, price);
      
      // Create transaction
      const tx = new Transaction();
      
      // Add instruction to open position
      const instruction = await this.program.methods.openPosition({
        size,
        entryPrice: price,
        leverage,
        direction,
        collateral,
        liquidationPrice,
        maintenanceMargin,
      }).instruction();
      
      tx.add(instruction);
      
      // Send and confirm transaction
      const txId = await this.connection.sendTransaction(tx, [/* signers */]);
      await this.connection.confirmTransaction(txId);
      
      return txId;
    } catch (error) {
      console.error('Failed to open position:', error);
      throw error;
    }
  }

  async closePosition(positionId: PublicKey): Promise<string> {
    try {
      const tx = new Transaction();
      
      const instruction = await this.program.methods.closePosition({
        positionId,
      }).instruction();
      
      tx.add(instruction);
      
      const txId = await this.connection.sendTransaction(tx, [/* signers */]);
      await this.connection.confirmTransaction(txId);
      
      return txId;
    } catch (error) {
      console.error('Failed to close position:', error);
      throw error;
    }
  }

  async updateFundingRate(): Promise<FundingRate> {
    try {
      const marketState = await this.getMarketState();
      const indexPrice = await this.getIndexPrice();
      const perpPrice = await this.getPerpPrice();
      
      // Calculate new funding rate
      const fundingRate = this.calculateFundingRate(perpPrice, indexPrice);
      
      // Update on-chain
      const tx = new Transaction();
      const instruction = await this.program.methods.updateFundingRate({
        rate: fundingRate,
        timestamp: new BN(Date.now() / 1000),
      }).instruction();
      
      tx.add(instruction);
      
      await this.connection.sendTransaction(tx, [/* signers */]);
      
      return {
        rate: fundingRate,
        timestamp: new BN(Date.now() / 1000),
        isPositive: fundingRate.gt(new BN(0))
      };
    } catch (error) {
      console.error('Failed to update funding rate:', error);
      throw error;
    }
  }

  async checkLiquidations(): Promise<void> {
    try {
      const positions = await this.getAllPositions();
      const currentPrice = await this.getPerpPrice();
      
      for (const position of positions) {
        if (this.shouldLiquidate(position, currentPrice)) {
          await this.liquidatePosition(position.user);
        }
      }
    } catch (error) {
      console.error('Failed to check liquidations:', error);
      throw error;
    }
  }

  private calculateLiquidationPrice(
    entryPrice: BN,
    leverage: number,
    direction: TradeDirection
  ): BN {
    const maintenanceMargin = 0.05; // 5%
    const liquidationThreshold = 1 / leverage * maintenanceMargin;
    
    if (direction === TradeDirection.Long) {
      return entryPrice.mul(new BN(1 - liquidationThreshold));
    } else {
      return entryPrice.mul(new BN(1 + liquidationThreshold));
    }
  }

  private calculateMaintenanceMargin(size: BN, price: BN): BN {
    const maintenanceMarginRate = 0.05; // 5%
    return size.mul(price).mul(new BN(maintenanceMarginRate));
  }

  private calculateFundingRate(perpPrice: BN, indexPrice: BN): BN {
    const fundingInterval = 8 * 60 * 60; // 8 hours in seconds
    const diff = perpPrice.sub(indexPrice);
    return diff.div(new BN(fundingInterval));
  }

  private shouldLiquidate(position: Position, currentPrice: BN): boolean {
    return currentPrice.lte(position.liquidationPrice);
  }

  // Additional helper methods
  private async getMarketState(): Promise<MarketState> {
    // Implement fetching market state from program
    throw new Error('Not implemented');
  }

  private async getIndexPrice(): Promise<BN> {
    // Implement fetching index price from oracle
    throw new Error('Not implemented');
  }

  private async getPerpPrice(): Promise<BN> {
    // Implement fetching perp price from market
    throw new Error('Not implemented');
  }

  private async getAllPositions(): Promise<Position[]> {
    // Implement fetching all positions from program
    throw new Error('Not implemented');
  }

  private async liquidatePosition(user: PublicKey): Promise<void> {
    // Implement position liquidation
    throw new Error('Not implemented');
  }
}
