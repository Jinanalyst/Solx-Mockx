import axios from 'axios';

async function getSOLPairs() {
  try {
    // Get SPOT trading pairs
    const response = await axios.get('https://www.okx.com/api/v5/public/instruments?instType=SPOT');
    const pairs = response.data.data;

    // Filter SOL pairs
    const solPairs = pairs.filter((pair: any) => 
      pair.baseCcy === 'SOL' || pair.quoteCcy === 'SOL'
    );

    console.log(`\nTotal SOL trading pairs: ${solPairs.length}`);
    console.log('\nSOL trading pairs:');
    
    solPairs.forEach((pair: any) => {
      console.log(`${pair.baseCcy}/${pair.quoteCcy} - ${pair.instId} - Min size: ${pair.minSz}`);
    });

    // Show SOL-USDT specific details
    const solUsdt = pairs.find((pair: any) => pair.instId === 'SOL-USDT');
    if (solUsdt) {
      console.log('\nSOL-USDT Details:');
      console.log(`Minimum order size: ${solUsdt.minSz} SOL`);
      console.log(`Tick size: ${solUsdt.tickSz} USDT`);
      console.log(`Lot size: ${solUsdt.lotSz} SOL`);
    }

  } catch (error) {
    console.error('Error fetching SOL pairs:', error);
  }
}

getSOLPairs();
