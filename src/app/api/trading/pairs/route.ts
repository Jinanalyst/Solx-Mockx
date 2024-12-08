import { NextResponse } from 'next/server';
import { tradingService } from '@/services/trading';

export async function GET() {
  try {
    const pairs = await tradingService.getTradingPairs();
    return NextResponse.json({ pairs });
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trading pairs' },
      { status: 500 }
    );
  }
}
