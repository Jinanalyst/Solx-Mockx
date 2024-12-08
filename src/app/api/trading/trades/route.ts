import { NextResponse } from 'next/server';
import { tradingService } from '@/services/trading';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pair = searchParams.get('pair');

    if (!pair) {
      return NextResponse.json(
        { error: 'Trading pair is required' },
        { status: 400 }
      );
    }

    const trades = await tradingService.getRecentTrades(pair);
    return NextResponse.json({ trades });
  } catch (error) {
    console.error('Error fetching recent trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent trades' },
      { status: 500 }
    );
  }
}
