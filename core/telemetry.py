class Telemetry:
    def __init__(self):
        self.metrics = {
            "trades": 0,
            "wins": 0,
            "losses": 0,
            "pnl": 0.0,
            "latency": [],
            "weight_shifts": []
        }

    def update(self, result):
        self.metrics["trades"] += 1
        pnl = result.get("pnl", 0.0)
        self.metrics["pnl"] += pnl
        if pnl > 0:
            self.metrics["wins"] += 1
        else:
            self.metrics["losses"] += 1
        
        self.log_metrics()

    def log_metrics(self):
        win_rate = (self.metrics["wins"] / self.metrics["trades"]) * 100 if self.metrics["trades"] > 0 else 0
        print(f"\n--- [ TELEMETRY UPLINK ] ---")
        print(f"Total Trades: {self.metrics['trades']}")
        print(f"Win Rate:     {win_rate:.2f}%")
        print(f"Net PnL:      {self.metrics['pnl']:.8f}")
        print(f"---------------------------\n")
