#!/usr/bin/env python3
import asyncio
import time

class IcebergTracer:
    def __init__(self):
        self.last_visible_depth = 0.0

    async def analyze_tape(self, trade_sz: float, bid_sz_before: float, bid_sz_after: float):
        expected_drop = bid_sz_before - trade_sz
        if bid_sz_after > expected_drop and trade_sz > 0.5:
            hidden_fill = bid_sz_after - expected_drop
            print(f"[SHADOW-TRACE] Hidden Institutional Liquidity Detected: {hidden_fill:.4f} units filled.")

class MicroPriceVelocity:
    def __init__(self):
        self.prev_micro = 0.0

    def compute_velocity(self, bid: float, ask: float, b_sz: float, a_sz: float) -> float:
        micro = (bid * a_sz + ask * b_sz) / (b_sz + a_sz) if (b_sz + a_sz) > 0 else bid
        velocity = micro - self.prev_micro if self.prev_micro > 0 else 0.0
        self.prev_micro = micro
        return velocity

class CancelSentinel:
    def __init__(self):
        self.cancels = 0
        self.fills = 0

    def record_activity(self, action_type: str):
        if action_type == "CANCEL": self.cancels += 1
        elif action_type == "FILL": self.fills += 1

    def is_spoofed(self) -> bool:
        if self.fills == 0: return self.cancels > 50
        return (self.cancels / self.fills) > 20.0

class QueueEstimator:
    def estimate_position(self, cumulative_volume_ahead: float, executed_since_join: float) -> float:
        remaining = cumulative_volume_ahead - executed_since_join
        return max(0.0, remaining)
