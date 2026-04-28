class CognitiveRiskManager:
    """
    Feature #260: Cognitive Risk Management & Behavioral Trading.
    Analyzes market sentiment and adapts risk parameters dynamically.
    """
    def __init__(self):
        self.base_risk_tolerance = 0.02 # 2% base risk per trade
        self.cognitive_bias = "neutral"

    def analyze_cognitive_sentiment(self, social_data):
        """Adjusts trading behavior based on market fear/greed index."""
        print("Analyzing cognitive market sentiment...")
        fear_greed_index = social_data.get("fear_greed_index", 50)
        
        if fear_greed_index > 75:
            self.cognitive_bias = "extreme_greed"
            return {"risk_adjustment": -0.5, "recommendation": "reduce_exposure"}
        elif fear_greed_index < 25:
            self.cognitive_bias = "extreme_fear"
            return {"risk_adjustment": 0.5, "recommendation": "increase_exposure"}
        else:
            self.cognitive_bias = "neutral"
            return {"risk_adjustment": 0.0, "recommendation": "maintain_exposure"}

    def dynamic_stop_loss(self, position, volatility):
        """Calculates a dynamic stop loss based on cognitive volatility assessment."""
        print(f"Calculating dynamic stop loss for {position['pair']}...")
        base_stop = position['entry_price'] * 0.95
        
        if self.cognitive_bias == "extreme_fear":
            # Widen stop loss in fearful markets to avoid being wicked out
            return base_stop * (1 - (volatility * 0.5))
        elif self.cognitive_bias == "extreme_greed":
            # Tighten stop loss in greedy markets to protect profits
            return base_stop * (1 + (volatility * 0.5))
        
        return base_stop
