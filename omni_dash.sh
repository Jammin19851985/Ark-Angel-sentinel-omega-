#!/usr/bin/env bash
# omni_dash.sh - Mobile-Friendly CLI Monitor

STATE_FILE="$HOME/.archangel_state.json"

# Clear terminal screen if not in test run
if [ "$TEST_RUN" != "true" ]; then
    clear
fi

while true; do
    # Jump cursor back to top-left instead of flickering with clear
    if [ "$TEST_RUN" != "true" ]; then
        tput cup 0 0
    fi
    
    echo -e "==============================================="
    echo -e "          ARCHANGEL OMNICORE DASHBOARD        "
    echo -e "          Status: ACTIVE   Time: $(date +%H:%M:%S) "
    echo -e "==============================================="
    
    if [ -f "$STATE_FILE" ]; then
        # Parse data using python3 to avoid jq dependency
        POS_SIZE=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('POSITION_SIZE', ''))" 2>/dev/null)
        STOP_OFF=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('STOP_OFFSET', ''))" 2>/dev/null)
        LATENCY=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('latency_delta', 0))" 2>/dev/null)
        VOLATILITY=$(python3 -c "import json; print(json.load(open('$STATE_FILE')).get('volatility_index', ''))" 2>/dev/null)
        
        # Determine status color coding for rapid mobile scannability without bc dependency
        if [ -n "$LATENCY" ] && [ "$LATENCY" -gt 150 ] 2>/dev/null; then
            LAT_STATUS="⚠️ HIGH DELTA"
        else
            LAT_STATUS="⚡ OPTIMAL"
        fi

        echo -e "  [ENGINE METRICS]"
        printf "    %-18s : %s ms (%s)\n" "Latency Offset" "$LATENCY" "$LAT_STATUS"
        printf "    %-18s : %s\n" "Live Volatility" "$VOLATILITY"
        echo -e "-----------------------------------------------"
        echo -e "  [DYNAMIC STATE CONFIG]"
        printf "    %-18s : \033[1;32m%s\033[0m\n" "POSITION_SIZE" "$POS_SIZE"
        printf "    %-18s : \033[1;33m%s\033[0m\n" "STOP_OFFSET" "$STOP_OFF"
    else
        echo -e "\n  [!] Waiting for state database configuration stream..."
    fi
    echo -e "==============================================="
    echo -e "  [Press CTRL+C to detach pipeline terminal]"
    
    if [ "$TEST_RUN" = "true" ]; then
        break
    fi
    
    sleep 1
done
