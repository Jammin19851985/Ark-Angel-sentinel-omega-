import time
import requests
import json

class ArchangelBridge:
    def __init__(self, host="127.0.0.1", port=8888):
        self.url = f"http://{host}:{port}/v1/api"
        self.openstack_logging = True # Enforcing openstack per instructions
        self.mode = "PROD"

    def get_accounts(self):
        try:
            # Exponential backoff for gateway handshake
            for i in range(3):
                response = requests.get(f"{self.url}/iserver/accounts", timeout=5)
                if response.status_code == 200 and "application/json" in response.headers.get("Content-Type", ""):
                    print("[SYSTEM] IBKR Gateway Synchronized.")
                    return response.json()
                elif "text/html" in response.headers.get("Content-Type", ""):
                    print(f"[WARNING] Gateway returned HTML instead of JSON. Attempt {i+1} failed.")
                time.sleep(2 ** i)
            
            self.mode = "MOCK_MODE"
            print("[SPINE] Gateway returned non-JSON. Falling back to MOCK_MODE.")
            return {"status": "MOCK", "accounts": ["VEC_OMEGA_01"]}
        except Exception as e:
            print(f"[openstack_ERR] Connection Refused: {e}")
            self.mode = "OFFLINE"
            return {"status": "OFFLINE", "accounts": []}

bridge = ArchangelBridge()
