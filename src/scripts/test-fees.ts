import { FeeHandler } from '../lib/feeHandler';

async function testFeeConfiguration() {
  // Test for each chain
  const chains = ['SOLANA', 'ETHEREUM', 'BASE'] as const;
  
  console.log('🔍 Testing MOCKX Fee Configuration\n');
  
  for (const chain of chains) {
    console.log(`\n📊 ${chain} Configuration:`);
    console.log('========================');
    
    const feeHandler = new FeeHandler(chain);
    const feeDetails = feeHandler.getFeeDetails();
    
    console.log(`Fee Receiver: ${feeDetails.receiverAddress}`);
    console.log(`Fee Percentage: ${feeDetails.feePercentage * 100}%`);
    console.log(`Minimum Fee: ${feeDetails.minimumFee} MOCKX`);
    
    // Test fee calculation for different amounts
    const testAmounts = [100, 1000, 10000];
    
    console.log('\nFee Calculations:');
    for (const amount of testAmounts) {
      const { feeAmount, netAmount } = feeHandler.calculateFee(amount);
      console.log(`Trade Amount: ${amount} MOCKX`);
      console.log(`Fee Amount: ${feeAmount} MOCKX`);
      console.log(`Net Amount: ${netAmount} MOCKX\n`);
    }
  }
}

testFeeConfiguration();
