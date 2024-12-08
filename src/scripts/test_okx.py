import requests
import hmac
import base64
import time
import json
from datetime import datetime
from typing import Literal

# OKX API credentials
api_key = 'd8d23c02-0bbc-49dc-874c-462349219e9d'
secret_key = '771D8497A6F5D83F4CD8E01FC094A968'
passphrase = 'Fifaonline4!'

# API endpoints
base_url = 'https://www.okx.com'

def get_timestamp():
    now = datetime.utcnow()
    return now.isoformat("T", "milliseconds") + "Z"

def sign(timestamp, method, request_path, body=''):
    if str(body) == '{}' or str(body) == 'None':
        body = ''
    message = timestamp + method + request_path + str(body)
    mac = hmac.new(
        bytes(secret_key, encoding='utf8'),
        bytes(message, encoding='utf-8'),
        digestmod='sha256'
    )
    d = mac.digest()
    return base64.b64encode(d).decode()

def get_header(timestamp, sign, method, request_path, body=''):
    header = {
        'OK-ACCESS-KEY': api_key,
        'OK-ACCESS-SIGN': sign,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': passphrase,
        'Content-Type': 'application/json'
    }
    return header

class OKXTrading:
    @staticmethod
    def place_market_order(
        instId: str,
        side: Literal['buy', 'sell'],
        size: str,
        tdMode: Literal['cash', 'cross', 'isolated'] = 'cash'
    ):
        """
        Place a market order
        :param instId: Instrument ID, e.g., 'BTC-USDT'
        :param side: 'buy' or 'sell'
        :param size: Order size in base currency
        :param tdMode: Trading mode: 'cash', 'cross', or 'isolated'
        """
        timestamp = get_timestamp()
        request_path = '/api/v5/trade/order'
        
        body = {
            'instId': instId,
            'tdMode': tdMode,
            'side': side,
            'ordType': 'market',
            'sz': size
        }
        
        body_str = json.dumps(body)
        sign_str = sign(timestamp, 'POST', request_path, body_str)
        header = get_header(timestamp, sign_str, 'POST', request_path, body_str)
        
        response = requests.post(base_url + request_path, headers=header, data=body_str)
        return response.json()

    @staticmethod
    def place_limit_order(
        instId: str,
        side: Literal['buy', 'sell'],
        size: str,
        price: str,
        tdMode: Literal['cash', 'cross', 'isolated'] = 'cash',
        postOnly: bool = False
    ):
        """
        Place a limit order
        :param instId: Instrument ID, e.g., 'BTC-USDT'
        :param side: 'buy' or 'sell'
        :param size: Order size in base currency
        :param price: Order price
        :param tdMode: Trading mode: 'cash', 'cross', or 'isolated'
        :param postOnly: If True, order will be post-only
        """
        timestamp = get_timestamp()
        request_path = '/api/v5/trade/order'
        
        body = {
            'instId': instId,
            'tdMode': tdMode,
            'side': side,
            'ordType': 'post_only' if postOnly else 'limit',
            'sz': size,
            'px': price
        }
        
        body_str = json.dumps(body)
        sign_str = sign(timestamp, 'POST', request_path, body_str)
        header = get_header(timestamp, sign_str, 'POST', request_path, body_str)
        
        response = requests.post(base_url + request_path, headers=header, data=body_str)
        return response.json()

    @staticmethod
    def place_stop_order(
        instId: str,
        side: Literal['buy', 'sell'],
        size: str,
        stopPrice: str,
        price: str = None,
        tdMode: Literal['cash', 'cross', 'isolated'] = 'cash'
    ):
        """
        Place a stop order
        :param instId: Instrument ID, e.g., 'BTC-USDT'
        :param side: 'buy' or 'sell'
        :param size: Order size in base currency
        :param stopPrice: Trigger price
        :param price: Limit price (if None, will be market order)
        :param tdMode: Trading mode: 'cash', 'cross', or 'isolated'
        """
        timestamp = get_timestamp()
        request_path = '/api/v5/trade/order'
        
        body = {
            'instId': instId,
            'tdMode': tdMode,
            'side': side,
            'ordType': 'conditional',
            'sz': size,
            'tpTriggerPx': stopPrice,
            'tpOrdPx': price if price else '-1'  # -1 means market price
        }
        
        body_str = json.dumps(body)
        sign_str = sign(timestamp, 'POST', request_path, body_str)
        header = get_header(timestamp, sign_str, 'POST', request_path, body_str)
        
        response = requests.post(base_url + request_path, headers=header, data=body_str)
        return response.json()

    @staticmethod
    def cancel_order(instId: str, ordId: str):
        """
        Cancel an existing order
        :param instId: Instrument ID, e.g., 'BTC-USDT'
        :param ordId: Order ID to cancel
        """
        timestamp = get_timestamp()
        request_path = '/api/v5/trade/cancel-order'
        
        body = {
            'instId': instId,
            'ordId': ordId
        }
        
        body_str = json.dumps(body)
        sign_str = sign(timestamp, 'POST', request_path, body_str)
        header = get_header(timestamp, sign_str, 'POST', request_path, body_str)
        
        response = requests.post(base_url + request_path, headers=header, data=body_str)
        return response.json()

    @staticmethod
    def get_order_history(instType: str = 'SPOT', limit: int = 100):
        """
        Get order history
        :param instType: Instrument type (SPOT, MARGIN, SWAP, etc.)
        :param limit: Number of records to return
        """
        timestamp = get_timestamp()
        request_path = f'/api/v5/trade/orders-history-archive?instType={instType}&limit={limit}'
        
        sign_str = sign(timestamp, 'GET', request_path)
        header = get_header(timestamp, sign_str, 'GET', request_path)
        
        response = requests.get(base_url + request_path, headers=header)
        return response.json()

