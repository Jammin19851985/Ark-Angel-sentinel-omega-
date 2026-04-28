import time
import json
from datetime import datetime

def read_json(filepath):
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except:
        return {}

def monitor_sico():
    consecutive_longs = 0
    last_timestamp = ""
    
    while True:
        time.sleep(2)
        sico = read_json("sico_state.json")
        current_time = sico.get("timestamp", "")
        
        if current_time != last_timestamp and current_time != "":
            last_timestamp = current_time
            signal = sico.get("last_signal", "NEUTRAL")
            
            if signal == "LONG_TRIGGER":
                consecutive_longs += 1
            else:
                consecutive_longs = 0
                
            status = "STABLE"
            if consecutive_longs >= 2:
                status = "MACRO VOLATILITY ALERT - DEFENSIVE GRID LOCKED"
                consecutive_longs = 0
                
            state = {
                "status": status,
                "consecutive_longs": consecutive_longs,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
            with open("overwatch_state.json", "w") as f:
                json.dump(state, f)

if __name__ == "__main__":
    monitor_sico()
