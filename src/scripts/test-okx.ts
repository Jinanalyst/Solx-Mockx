import okxClient from '../lib/okx';

async function testOKXConnection() {
  try {
    // Get all available instruments (trading pairs)
    console.log('\nGetting all trading pairs...');
    const instruments = await okxClient.getInstruments('SPOT'); // SPOT market pairs
    console.log(`Total number of trading pairs: ${instruments.data?.length || 0}`);
    
    // Show some example pairs
    console.log('\nExample trading pairs:');
    if (instruments.data && instruments.data.length > 0) {
      instruments.data.slice(0, 10).forEach((pair: any) => {
        console.log(`${pair.instId}: ${pair.baseCcy}/${pair.quoteCcy}`);
      });
    }

    // Get different market types
    const markets = ['SPOT', 'SWAP', 'FUTURES', 'OPTION'];
    for (const market of markets) {
      const marketInstruments = await okxClient.getInstruments(market);
      console.log(`\n${market} market pairs: ${marketInstruments.data?.length || 0}`);
    }

  } catch (error) {
    console.error('Error testing OKX connection:', error);
  }
}

testOKXConnection();
