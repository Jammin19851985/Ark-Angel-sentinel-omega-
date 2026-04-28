import os
import time
import json

def read_json(filepath):
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except:
        return {}

def clear():
    os.system("cls" if os.name == "nt" else "clear")

while True:
    sico = read_json("sico_state.json")
    bridge = read_json("bridge_state.json")
    overwatch = read_json("overwatch_state.json")
    
    clear()
    print("============================================================")
    print("                 ARCHANGEL TACTICAL HUD                 ")
    print("============================================================")
    
    imb = sico.get("imbalance", 0.00)
    sig = sico.get("last_signal", "WAITING")
    sico_time = sico.get("timestamp", "--:--:--")
    
    print(f"| NODE 2: SICO ENGINE |                   TIME: {sico_time}")
    print(f"   Bid/Ask Imbalance :  {imb:.2f}")
    print(f"   Active Signal     :  {sig}")
    print("------------------------------------------------------------")
    
    ow_status = overwatch.get("status", "INITIALIZING")
    ow_longs = overwatch.get("consecutive_longs", 0)
    
    print(f"| NODE 3: OVERWATCH AGENT |")
    print(f"   System Status     :  {ow_status}")
    print(f"   Consecutive Longs :  {ow_longs}")
    print("------------------------------------------------------------")
    
    wallet = bridge.get("wallet", 10000.00)
    pos = bridge.get("positions", 0)
    pnl = bridge.get("pnl", 0.00)
    trades = bridge.get("total_trades", 0)
    action = bridge.get("last_action", "NONE")
    price = bridge.get("asset_price", 0.00)
    br_time = bridge.get("timestamp", "--:--:--")
    
    print(f"| NODE 4: KRAKEN BRIDGE PAPER |           TIME: {br_time}")
    print(f"   Simulated Price   :  ${price:.2f}")
    print(f"   Last Action       :  {action}")
    print(f"   Active Positions  :  {pos}")
    print(f"   Total Trades      :  {trades}")
    print(f"   Available Margin  :  ${wallet:.2f}")
    
    pnl_str = f"+${pnl:.2f}" if pnl >= 0 else f"-${abs(pnl):.2f}"
    print(f"   Unrealized PnL    :  {pnl_str}")
    print("============================================================")
    
    print(" Polling local telemetry streams... Press Ctrl+C to exit.")
    time.sleep(1)
