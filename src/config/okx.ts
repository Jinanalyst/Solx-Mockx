export const OKX_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_OKX_API_KEY || '',
  SECRET_KEY: process.env.OKX_SECRET_KEY || '',
  PASSPHRASE: process.env.OKX_PASSPHRASE || '',
  BASE_URL: 'https://www.okx.com/api/v5',
  WS_URL: 'wss://ws.okx.com:8443/ws/v5',
  IS_DEMO: process.env.NEXT_PUBLIC_OKX_DEMO === 'true',
}

// Validate configuration
if (!OKX_CONFIG.API_KEY) {
  console.error('Missing OKX API Key');
}

if (!OKX_CONFIG.SECRET_KEY) {
  console.error('Missing OKX Secret Key');
}

if (!OKX_CONFIG.PASSPHRASE) {
  console.error('Missing OKX Passphrase');
}

// If demo mode is enabled, use demo endpoints
if (OKX_CONFIG.IS_DEMO) {
  OKX_CONFIG.BASE_URL = 'https://www.okx.com/api/v5/demo';
  OKX_CONFIG.WS_URL = 'wss://ws.okx.com:8443/ws/v5/demo';
}
