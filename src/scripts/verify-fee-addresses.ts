import { FeeHandler } from '../lib/feeHandler';

async function verifyFeeAddresses() {
  const networks = ['SOLANA', 'ETHEREUM', 'BASE'] as const;
  
  console.log('🔍 Verifying Fee Receiving Addresses\n');
  
  for (const network of networks) {
    console.log(`\n📊 ${network} Fee Address Verification:`);
    console.log('================================');
    
    const feeHandler = new FeeHandler(network);
    
    // Validate address format
    const isValid = await feeHandler.validateFeeAddress();
    console.log(`Address Format Valid: ${isValid ? '✅' : '❌'}`);
    
    // Get address details
    const details = await feeHandler.getFeeAddressDetails();
    const feeConfig = feeHandler.getFeeDetails();
    
    console.log('\nAddress Configuration:');
    console.log(`- Receiver Address: ${feeConfig.receiverAddress}`);
    console.log(`- Fee Percentage: ${feeConfig.feePercentage * 100}%`);
    console.log(`- Minimum Fee: ${feeConfig.minimumFee} MOCKX`);
    
    console.log('\nNetwork Details:');
    console.log(`- Native Token Balance: ${details.balance}`);
    console.log(`- Is Contract: ${details.hasContract ? 'Yes' : 'No'}`);
    
    // Test fee calculation
    const testAmount = 1000;
    const { feeAmount, netAmount } = feeHandler.calculateFee(testAmount);
    console.log('\nFee Calculation Test:');
    console.log(`- Test Amount: ${testAmount} MOCKX`);
    console.log(`- Fee Amount: ${feeAmount} MOCKX`);
    console.log(`- Net Amount: ${netAmount} MOCKX`);
  }
}

verifyFeeAddresses().catch(console.error);
