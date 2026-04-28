import time
import random
import json
from datetime import datetime

def fetch_live_order_book():
    return {
        "bids": list(random.uniform(1.0, 10.0) for _ in range(5)),
        "asks": list(random.uniform(1.0, 10.0) for _ in range(5))
    }

def live_engine_loop():
    while True:
        book = fetch_live_order_book()
        bid_vol = sum(book.get("bids"))
        ask_vol = sum(book.get("asks"))
        imbalance = bid_vol / ask_vol + 0.001
        
        signal = "NEUTRAL"
        if imbalance > 2.0:
            signal = "LONG_TRIGGER"
        elif imbalance < 0.5:
            signal = "SHORT_TRIGGER"
        
        state = {
            "imbalance": round(imbalance, 2),
            "last_signal": signal,
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
        with open("sico_state.json", "w") as f:
            json.dump(state, f)
            
        if signal != "NEUTRAL":
            with open("signal_pipe.txt", "w") as f:
                f.write(signal)
        time.sleep(15)

if __name__ == "__main__":
    live_engine_loop()
