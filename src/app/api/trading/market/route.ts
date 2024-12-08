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

    const marketData = await tradingService.getMarketData(pair);
    if (!marketData) {
      return NextResponse.json(
        { error: 'Trading pair not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ market: marketData });
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
