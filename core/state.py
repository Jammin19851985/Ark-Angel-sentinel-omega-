
import asyncio
import time

class RiskEngine:
    def check(self, intent):
        # Simulated risk check
        return {"approved": True, "reason": "WITHIN_LIMITS"}

class Metrics:
    def __init__(self):
        self.latency = 0.0
        self.uptime = 0.0

class GlobalState:
    def __init__(self):
        self.risk_engine = RiskEngine()
        self.metrics = Metrics()
        self.qubit_coherence = 120.5
        self.active_orders = []
        self._start_time = time.time()

    async def heartbeat_loop(self):
        while True:
            self.metrics.uptime = time.time() - self._start_time
            # Simulate latency jitter
            self.metrics.latency = 15.0 + (time.time() % 10) 
            await asyncio.sleep(1)

    def get_pnl(self):
        return 1250.50 # Mock PnL

    async def log_trade(self, order_id, intent):
        print(f"LOG: Order {order_id} stored in immutable ledger.")
