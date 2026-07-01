#!/usr/bin/env python3
import asyncio
import math
import time
from typing import Dict, Tuple

class VarianceMarketMaker:
    def __init__(self, window_size: int = 20):
        self.window_size = window_size
        self.price_history: Dict[str, list] = {}
        self.base_spread_pct = 0.0005  # 0.05% default
        
    def _update_variance(self, symbol: str, price: float) -> float:
        if symbol not in self.price_history:
            self.price_history[symbol] = []
        
        history = self.price_history[symbol]
        history.append(price)
        if len(history) > self.window_size:
            history.pop(0)
            
        if len(history) < 2:
            return 0.0
            
        mean = sum(history) / len(history)
        variance = sum((x - mean) ** 2 for x in history) / (len(history) - 1)
        return math.sqrt(variance)

    def calculate_quotes(self, symbol: str, mid_price: float, current_bid: float, current_ask: float) -> Tuple[float, float]:
        volatility = self._update_variance(symbol, mid_price)
        
        # Adjust spread dynamic based on the asset's current micro-volatility
        vol_adjustment = (volatility / mid_price) if mid_price > 0 else 0
        dynamic_spread = mid_price * (self.base_spread_pct + vol_adjustment)
        
        target_bid = round(mid_price - (dynamic_spread / 2), 2)
        target_ask = round(mid_price + (dynamic_spread / 2), 2)
        
        return target_bid, target_ask

    async def run_quote_loop(self):
        # Operational loop interface
        mock_mid = 100.00
        for tick in range(5):
            # Simulate slight market fluctuations
            mock_mid += 0.05 if tick % 2 == 0 else -0.03
            bid, ask = self.calculate_quotes("BTCUSD", mock_mid, mock_mid - 0.02, mock_mid + 0.02)
            print(f"[MM-ENG] Symbol: BTCUSD | Mid: {mock_mid:.2f} | Generated Bid: {bid:.2f} | Generated Ask: {ask:.2f}")
            await asyncio.sleep(0.01)

if __name__ == "__main__":
    vm = VarianceMarketMaker()
    asyncio.run(vm.run_quote_loop())
