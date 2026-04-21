
import time
import hmac
import hashlib
import base64
import json
import requests

COINBASE_API_URL = "https://api.coinbase.com"

class CoinbaseClient:
    def __init__(self, api_key, api_secret):
        self.api_key = api_key
        self.api_secret = api_secret

    def _sign(self, method, path, body=""):
        timestamp = str(int(time.time()))
        message = timestamp + method + path + body
        
        # Determine if secret is base64 (Legacy/Pro) or raw string (Cloud/Advanced)
        try:
            key_bytes = base64.b64decode(self.api_secret)
        except:
            key_bytes = self.api_secret.encode('utf-8')

        signature = hmac.new(
            key_bytes,
            message.encode('utf-8'),
            hashlib.sha256
        )
        return timestamp, base64.b64encode(signature.digest()).decode()

    def _headers(self, timestamp, signature):
        return {
            "CB-ACCESS-KEY": self.api_key,
            "CB-ACCESS-SIGN": signature,
            "CB-ACCESS-TIMESTAMP": timestamp,
            "Content-Type": "application/json"
        }

    def place_order(self, product_id, side, size):
        path = "/api/v3/brokerage/orders"
        body = json.dumps({
            "product_id": product_id,
            "side": side.lower(),
            "order_configuration": {
                "market_market_ioc": {
                    "base_size": str(size)
                }
            }
        })

        ts, sig = self._sign("POST", path, body)
        r = requests.post(
            COINBASE_API_URL + path,
            headers=self._headers(ts, sig),
            data=body
        )
        return r.json()

    def get_open_orders(self):
        # Advanced Trade API endpoint for listing orders
        # We filter for OPEN orders. Note: Query params must be in the path for signing.
        path = "/api/v3/brokerage/orders/historical/batch?order_status=OPEN"
        
        ts, sig = self._sign("GET", path, "")
        r = requests.get(
            COINBASE_API_URL + path,
            headers=self._headers(ts, sig)
        )
        return r.json()
