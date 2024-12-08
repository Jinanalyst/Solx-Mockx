import { NetworkManager } from '../lib/networks';
import { FEE_CONFIG } from '../config/fees';

async function testNetworkAddresses() {
  console.log('🔍 Testing Network Addresses\n');

  // Initialize NetworkManager with mainnet
  const networkManager = new NetworkManager('MAINNET');

  // Test each fee receiver address
  for (const [network, address] of Object.entries(FEE_CONFIG.MOCKX.RECEIVERS)) {
    console.log(`\n📊 Testing ${network} Address: ${address}`);
    console.log('=====================================');

    // Validate address format
    const isValid = await networkManager.validateAddressForNetwork(
      network as 'SOLANA' | 'ETHEREUM' | 'BASE',
      address
    );
    console.log(`Address Format Valid: ${isValid ? '✅' : '❌'}`);

    if (isValid) {
      // Get detailed information about the address
      const details = await networkManager.getAddressDetails(
        network as 'SOLANA' | 'ETHEREUM' | 'BASE',
        address
      );

      console.log('\nAddress Details:');
      console.log(`- Checksum/Canonical Address: ${details.address}`);
      console.log(`- Native Token Balance: ${details.balance}`);
      console.log(`- Has Contract: ${details.hasContract ? 'Yes' : 'No'}`);
    }
  }
}

testNetworkAddresses().catch(console.error);
