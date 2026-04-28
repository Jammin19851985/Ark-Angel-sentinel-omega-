import os
import json

class CoinbaseBridge:
    """
    Bridge to Coinbase Advanced Trade API.
    Available in Canada. No Binance.
    """
    def __init__(self):
        self.api_key = os.getenv("COINBASE_API_KEY")
        self.api_secret = os.getenv("COINBASE_API_SECRET")

    def get_ticker(self, pair):
        print(f"Coinbase: Fetching ticker for {pair}")
        return {"pair": pair, "price": 0.0, "source": "Coinbase"}

    def place_order(self, action, pair, amount):
        print(f"Coinbase: Executing {action} on {pair} for {amount}")
        return {"status": "success", "broker": "Coinbase"}
