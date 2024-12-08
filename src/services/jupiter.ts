import { API_CONFIG, JUPITER_ENDPOINTS } from '../config/api';

class JupiterService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.JUPITER_API_URL;
  }

  async getQuote(inputMint: string, outputMint: string, amount: number) {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: '50',
      });
      const response = await fetch(`${this.baseUrl}${JUPITER_ENDPOINTS.quote}?${params}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting Jupiter quote:', error);
      throw error;
    }
  }

  async getPrice(inputMint: string, outputMint: string) {
    try {
      const response = await fetch(`${this.baseUrl}${JUPITER_ENDPOINTS.price}?inputMint=${inputMint}&outputMint=${outputMint}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting Jupiter price:', error);
      throw error;
    }
  }

  async executeSwap(quoteResponse: any, userPublicKey: string) {
    try {
      const response = await fetch(`${this.baseUrl}${JUPITER_ENDPOINTS.swap}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey,
          wrapUnwrapSOL: true,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error executing Jupiter swap:', error);
      throw error;
    }
  }
}

export const jupiterService = new JupiterService();
