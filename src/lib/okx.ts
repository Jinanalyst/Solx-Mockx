import axios from 'axios';
import CryptoJS from 'crypto-js';
import { OKX_CONFIG } from '../config/okx';

class OKXClient {
  private apiKey: string;
  private secretKey: string;
  private passphrase: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = OKX_CONFIG.API_KEY;
    this.secretKey = OKX_CONFIG.SECRET_KEY;
    this.passphrase = OKX_CONFIG.PASSPHRASE;
    this.baseUrl = OKX_CONFIG.BASE_URL;
  }

  private getSignature(timestamp: string, method: string, requestPath: string, body: string = '') {
    const message = timestamp + method + requestPath + body;
    return CryptoJS.HmacSHA256(message, this.secretKey).toString(CryptoJS.enc.Base64);
  }

  private async request(method: string, endpoint: string, data: any = null) {
    const timestamp = new Date().toISOString();
    const requestPath = '/api/v5' + endpoint;
    const body = data ? JSON.stringify(data) : '';
    const signature = this.getSignature(timestamp, method, requestPath, body);

    const headers = {
      'OK-ACCESS-KEY': this.apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.passphrase,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios({
        method,
        url: this.baseUrl + requestPath,
        headers,
        data: body || undefined
      });
      return response.data;
    } catch (error) {
      console.error('OKX API Error:', error);
      throw error;
    }
  }

  // Account endpoints
  async getAccountBalance() {
    return this.request('GET', '/account/balance');
  }

  async getPositions(instType: string = 'SWAP') {
    return this.request('GET', '/account/positions', { instType });
  }

  // Trading endpoints
  async placeOrder(params: {
    instId: string;
    tdMode: 'cash' | 'cross' | 'isolated';
    side: 'buy' | 'sell';
    ordType: 'market' | 'limit' | 'post_only' | 'fok' | 'ioc';
    sz: string;
    px?: string;
    posSide?: 'long' | 'short' | 'net';
    reduceOnly?: boolean;
    tpTriggerPx?: string;
    tpOrdPx?: string;
    slTriggerPx?: string;
    slOrdPx?: string;
  }) {
    return this.request('POST', '/trade/order', params);
  }

  async cancelOrder(instId: string, ordId: string) {
    return this.request('POST', '/trade/cancel-order', { instId, ordId });
  }

  async getOrderHistory(instType: string = 'SWAP') {
    return this.request('GET', '/trade/orders-history-archive', { instType });
  }

  // Market Data endpoints
  async getTicker(instId: string) {
    return this.request('GET', '/market/ticker', { instId });
  }

  async getOrderbook(instId: string, sz?: number) {
    return this.request('GET', '/market/books', { instId, sz });
  }

  async getKlineData(instId: string, bar: string = '1m', limit: number = 100) {
    return this.request('GET', '/market/candles', { instId, bar, limit });
  }

  // Public endpoints
  async getInstruments(instType: string = 'SWAP') {
    return this.request('GET', '/public/instruments', { instType });
  }

  async getFundingRate(instId: string) {
    return this.request('GET', '/public/funding-rate', { instId });
  }

  // Advanced Trading endpoints
  async placeBatchOrders(orders: Array<{
    instId: string;
    tdMode: 'cash' | 'cross' | 'isolated';
    side: 'buy' | 'sell';
    ordType: 'market' | 'limit' | 'post_only' | 'fok' | 'ioc';
    sz: string;
    px?: string;
  }>) {
    return this.request('POST', '/trade/batch-orders', { orders });
  }

  async cancelBatchOrders(orders: Array<{
    instId: string;
    ordId?: string;
    clOrdId?: string;
  }>) {
    return this.request('POST', '/trade/cancel-batch-orders', { orders });
  }

  async modifyOrder(params: {
    instId: string;
    ordId?: string;
    clOrdId?: string;
    reqId?: string;
    newSz?: string;
    newPx?: string;
  }) {
    return this.request('POST', '/trade/amend-order', params);
  }

  async closePosition(params: {
    instId: string;
    posSide?: 'long' | 'short' | 'net';
    mgnMode: 'cross' | 'isolated';
    ccy?: string;
    autoCxl?: boolean;
  }) {
    return this.request('POST', '/trade/close-position', params);
  }

  // Algo Trading endpoints
  async placeAlgoOrder(params: {
    instId: string;
    tdMode: 'cross' | 'isolated';
    side: 'buy' | 'sell';
    ordType: 'conditional' | 'oco' | 'trigger' | 'move_order_stop' | 'iceberg' | 'twap';
    sz: string;
    posSide?: 'long' | 'short' | 'net';
    tpTriggerPx?: string;
    tpOrdPx?: string;
    slTriggerPx?: string;
    slOrdPx?: string;
    triggerPx?: string;
    orderPx?: string;
    pxVar?: string;
    pxSpread?: string;
    szLimit?: string;
    pxLimit?: string;
  }) {
    return this.request('POST', '/trade/order-algo', params);
  }

  async cancelAlgoOrder(params: {
    instId: string;
    algoId: string;
  }) {
    return this.request('POST', '/trade/cancel-algos', { params });
  }

  // Grid Trading endpoints
  async placeGridOrder(params: {
    instId: string;
    algoOrdType: 'grid' | 'contract_grid';
    maxPx: string;
    minPx: string;
    gridNum: string;
    runType: '1' | '2';
    sz?: string;
    direction?: 'long' | 'short';
    lever?: string;
  }) {
    return this.request('POST', '/trade/grid-order-algo', params);
  }

  // Stop Order endpoints
  async placeStopOrder(params: {
    instId: string;
    tdMode: 'cash' | 'cross' | 'isolated';
    side: 'buy' | 'sell';
    ordType: 'limit' | 'market';
    sz: string;
    triggerPx: string;
    orderPx?: string;
    tpTriggerPx?: string;
    tpOrdPx?: string;
    slTriggerPx?: string;
    slOrdPx?: string;
  }) {
    return this.request('POST', '/trade/order-algo', {
      ...params,
      ordType: 'trigger',
    });
  }

  // Leverage and Margin endpoints
  async setLeverage(params: {
    instId: string;
    lever: string;
    mgnMode: 'cross' | 'isolated';
    posSide?: 'long' | 'short';
  }) {
    return this.request('POST', '/account/set-leverage', params);
  }

  async getMaxBuySellAmount(params: {
    instId: string;
    tdMode: 'cash' | 'cross' | 'isolated';
    ccy?: string;
    px?: string;
    leverage?: string;
  }) {
    return this.request('GET', '/account/max-size', params);
  }

  // Position endpoints
  async getPositionRisk() {
    return this.request('GET', '/account/account-position-risk');
  }

  async getMaxAvailableTradeAmount(params: {
    instId: string;
    tdMode: 'cash' | 'cross' | 'isolated';
    ccy?: string;
    px?: string;
    leverage?: string;
    unSpotOffset?: boolean;
  }) {
    return this.request('GET', '/account/max-avail-size', params);
  }
}

// Create a singleton instance
const okxClient = new OKXClient();
export default okxClient;
