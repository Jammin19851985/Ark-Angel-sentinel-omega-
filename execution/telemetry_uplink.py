import time
import json
import urllib.request
import urllib.error

# REPLACE THIS WITH YOUR DASHBOARD'S ACTUAL API ENDPOINT
DASHBOARD_URL = "https://ais-pre-cxp7yor4syde64ti66c5qb-25005896591.us-east1.run.app/api/update"

def read_json(filepath):
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except:
        return {}

def transmit_telemetry():
    print(f">> [UPLINK] Initiating cloud telemetry broadcast to {DASHBOARD_URL}...")
    
    while True:
        time.sleep(2) # Broadcast frequency
        
        # Gather local state
        payload = {
            "sico": read_json("sico_state.json"),
            "bridge": read_json("bridge_state.json"),
            "overwatch": read_json("overwatch_state.json")
        }
        
        # Skip if empty
        if not payload["sico"] and not payload["bridge"]:
            continue
            
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(DASHBOARD_URL, data=data, headers={"Content-Type": "application/json"}, method="POST")
        
        try:
            with urllib.request.urlopen(req) as response:
                if response.status in [200, 201]:
                    print(f">> [UPLINK] Packet transmitted successfully.")
        except urllib.error.URLError as e:
            print(f">> [UPLINK] Transmission failed: {e.reason}")
            
if __name__ == "__main__":
    transmit_telemetry()
