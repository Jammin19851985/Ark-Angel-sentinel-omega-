#!/usr/bin/env bash
# omni_monitor.sh - Archangel OmniCore Supervisor Daemon

INTERVAL=2          # Poll every 2 seconds
MAX_MEMORY_KB=512000 # 500MB cap for the engine process
LATENCY_THRESHOLD=150 # Max acceptable millisecond offset

echo "[*] Archangel Supervisor Daemon Initialized."

# Ensure the script can be run once/safely in test environments or loops
# If a TEST_RUN environment variable is set, run only one iteration
iteration=0

while true; do
    # 1. Check if the core engine is alive
    ENGINE_PID=$(pgrep -f "node.*archangel" | head -n 1)
    
    if [ -z "$ENGINE_PID" ]; then
        echo "[CRITICAL] $(date) - OmniCore Engine is down! Initiating safe restart..."
        # Trigger clean boot sequence here
        if [ "$TEST_RUN" = "true" ]; then
            break
        fi
        sleep 5
        continue
    fi

    # 2. Monitor resource usage
    ENGINE_MEM=$(ps -o rss= -p "$ENGINE_PID" | tr -d ' ')
    if [ -n "$ENGINE_MEM" ] && [ "$ENGINE_MEM" -gt "$MAX_MEMORY_KB" ]; then
        echo "[WARNING] Memory threshold exceeded: ${ENGINE_MEM}KB. Tripping circuit breaker..."
        kill -SIGTERM "$ENGINE_PID" # Request graceful state save
        if [ "$TEST_RUN" = "true" ]; then
            break
        fi
        sleep 2
        continue
    fi

    # 3. Audit database update velocity & latency metrics
    # (Assuming config state exports a quick telemetry pulse file)
    if [ -f "/tmp/omni_pulse.json" ]; then
        CURRENT_LATENCY=$(python3 -c "import json; print(json.load(open('/tmp/omni_pulse.json')).get('latency_delta', 0))" 2>/dev/null || echo 0)
        
        if [ "$CURRENT_LATENCY" -gt "$LATENCY_THRESHOLD" ]; then
            echo "[ALERT] Latency anomaly detected: ${CURRENT_LATENCY}ms. Dropping engine to SAFE_MODE..."
            # Touch a flag file that the TS engine reads to adjust position sizes to zero
            touch /tmp/omni_safe_mode.flag
        fi
    fi

    if [ "$TEST_RUN" = "true" ]; then
        echo "[TEST] Single iteration check complete. OmniCore Engine PID: ${ENGINE_PID:-None}, Memory: ${ENGINE_MEM:-0}KB"
        break
    fi

    sleep "$INTERVAL"
done