def test_connection():
    print("Testing OKX API Connection...")
    
    # Test getting account balance
    timestamp = get_timestamp()
    request_path = '/api/v5/account/balance'
    body = ''
    sign_str = sign(timestamp, 'GET', request_path, body)
    header = get_header(timestamp, sign_str, 'GET', request_path, body)
    
    try:
        response = requests.get(base_url + request_path, headers=header)
        print("\nAccount Balance Response:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code != 200:
            print(f"HTTP Status Code: {response.status_code}")
            print("Response Headers:", dict(response.headers))
    except Exception as e:
        print(f"Error getting account balance: {e}")

    # Test getting positions
    try:
        timestamp = get_timestamp()
        request_path = '/api/v5/account/positions'
        sign_str = sign(timestamp, 'GET', request_path)
        header = get_header(timestamp, sign_str, 'GET', request_path)
        
        response = requests.get(base_url + request_path, headers=header)
        print("\nPositions Response:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error getting positions: {e}")

    # Test getting available trading pairs
    try:
        request_path = '/api/v5/public/instruments?instType=SPOT'
        response = requests.get(base_url + request_path)
        print("\nAvailable Trading Pairs Response:")
        data = response.json()
        if data.get('data'):
            # Only print first 5 instruments to keep output manageable
            print(json.dumps(data['data'][:5], indent=2))
            print(f"Total number of trading pairs: {len(data['data'])}")
        else:
            print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"Error getting trading pairs: {e}")

    # Test getting BTC-USDT orderbook
    try:
        request_path = '/api/v5/market/books?instId=BTC-USDT'
        response = requests.get(base_url + request_path)
        print("\nOrderbook Response:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error getting orderbook: {e}")

def test_trading_functions():
    print("Testing OKX Trading Functions...")
    trading = OKXTrading()

    # Test placing a small limit order for BTC-USDT
    print("\nTesting Limit Order:")
    limit_response = trading.place_limit_order(
        instId='BTC-USDT',
        side='buy',
        size='0.0001',  # Very small size for testing
        price='40000',  # Well below market price
        postOnly=True
    )
    print(json.dumps(limit_response, indent=2))

    if limit_response.get('data') and limit_response['data'][0].get('ordId'):
        ordId = limit_response['data'][0]['ordId']
        
        # Test canceling the order
        print("\nTesting Cancel Order:")
        cancel_response = trading.cancel_order('BTC-USDT', ordId)
        print(json.dumps(cancel_response, indent=2))

    # Get order history
    print("\nTesting Order History:")
    history_response = trading.get_order_history()
    print(json.dumps(history_response, indent=2))

if __name__ == "__main__":
    test_connection()
    test_trading_functions()
