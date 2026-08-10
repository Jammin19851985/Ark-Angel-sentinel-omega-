#!/usr/bin/env python3
# omni_ingress.py - Network-Failsafe Ingestion Boundary

import urllib.request
import json
import time

ENDPOINTS = {
    "primary": "http://127.0.0.1:8080/api/v1/traffic", # Mock primary node URL
    "secondary": "http://127.0.0.1:8081/api/v1/traffic_backup"
}
TIMEOUT_SECONDS = 0.150 # 150ms strict threshold

def fetch_telemetry_stream():
    start_time = time.time()
    
    # Try Primary
    try:
        req = urllib.request.Request(ENDPOINTS["primary"], method="GET")
        with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as response:
            delta_ms = int((time.time() - start_time) * 1000)
            data = json.loads(response.read().decode())
            data["latency_delta"] = delta_ms
            return data
    except Exception as e:
        # Transparent Failover to Secondary
        failover_start = time.time()
        print(f"\n[⚠️ ALERT] Primary edge timed out or failed. Swapping to backup endpoint...")
        try:
            req = urllib.request.Request(ENDPOINTS["secondary"], method="GET")
            with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as response:
                delta_ms = int((time.time() - failover_start) * 1000)
                data = json.loads(response.read().decode())
                data["latency_delta"] = delta_ms
                return data
        except Exception as fail_error:
            # Emergency fallback to a safe local state if internet connection drops completely
            print("[CRITICAL] All external network nodes unreachable! Injecting emergency fallback cache.")
            return {
                "latency_delta": 999,
                "volatility_index": 50,
                "sentiment": {"bullish": 0, "bearish": 0},
                "emergency_flag": True
            }

if __name__ == "__main__":
    # Rapid ingestion validation loop
    print("[*] Ingestion wrapper active. Querying boundary matrix...")
    print(fetch_telemetry_stream())
