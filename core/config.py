
class Config:
    # NETWORK
    IBKR_HOST = "127.0.0.1"
    IBKR_PORT = 4001 # Live port
    IBKR_CLIENT_ID = 1

    # ARK OF THE COVENANT CHARITY VAULT
    CHARITY_VAULT_EMAIL = "adampriestley811@kohotranfers.ca"
    PROFIT_ROUTING_PCT = 1.00 # 100% of profits
    
    # ARCHANGEL MONOLITH RISK
    MAX_DRAWDOWN_PCT = 0.05 # 5% Drawdown Killswitch
    MAX_POSITION_SIZE_PCT = 0.10
    MIN_CONFIDENCE_THRESHOLD = 0.65
    VOLATILITY_ADJUSTED_SIZING = True # Feature #2
    FLASH_CRASH_DETECTION = True # Feature #7
    IP_PROXY_MASKING = True # Feature #6
    
    # STRATEGY
    TIMEFRAMES = ["1m", "5m", "1h", "4h"]
    SYMBOLS = ["BTC", "ETH", "SOL", "NVDA", "TSLA", "SPY"]
    
    # SYSTEM
    HEARTBEAT_INTERVAL_SEC = 1.0
    LOG_LEVEL = "INFO"
