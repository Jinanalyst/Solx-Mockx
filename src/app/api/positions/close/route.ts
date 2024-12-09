import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { positionId } = await request.json();

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the position
      const position = await tx.position.findUnique({
        where: { id: positionId },
      });

      if (!position) {
        throw new Error('Position not found');
      }

      if (position.status !== 'OPEN') {
        throw new Error('Position is already closed');
      }

      // Close the position
      const closedPosition = await tx.position.update({
        where: { id: positionId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          realizedPnL: position.unrealizedPnL,
        },
      });

      // Create a transaction record
      await tx.transaction.create({
        data: {
          userId: position.userId,
          portfolioId: position.portfolioId,
          type: position.type === 'LONG' ? 'SELL' : 'BUY',
          symbol: position.symbol,
          quantity: position.quantity,
          price: position.currentPrice,
          total: position.quantity * position.currentPrice,
          status: 'COMPLETED',
          positionId: position.id,
        },
      });

      return closedPosition;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error closing position:', error);
    return NextResponse.json(
      { error: 'Failed to close position' },
      { status: 500 }
    );
  }
}
