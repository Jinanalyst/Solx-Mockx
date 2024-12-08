import axios from 'axios';
import CryptoJS from 'crypto-js';
import { OKX_CONFIG } from '@/config/okx';

interface SignedRequest {
  timestamp: string;
  sign: string;
}

export const getSignature = (timestamp: string, method: string, requestPath: string, body?: string): string => {
  if (!OKX_CONFIG.SECRET_KEY) {
    throw new Error('OKX Secret Key is not configured');
  }
  const message = `${timestamp}${method}${requestPath}${body || ''}`;
  return CryptoJS.HmacSHA256(message, OKX_CONFIG.SECRET_KEY).toString(CryptoJS.enc.Base64);
};

export const createSignedRequest = (method: string, path: string, body?: any): SignedRequest => {
  const timestamp = new Date().toISOString();
  const sign = getSignature(timestamp, method.toUpperCase(), path, JSON.stringify(body));
  
  return {
    timestamp,
    sign,
  };
};

// Create axios instance with default config
const instance = axios.create({
  baseURL: OKX_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to sign all requests
instance.interceptors.request.use((config) => {
  if (!OKX_CONFIG.API_KEY || !OKX_CONFIG.PASSPHRASE) {
    throw new Error('OKX API Key or Passphrase is not configured');
  }

  const { timestamp, sign } = createSignedRequest(
    config.method || 'get',
    config.url || '',
    config.data
  );
  
  config.headers['OK-ACCESS-KEY'] = OKX_CONFIG.API_KEY;
  config.headers['OK-ACCESS-PASSPHRASE'] = OKX_CONFIG.PASSPHRASE;
  config.headers['OK-ACCESS-TIMESTAMP'] = timestamp;
  config.headers['OK-ACCESS-SIGN'] = sign;
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for better error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('OKX API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('OKX API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('OKX API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const okxApi = instance;
