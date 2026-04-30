
import sys
import time
import json
import logging
from coinbase_adapter import CoinbaseClient

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("ARCHANGEL_BRIDGE")

try:
    from ib_insync import IB, Stock, MarketOrder
    HAS_IB = True
except ImportError:
    HAS_IB = False

# Global State
STATE = {
    "mode": "PAPER",  # PAPER or LIVE
    "balance": 10000.0,
    "portfolio": {},
    "orders": []
}

COINBASE = None
IBKR = None

def connect_ibkr(host, port, client_id):
    global IBKR
    if not HAS_IB:
        logger.warning("ib_insync not installed. Defaulting to MOCK mode.")
        return {"status": "warning", "message": "ib_insync not installed", "mode": "MOCK"}
    
    max_retries = 3
    retry_delay = 2 # seconds
    
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Attempting to connect to IBKR Gateway (Attempt {attempt}/{max_retries}) at {host}:{port} with clientId={client_id}")
            IBKR = IB()
            IBKR.connect(host, port, clientId=client_id)
            logger.info(f"Successfully connected to IBKR Gateway at {host}:{port}")
            return {"status": "success", "message": f"Connected to IBKR at {host}:{port}", "mode": "LIVE"}
        except Exception as e:
            IBKR = None
            logger.warning(f"Connection attempt {attempt} failed: {e}")
            if attempt < max_retries:
                time.sleep(retry_delay)
            else:
                logger.error(f"All {max_retries} connection attempts failed. Defaulting to MOCK mode.")
                return {"status": "warning", "message": f"Failed after {max_retries} attempts: {str(e)}", "mode": "MOCK"}

def disconnect_ibkr():
    global IBKR
    if IBKR:
        try:
            IBKR.disconnect()
            logger.info("IBKR disconnected")
        except Exception as e:
            logger.error(f"Error during IBKR disconnect: {e}")
        IBKR = None
    return {"status": "success", "message": "IBKR disconnected"}

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

    if STATE["mode"] == "LIVE":
        if COINBASE:
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
        elif IBKR:
            try:
                # Simple IBKR Market Order (assuming Stock for now in this bridge)
                contract = Stock(symbol, 'SMART', 'USD')
                order = MarketOrder(side, quantity)
                trade = IBKR.placeOrder(contract, order)
                trade_record["exchange_response"] = {"orderId": trade.order.orderId, "status": "SUBMITTED"}
                print(f"LIVE IBKR TRADE SUBMITTED: {trade.order.orderId}")
            except Exception as e:
                trade_record["status"] = "FAILED"
                trade_record["error"] = str(e)
                print(f"LIVE IBKR TRADE FAILED: {e}")
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
    print("Commands: trade <sym> <side> <qty> <price>, list-orders, activate-coinbase <key> <secret>, connect-ibkr <host> <port> <id>, disconnect-ibkr, go-live, go-paper, add-funds <amt>, exit")
    
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
                
            elif cmd == "connect-ibkr":
                if len(parts) < 4:
                    print("Usage: connect-ibkr <host> <port> <client_id>")
                    continue
                host = parts[1]
                port = int(parts[2])
                client_id = int(parts[3])
                print(json.dumps(connect_ibkr(host, port, client_id)))

            elif cmd == "disconnect-ibkr":
                print(json.dumps(disconnect_ibkr()))
                
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
