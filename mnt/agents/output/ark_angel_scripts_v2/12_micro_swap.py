#!/usr/bin/env python3
"""
Ark Angel Module: Micro Swap Algorithm (Module 12)
Mathematical Theory: Constant Product Market Maker (CPMM) + Slippage Optimization
Core Formula: Δy = (y·Δx)/(x + Δx) where x·y = k (constant product)
"""
import json
import math
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class SwapSignal:
    module: str
    timestamp: str
    action: str
    pool_id: str
    amount_in: float
    expected_out: float
    confidence: float
    meta: dict

class MicroSwapEngine:
    def __init__(self, max_slippage_pct: float = 0.5, min_split_size: float = 100.0):
        self.max_slippage = max_slippage_pct / 100
        self.min_split = min_split_size
        self.pools = {}

    def _constant_product_out(self, x: float, y: float, dx: float, fee: float = 0.003) -> float:
        """Calculate output given constant product x*y=k with fee."""
        dx_with_fee = dx * (1 - fee)
        return (y * dx_with_fee) / (x + dx_with_fee)

    def _optimal_splits(self, total_amount: float, pool_depth: float, n_pools: int) -> List[float]:
        """Split order across pools to minimize slippage."""
        if n_pools == 1:
            return [total_amount]
        splits = [total_amount / n_pools] * n_pools
        return [max(s, self.min_split) for s in splits if s > self.min_split]

    def execute_swap(self, timestamp: str, pool_id: str, token_in: str, 
                     token_out: str, amount: float) -> List[SwapSignal]:
        signals = []
        if pool_id not in self.pools:
            self.pools[pool_id] = {'x': 1000000, 'y': 1000000, 'fee': 0.003}
        
        pool = self.pools[pool_id]
        out = self._constant_product_out(pool['x'], pool['y'], amount, pool['fee'])
        slippage = (amount / pool['x']) / (1 + amount / pool['x'])
        
        if slippage > self.max_slippage:
            n_splits = math.ceil(slippage / self.max_slippage)
            splits = self._optimal_splits(amount, pool['x'], n_splits)
            
            for i, split in enumerate(splits):
                split_out = self._constant_product_out(pool['x'], pool['y'], split, pool['fee'])
                pool['x'] += split
                pool['y'] -= split_out
                
                signals.append(SwapSignal(
                    module='micro_swap', timestamp=timestamp, action='SPLIT_SWAP',
                    pool_id=f"{pool_id}_{i}", amount_in=split, expected_out=round(split_out, 6),
                    confidence=0.95, meta={'split_index': i, 'total_splits': len(splits), 'slippage': round(slippage / len(splits), 6)}
                ))
        else:
            signals.append(SwapSignal(
                module='micro_swap', timestamp=timestamp, action='DIRECT_SWAP',
                pool_id=pool_id, amount_in=amount, expected_out=round(out, 6),
                confidence=0.98, meta={'slippage': round(slippage, 6), 'fee': pool['fee']}
            ))
        return signals

    def to_ark_angel_json(self, signals: List[SwapSignal]) -> str:
        return json.dumps({
            'module': 'micro_swap', 'version': '2.1',
            'signals': [{
                'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 
                'pool_id': s.pool_id, 'amount_in': s.amount_in, 'expected_out': s.expected_out, 
                'confidence': s.confidence, 'meta': s.meta
            } for s in signals]
        }, indent=2)

if __name__ == '__main__':
    engine = MicroSwapEngine()
    signals = engine.execute_swap('2026-07-13T09:36:00Z', 'btc_usdt_pool', 'BTC', 'USDT', 50000.0)
    print(engine.to_ark_angel_json(signals))
