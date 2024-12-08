import { 
  fetchAllSolanaPairs, 
  fetchTokenPrice, 
  fetchTokenOrderbook, 
  fetchTokenOHLC,
  fetchTokenMetadata,
  fetchPoolInfo
} from '../lib/api';

const SOL_ADDRESS = 'So11111111111111111111111111111111111111112';
const USDC_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function testAPI() {
  try {
    console.log('\n=== Testing Birdeye API Integration ===\n');

    // Test 1: Fetch all trading pairs
    console.log('1. Testing fetchAllSolanaPairs()...');
    const pairs = await fetchAllSolanaPairs();
    console.log(`Found ${pairs.length} trading pairs`);
    if (pairs.length > 0) {
      console.log('First pair:', JSON.stringify(pairs[0], null, 2));
    }

    // Test 2: Fetch SOL price
    console.log('\n2. Testing fetchTokenPrice() for SOL...');
    const solPrice = await fetchTokenPrice(SOL_ADDRESS);
    console.log('SOL price:', solPrice);

    // Test 3: Fetch SOL orderbook
    console.log('\n3. Testing fetchTokenOrderbook() for SOL...');
    const orderbook = await fetchTokenOrderbook(SOL_ADDRESS);
    if (orderbook) {
      console.log('Orderbook depth:', {
        bids: orderbook.bids?.length || 0,
        asks: orderbook.asks?.length || 0
      });
    }

    // Test 4: Fetch SOL OHLC
    console.log('\n4. Testing fetchTokenOHLC() for SOL...');
    const ohlc = await fetchTokenOHLC(SOL_ADDRESS);
    if (ohlc && ohlc.length > 0) {
      console.log('Latest OHLC data:', ohlc[ohlc.length - 1]);
    }

    // Test 5: Fetch SOL metadata
    console.log('\n5. Testing fetchTokenMetadata() for SOL...');
    const metadata = await fetchTokenMetadata(SOL_ADDRESS);
    console.log('SOL metadata:', JSON.stringify(metadata, null, 2));

    // Test 6: Fetch pool info for SOL/USDC
    if (pairs.length > 0 && pairs[0].pairAddress) {
      console.log('\n6. Testing fetchPoolInfo()...');
      const poolInfo = await fetchPoolInfo(pairs[0].pairAddress);
      console.log('Pool info:', JSON.stringify(poolInfo, null, 2));
    }

    console.log('\n=== All tests completed ===\n');
  } catch (error: any) {
    console.error('Test failed:', error.message);
  }
}

testAPI();
