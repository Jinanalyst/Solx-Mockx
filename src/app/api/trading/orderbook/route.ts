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

    const orderBook = await tradingService.getOrderBook(pair);
    if (!orderBook) {
      return NextResponse.json(
        { error: 'Trading pair not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ orderbook: orderBook });
  } catch (error) {
    console.error('Error fetching order book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order book' },
      { status: 500 }
    );
  }
}
