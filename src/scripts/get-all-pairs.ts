import axios from 'axios';
import { dexScreenerClient, SUPPORTED_CHAINS } from '../lib/dexscreener';
import okxClient from '../lib/okx';

async function getAllPairs() {
  try {
    console.log('Fetching pairs from multiple sources...\n');

    // 1. Get OKX SOL pairs
    console.log('OKX SOL Pairs:');
    const okxResponse = await axios.get('https://www.okx.com/api/v5/public/instruments?instType=SPOT');
    const okxPairs = okxResponse.data.data;
    const solPairs = okxPairs.filter((pair: any) => 
      pair.baseCcy === 'SOL' || pair.quoteCcy === 'SOL'
    );
    console.log(`Found ${solPairs.length} SOL pairs on OKX`);
    solPairs.slice(0, 5).forEach((pair: any) => {
      console.log(`${pair.baseCcy}/${pair.quoteCcy} - ${pair.instId}`);
    });

    // 2. Get DEX pairs for each chain
    console.log('\nDEX Pairs by Chain:');
    for (const [chain, chainId] of Object.entries(SUPPORTED_CHAINS)) {
      console.log(`\n${chain.toUpperCase()} Top Pairs:`);
      const pairs = await dexScreenerClient.getTopPairsByChain(chainId);
      
      if (pairs.pairs) {
        console.log(`Found ${pairs.pairs.length} pairs`);
        pairs.pairs.slice(0, 5).forEach((pair: any) => {
          console.log(
            `${pair.baseToken.symbol}/${pair.quoteToken.symbol} - ` +
            `${pair.dexId} - $${pair.priceUsd} - ` +
            `Volume 24h: $${Math.round(pair.volume.h24).toLocaleString()}`
          );
        });
      }
    }

    // 3. Search for specific tokens across all chains
    const searchTokens = ['SOL', 'ETH', 'MATIC'];
    console.log('\nSearching for specific tokens across all chains:');
    for (const token of searchTokens) {
      console.log(`\n${token} pairs:`);
      const results = await dexScreenerClient.searchPairs(token);
      if (results.pairs) {
        console.log(`Found ${results.pairs.length} pairs`);
        results.pairs.slice(0, 5).forEach((pair: any) => {
          console.log(
            `${pair.baseToken.symbol}/${pair.quoteToken.symbol} - ` +
            `${pair.chainId} - ${pair.dexId} - $${pair.priceUsd}`
          );
        });
      }
    }

  } catch (error) {
    console.error('Error fetching pairs:', error);
  }
}

getAllPairs();
