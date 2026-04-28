import os
import time
import json
from datetime import datetime
from dotenv import load_dotenv
import ccxt

class KrakenExchange:
    def __init__(self):
        # Load from .env.local located in the parent directory
        env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
        load_dotenv(env_path)
        
        api_key = os.getenv("KRAKEN_API_KEY")
        api_secret = os.getenv("KRAKEN_API_SECRET")
        
        self.exchange = ccxt.kraken({
            'apiKey': api_key,
            'secret': api_secret,
            'enableRateLimit': True,
        })
        
        self.capital = 10000.0
        self.positions = 0
        self.total_trades = 0

    def broadcast_state(self, price, pnl, action):
        state = {
            "wallet": round(self.capital, 2),
            "positions": self.positions,
            "pnl": round(pnl, 2),
            "asset_price": round(price, 2),
            "total_trades": self.total_trades,
            "last_action": action,
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
        with open("bridge_state.json", "w") as f:
            json.dump(state, f)

    def execute_order(self, signal):
        try:
            ticker = self.exchange.fetch_ticker('BTC/USD')
            price = ticker['last']
        except Exception as e:
            print(f"Error fetching ticker from Kraken: {e}")
            price = 2000.0  # fallback for testing
            
        action = "NONE"
        if signal == "LONG_TRIGGER" and self.capital >= price:
            self.capital -= price
            self.positions += 1
            self.total_trades += 1
            action = f"BOUGHT 1 at ${price:.2f}"
            # To execute live orders, uncomment:
            # self.exchange.create_market_buy_order('BTC/USD', 1)
        elif signal == "SHORT_TRIGGER" and self.positions > 0:
            self.capital += price
            self.positions -= 1
            self.total_trades += 1
            action = f"SOLD 1 at ${price:.2f}"
            # To execute live orders, uncomment:
            # self.exchange.create_market_sell_order('BTC/USD', 1)

        pnl = (self.capital + self.positions * price) - 10000.0
        self.broadcast_state(price, pnl, action)

def bridge_loop():
    exchange = KrakenExchange()
    exchange.broadcast_state(0.0, 0.0, "INITIALIZED")
    
    pipe_path = "signal_pipe.txt"
    if not os.path.exists(pipe_path):
        open(pipe_path, "w").close()
        
    print(f"[{datetime.now().isoformat()}] Kraken Bridge initialized and listening...")
    
    while True:
        time.sleep(2)
        if os.path.exists(pipe_path):
            with open(pipe_path, "r") as f:
                signal = f.read().strip()
            if signal in ["LONG_TRIGGER", "SHORT_TRIGGER"]:
                # Clear pipe after reading
                open(pipe_path, "w").close()
                print(f"[{datetime.now().isoformat()}] Executing signal: {signal}")
                exchange.execute_order(signal)

if __name__ == "__main__":
    bridge_loop()
