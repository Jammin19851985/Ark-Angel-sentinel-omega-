
import os

class Config:
    # NETWORK
    IBKR_HOST = os.getenv("IBKR_HOST", "127.0.0.1")
    
    @property
    def IBKR_PORT(self):
        try:
            return int(os.getenv("IBKR_PORT", "4001"))
        except:
            return 4001

    @property
    def IBKR_CLIENT_ID(self):
        try:
            return int(os.getenv("IBKR_CLIENT_ID", "1"))
        except:
            return 1

    # RISK
    MAX_DRAWDOWN_PCT = 0.05
    MAX_POSITION_SIZE_PCT = 0.10
    MIN_CONFIDENCE_THRESHOLD = 0.65
    
    # STRATEGY
    TIMEFRAMES = ["1m", "5m", "1h", "4h"]
    SYMBOLS = ["BTC", "ETH", "SOL", "NVDA", "TSLA", "SPY"]
    
    # SYSTEM
    HEARTBEAT_INTERVAL_SEC = 1.0
    LOG_LEVEL = "INFO"

Config = Config() # Instantiate so we can use it as a singleton with properties
