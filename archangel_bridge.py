
import sys
import time
import json
from coinbase_adapter import CoinbaseClient

# Global State
STATE = {
    "mode": "PAPER",  # PAPER or LIVE
    "balance": 10000.0,
    "portfolio": {},
    "orders": []
}

COINBASE = None

def activate_coinbase(api_key, api_secret):
    global COINBASE
    try:
        COINBASE = CoinbaseClient(api_key, api_secret)
        return {"status": "Coinbase LIVE adapter activated", "mode": STATE["mode"]}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def execute_trade(symbol, side, quantity, price=0):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    trade_record = {
        "id": f"trade-{int(time.time())}",
        "timestamp": timestamp,
        "symbol": symbol,
        "side": side,
        "quantity": quantity,
        "price": price,
        "status": "FILLED",
        "mode": STATE["mode"]
    }

    if STATE["mode"] == "LIVE" and COINBASE:
        try:
            # Coinbase Advanced Trade uses product_id like BTC-USD
            product = f"{symbol}-USD"
            result = COINBASE.place_order(
                product_id=product,
                side=side,
                size=quantity
            )
            trade_record["exchange_response"] = result
            
            # Check for immediate errors in response structure
            if 'error' in result:
                 trade_record["status"] = "REJECTED"
                 print(f"LIVE TRADE REJECTED: {result}")
            else:
                 print(f"LIVE TRADE EXECUTED: {json.dumps(result)}")
                 
        except Exception as e:
            trade_record["status"] = "FAILED"
            trade_record["error"] = str(e)
            print(f"LIVE TRADE FAILED: {e}")
            return trade_record

    # Update Ledger/Portfolio (Simulated for Paper, tracked for Live)
    STATE["orders"].append(trade_record)
    return trade_record

def list_open_orders():
    if STATE["mode"] == "LIVE" and COINBASE:
        try:
            response = COINBASE.get_open_orders()
            if 'orders' in response:
                return response['orders']
            else:
                return {"error": "Failed to fetch orders", "raw": response}
        except Exception as e:
            return {"error": str(e)}
    else:
        # In Paper Mode, filter local orders (assuming we tracked open ones, currently we only track fills)
        # For simulation consistency, we return empty list or mock
        return []

def main_loop():
    print("ARCHANGEL BRIDGE v2.1 - GABRIEL CLI")
    print("Commands: trade <sym> <side> <qty> <price>, list-orders, activate-coinbase <key> <secret>, go-live, go-paper, add-funds <amt>, exit")
    
    while True:
        try:
            if sys.stdin.isatty():
                raw = input(">>> ").strip()
            else:
                raw = sys.stdin.readline().strip()
                if not raw: break

            if not raw: continue
            
            parts = raw.split()
            cmd = parts[0].lower()
            
            if cmd == "exit":
                break
                
            elif cmd == "activate-coinbase":
                if len(parts) < 3:
                    print("Usage: activate-coinbase <api_key> <api_secret>")
                    continue
                key, secret = parts[1], parts[2]
                print(json.dumps(activate_coinbase(key, secret)))
                
            elif cmd == "go-live":
                STATE["mode"] = "LIVE"
                print("MODE SET TO LIVE. REAL CAPITAL AT RISK.")
                
            elif cmd == "go-paper":
                STATE["mode"] = "PAPER"
                print("MODE SET TO PAPER.")
                
            elif cmd == "add-funds":
                if len(parts) < 2: continue
                amount = float(parts[1])
                STATE["balance"] += amount
                print(f"Balance updated: {STATE['balance']}")
            
            elif cmd == "list-orders":
                orders = list_open_orders()
                print(json.dumps(orders, indent=2))

            elif cmd == "trade":
                # trade BTC BUY 0.01 0
                if len(parts) < 4:
                    print("Usage: trade <symbol> <side> <qty> <price>")
                    continue
                symbol = parts[1].upper()
                side = parts[2].upper()
                qty = float(parts[3])
                price = float(parts[4]) if len(parts) > 4 else 0.0
                
                result = execute_trade(symbol, side, qty, price)
                print(json.dumps(result, indent=2))
                
            else:
                print(f"Unknown command: {cmd}")
                
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main_loop()
