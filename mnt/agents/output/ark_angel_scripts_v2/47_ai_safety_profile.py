#!/usr/bin/env python3
"""
Ark Angel Module: AI Safety Profile (Suggestion #47)
Mathematical Theory: Control Barrier Functions (CBF) + Safe Exploration Bounds
Core Formula: h(x_t) >= 0 and h(x_{t+1}) >= (1 - gamma) * h(x_t)
  - h(x): safety margin function (e.g., max drawdown, position limits)
  - gamma: safe recovery rate parameter (0 < gamma <= 1)
Enhancement: Real-time intervention overrides + adversarial risk injection
"""

import numpy as np
import json
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class SafetySignal:
    module: str
    timestamp: str
    action: str  # 'PASS', 'SOFT_LIMIT', 'INTERVENE', 'HALT'
    metric: str
    margin: float
    confidence: float
    meta: dict

class AISafetyProfile:
    """
    Real-time safety guardrails for autonomous Ark Angel operations.
    Enforces absolute risk bounds and limits behavior via Control Barrier Functions.
    """
    
    def __init__(self, 
                 max_drawdown: float = 0.15,
                 max_position_size: float = 500000.0,
                 max_daily_trades: int = 200,
                 gamma: float = 0.1):
        self.max_drawdown = max_drawdown
        self.max_position = max_position_size
        self.max_daily_trades = max_daily_trades
        self.gamma = gamma
        self.trade_count = 0
        self.peak_portfolio_val = 1000000.0
        
    def _barrier_function(self, current_val: float) -> float:
        """Control Barrier Function representing portfolio health (must be >= 0)."""
        drawdown = (self.peak_portfolio_val - current_val) / self.peak_portfolio_val
        return self.max_drawdown - drawdown
    
    def evaluate_state(self, timestamp: str, 
                       current_value: float, 
                       proposed_position_size: float) -> List[SafetySignal]:
        """Main entry point. Check current state and proposed actions against safety bounds."""
        signals = []
        
        # Update peak portfolio value
        if current_value > self.peak_portfolio_val:
            self.peak_portfolio_val = current_value
            
        h_t = self._barrier_function(current_value)
        
        # 1. Check absolute barrier
        if h_t < 0:
            signals.append(SafetySignal(
                module='safety_profile', timestamp=timestamp, action='HALT',
                metric='drawdown', margin=float(h_t), confidence=1.0,
                meta={'reason': 'Drawdown exceeded limit', 'peak': self.peak_portfolio_val, 'current': current_value}
            ))
            return signals
            
        # 2. Check position size limits
        if proposed_position_size > self.max_position:
            signals.append(SafetySignal(
                module='safety_profile', timestamp=timestamp, action='INTERVENE',
                metric='position_size', margin=float(self.max_position - proposed_position_size), confidence=0.95,
                meta={'proposed': proposed_position_size, 'limit': self.max_position, 'action': 'SCALE_DOWN'}
            ))
        elif proposed_position_size > self.max_position * 0.8:
            signals.append(SafetySignal(
                module='safety_profile', timestamp=timestamp, action='SOFT_LIMIT',
                metric='position_size', margin=float(self.max_position - proposed_position_size), confidence=0.85,
                meta={'warning': 'Approaching maximum position limit', 'proposed': proposed_position_size}
            ))
            
        # 3. Check daily trade limits
        self.trade_count += 1
        if self.trade_count > self.max_daily_trades:
            signals.append(SafetySignal(
                module='safety_profile', timestamp=timestamp, action='INTERVENE',
                metric='trade_frequency', margin=float(self.max_daily_trades - self.trade_count), confidence=1.0,
                meta={'trade_count': self.trade_count, 'limit': self.max_daily_trades, 'action': 'BLOCK_TRADING'}
            ))
        elif self.trade_count > self.max_daily_trades * 0.9:
            signals.append(SafetySignal(
                module='safety_profile', timestamp=timestamp, action='SOFT_LIMIT',
                metric='trade_frequency', margin=float(self.max_daily_trades - self.trade_count), confidence=0.9,
                meta={'warning': 'Approaching frequency limit', 'trade_count': self.trade_count}
            ))
            
        # 4. Control Barrier Function check (relative safe rate of change)
        expected_h_next = (1.0 - self.gamma) * h_t
        # Simulation of a next step if we proceed
        simulated_next_value = current_value - proposed_position_size * 0.05  # simple loss simulation
        h_next = self._barrier_function(simulated_next_value)
        
        if h_next < expected_h_next:
            signals.append(SafetySignal(
                module='safety_profile', timestamp=timestamp, action='SOFT_LIMIT',
                metric='barrier_decay', margin=float(h_next - expected_h_next), confidence=0.8,
                meta={'reason': 'Rate of barrier decay is too rapid', 'h_t': float(h_t), 'h_next': float(h_next)}
            ))
            
        if not signals:
            signals.append(SafetySignal(
                module='safety_profile', timestamp=timestamp, action='PASS',
                metric='all', margin=float(h_t), confidence=1.0,
                meta={'status': 'nominal', 'drawdown_pct': round((self.peak_portfolio_val - current_value) / self.peak_portfolio_val * 100, 2)}
            ))
            
        return signals

    def to_ark_angel_json(self, signals: List[SafetySignal]) -> str:
        return json.dumps({
            'module': 'safety_profile', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'metric': s.metric, 'margin': s.margin, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    safety = AISafetyProfile(max_drawdown=0.10)
    # Scenario: Safe behavior
    signals_safe = safety.evaluate_state('2026-07-12T08:00:00Z', 990000.0, 100000.0)
    print("Safe scenario:")
    print(safety.to_ark_angel_json(signals_safe))
    
    # Scenario: Dangerous behavior
    signals_danger = safety.evaluate_state('2026-07-12T08:01:00Z', 890000.0, 600000.0)
    print("\nDanger scenario:")
    print(safety.to_ark_angel_json(signals_danger))
