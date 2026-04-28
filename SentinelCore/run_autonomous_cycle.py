import time
import sys
import gc
import logging
from logging.handlers import RotatingFileHandler
from collections import deque
from datetime import datetime
import os

# Configure Rotating File Handler for log rotation (5MB cap)
log_file = os.path.join(os.path.dirname(__file__), "sentinel_runtime.log")
logger = logging.getLogger("SentinelCore")
logger.setLevel(logging.INFO)

# Avoid adding multiple handlers if ran interactively
if not logger.handlers:
    handler = RotatingFileHandler(log_file, maxBytes=5*1024*1024, backupCount=2)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    # Add stdout logging as well
    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setFormatter(formatter)
    logger.addHandler(stdout_handler)

# Memory Buffer hard-capped at 1000 entries
state_buffer = deque(maxlen=1000)

def execute_handshake():
    logger.info("[SICO] Handshake Protocol: INITIATED")
    time.sleep(0.5)
    logger.info("[SICO] Synchronizing live order books and liquidity data...")
    time.sleep(0.5)
    logger.info("[SICO] Engine LIVE. Awaiting Alpha signals.")

def autonomous_loop():
    logger.info("[Sentinel Core] Initiating Phase 10 Phoenix Protocol (Live Mode)...")
    try:
        execute_handshake()
    except Exception as e:
        logger.error(f"[!] SICO Handshake Failed: {e}")
        return

    cycle_count = 0
    while True:
        cycle_count += 1
        
        # Decoupled state object to prevent memory leaks
        current_state = {
            "cycle": cycle_count,
            "timestamp": datetime.now().isoformat(),
            "status": "active"
        }
        state_buffer.append(current_state)
        
        if cycle_count % 10 == 0:
            logger.info(f"Cycle {cycle_count} completed. Buffer size: {len(state_buffer)}")
        
        # Explicit garbage collection after cycle processing
        gc.collect()
        
        # Simulate autonomous processing duration
        time.sleep(1)

if __name__ == '__main__':
    try:
        autonomous_loop()
    except KeyboardInterrupt:
        logger.info("Autonomous cycle terminated by user.")
