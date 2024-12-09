import { PrismaClient, TransactionType, TransactionStatus, PortfolioType } from '@prisma/client';
import { getPriceFromAPI } from './priceService';

const prisma = new PrismaClient();

interface TransactionInput {
  userId: string;
  portfolioId: string;
  type: TransactionType;
  symbol: string;
  quantity: number;
  price: number;
  fee?: number;
}

export class PortfolioService {
  // Create a new portfolio for a user
  async createPortfolio(userId: string, type: PortfolioType) {
    return await prisma.portfolio.create({
      data: {
        userId,
        type,
        totalValue: 0,
      },
    });
  }

  // Execute a transaction and update portfolio
  async executeTransaction(input: TransactionInput) {
    const { userId, portfolioId, type, symbol, quantity, price, fee = 0 } = input;
    const total = quantity * price + fee;

    // Start transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          portfolioId,
          type,
          symbol,
          quantity,
          price,
          fee,
          total,
          status: TransactionStatus.PENDING,
        },
      });

      // 2. Update or create asset record
      const existingAsset = await tx.asset.findFirst({
        where: { portfolioId, symbol },
      });

      let updatedAsset;
      if (existingAsset) {
        const newQuantity = this.calculateNewQuantity(type, existingAsset.quantity, quantity);
        const newAvgPrice = this.calculateNewAveragePrice(
          type,
          existingAsset.quantity,
          existingAsset.avgPrice,
          quantity,
          price
        );

        updatedAsset = await tx.asset.update({
          where: { id: existingAsset.id },
          data: {
            quantity: newQuantity,
            avgPrice: newAvgPrice,
            currentPrice: price,
            lastUpdated: new Date(),
          },
        });
      } else {
        updatedAsset = await tx.asset.create({
          data: {
            portfolioId,
            symbol,
            quantity: this.calculateNewQuantity(type, 0, quantity),
            avgPrice: price,
            currentPrice: price,
            lastUpdated: new Date(),
          },
        });
      }

      // 3. Update portfolio total value
      const portfolio = await this.updatePortfolioValue(tx, portfolioId);

      // 4. Create audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: `TRANSACTION_${type}`,
          details: {
            transactionId: transaction.id,
            portfolioId,
            symbol,
            quantity,
            price,
            total,
          },
        },
      });

      // 5. Update transaction status to completed
      const completedTransaction = await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: TransactionStatus.COMPLETED },
      });

      return {
        transaction: completedTransaction,
        asset: updatedAsset,
        portfolio,
      };
    });
  }

  // Get portfolio summary
  async getPortfolioSummary(portfolioId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        assets: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!portfolio) throw new Error('Portfolio not found');

    // Update current prices
    const updatedAssets = await Promise.all(
      portfolio.assets.map(async (asset) => {
        const currentPrice = await getPriceFromAPI(asset.symbol);
        if (currentPrice !== asset.currentPrice) {
          return prisma.asset.update({
            where: { id: asset.id },
            data: {
              currentPrice,
              lastUpdated: new Date(),
            },
          });
        }
        return asset;
      })
    );

    // Calculate total value
    const totalValue = updatedAssets.reduce(
      (sum, asset) => sum + asset.quantity * asset.currentPrice,
      0
    );

    // Update portfolio total value if changed
    if (totalValue !== portfolio.totalValue) {
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { totalValue },
      });
    }

    return {
      ...portfolio,
      assets: updatedAssets,
      totalValue,
    };
  }

  // Helper methods
  private calculateNewQuantity(type: TransactionType, currentQty: number, transactionQty: number): number {
    switch (type) {
      case TransactionType.BUY:
      case TransactionType.MOCK_BUY:
      case TransactionType.DEPOSIT:
      case TransactionType.STAKE:
        return currentQty + transactionQty;
      case TransactionType.SELL:
      case TransactionType.MOCK_SELL:
      case TransactionType.WITHDRAWAL:
      case TransactionType.UNSTAKE:
        return currentQty - transactionQty;
      default:
        throw new Error(`Invalid transaction type: ${type}`);
    }
  }

  private calculateNewAveragePrice(
    type: TransactionType,
    currentQty: number,
    currentAvgPrice: number,
    transactionQty: number,
    transactionPrice: number
  ): number {
    if (
      type === TransactionType.BUY ||
      type === TransactionType.MOCK_BUY ||
      type === TransactionType.DEPOSIT ||
      type === TransactionType.STAKE
    ) {
      const totalValue = currentQty * currentAvgPrice + transactionQty * transactionPrice;
      const totalQuantity = currentQty + transactionQty;
      return totalValue / totalQuantity;
    }
    return currentAvgPrice; // Keep current average price for sells and withdrawals
  }

  private async updatePortfolioValue(tx: PrismaClient, portfolioId: string) {
    const assets = await tx.asset.findMany({
      where: { portfolioId },
    });

    const totalValue = assets.reduce(
      (sum, asset) => sum + asset.quantity * asset.currentPrice,
      0
    );

    return await tx.portfolio.update({
      where: { id: portfolioId },
      data: { totalValue },
    });
  }
}
