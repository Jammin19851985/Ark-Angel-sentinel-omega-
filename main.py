import time
from core.sentinel import ArchangelSentinel

def main():
    # Initialize Archangel Platform
    archangel = ArchangelSentinel()
    archangel.initialize_stack()
    
    # Bridge to Exchanges
    archangel.bridge_to_kraken()
    
    # Set Autonomy Level (0: Paper, 1: Validated, 2: Full Autonomous)
    archangel.executor.set_autonomy_level(0) 
    
    print("Archangel Trading Platform is online.")
    
    try:
        while True:
            archangel.run_autonomous_cycle()
            time.sleep(60) # Run cycle every minute
    except KeyboardInterrupt:
        print("\nArchangel shutting down safely...")

if __name__ == "__main__":
    main()
