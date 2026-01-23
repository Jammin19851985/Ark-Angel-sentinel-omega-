
class Config:
    # NETWORK
    IBKR_HOST = "127.0.0.1"
    IBKR_PORT = 4001 # Live port
    IBKR_CLIENT_ID = 1

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
