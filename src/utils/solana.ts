import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getJupiterQuote, getJupiterSwap, getJupiterTokens } from './jupiter';
import { getSolanaTokenPrice, getSolanaTokenList } from './coingecko';

export const SOLANA_NETWORK = 'mainnet-beta';
export const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export async function getTokenList() {
  // Use Jupiter's token list instead
  const tokens = await getJupiterTokens();
  return tokens;
}

export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string
): Promise<number> {
  try {
    const tokenPublicKey = new PublicKey(tokenAddress);
    const walletPublicKey = new PublicKey(walletAddress);
    const balance = await connection.getTokenAccountBalance(
      await connection.getTokenAccountsByOwner(walletPublicKey, {
        mint: tokenPublicKey,
      }).then((accounts) => accounts.value[0].pubkey)
    );
    return parseFloat(balance.value.uiAmount?.toString() || '0');
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

export async function getSOLBalance(walletAddress: string): Promise<number> {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(walletPublicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return 0;
  }
}

export interface SwapQuote {
  inputAmount: number;
  outputAmount: number;
  price: number;
  priceImpact: number;
  fee: number;
  minimumReceived: number;
}

export async function getSwapQuote(
  inputToken: TokenInfo,
  outputToken: TokenInfo,
  inputAmount: number
): Promise<SwapQuote> {
  // This is a placeholder. In a real implementation, you would:
  // 1. Fetch real prices from Serum/Raydium
  // 2. Calculate actual fees and price impact
  // 3. Get minimum received amount based on slippage
  return {
    inputAmount,
    outputAmount: inputAmount * 1.5, // Placeholder exchange rate
    price: 1.5,
    priceImpact: 0.1,
    fee: 0.003 * inputAmount,
    minimumReceived: inputAmount * 1.5 * 0.995, // 0.5% slippage
  };
}

export async function getTokenPriceAndData(tokenId: string) {
  try {
    const [priceData, tokenList] = await Promise.all([
      getSolanaTokenPrice(tokenId),
      getSolanaTokenList()
    ]);
    
    const tokenData = tokenList.find(token => token.id === tokenId);
    return {
      ...priceData,
      ...tokenData
    };
  } catch (error) {
    console.error('Error fetching token data:', error);
    throw error;
  }
}

export async function calculateSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps?: number
) {
  try {
    const quote = await getJupiterQuote(inputMint, outputMint, amount, slippageBps);
    return quote;
  } catch (error) {
    console.error('Error calculating swap quote:', error);
    throw error;
  }
}

export async function executeSwap(
  route: any,
  wallet: any
) {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const swapResult = await getJupiterSwap(route, wallet.publicKey.toString());
    const { swapTransaction } = swapResult;

    // Create and sign transaction
    const transaction = Transaction.from(Buffer.from(swapTransaction, 'base64'));
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Get connection from your wallet adapter or context
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
    
    // Send and confirm transaction
    const txid = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(txid);
    
    return txid;
  } catch (error) {
    console.error('Error executing swap:', error);
    throw error;
  }
}
