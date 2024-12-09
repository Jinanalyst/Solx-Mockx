import { PublicKey } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';

export class MockBalanceService {
  private static instance: MockBalanceService;
  private balances: Map<string, BN>;
  private readonly INITIAL_BALANCE = new BN(1_000_000_000_000); // 1,000,000 USDT (6 decimals)

  private constructor() {
    this.balances = new Map();
  }

  static getInstance(): MockBalanceService {
    if (!MockBalanceService.instance) {
      MockBalanceService.instance = new MockBalanceService();
    }
    return MockBalanceService.instance;
  }

  getBalance(user: PublicKey): BN {
    const userKey = user.toBase58();
    if (!this.balances.has(userKey)) {
      this.balances.set(userKey, this.INITIAL_BALANCE);
    }
    return this.balances.get(userKey)!;
  }

  async updateBalance(user: PublicKey, amount: BN): Promise<void> {
    const userKey = user.toBase58();
    const currentBalance = this.getBalance(user);
    const newBalance = currentBalance.add(amount);
    
    if (newBalance.lt(new BN(0))) {
      throw new Error('Insufficient balance');
    }
    
    this.balances.set(userKey, newBalance);
  }

  // For testing purposes
  resetBalance(user: PublicKey): void {
    this.balances.set(user.toBase58(), this.INITIAL_BALANCE);
  }
}
