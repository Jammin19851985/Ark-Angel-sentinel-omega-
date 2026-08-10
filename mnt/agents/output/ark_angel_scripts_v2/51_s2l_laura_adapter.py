#!/usr/bin/env python3
"""
Ark Angel Module: S2L Laura Adapter (Suggestion #51)
Mathematical Theory: Stream-to-Limit (S2L) Adaptive Filtering
Core Formula: limit(t+1) = limit(t) * (1 - lambda) + raw_signal(t) * lambda
  - Exponential smoothing of external trade execution speeds and price spreads.
  - Generates adaptive execution bounds for Laura trading nodes.
Enhancement: Dynamic speed correction based on communication latency
"""

import numpy as np
import json
import time
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class AdapterSignal:
    module: str
    timestamp: str
    action: str  # 'ADAPT_CEILING', 'SPREAD_COMPRESS', 'STREAM_SYNC', 'WARN'
    adapter_id: str
    limit_value: float
    confidence: float
    meta: dict

class S2LLauraAdapter:
    """
    S2L (Stream-to-Limit) adaptor that converts real-time stream volatility
    into structured execution ceilings and limit envelopes for the Laura trade execution system.
    """
    
    def __init__(self, base_limit: float = 1000.0, smoothing_factor: float = 0.15):
        self.limit = base_limit
        self.alpha = smoothing_factor
        self.latency_history = []
        
    def adapt(self, timestamp: str, adapter_id: str, 
              stream_volatility: float, latency_ms: float) -> List[AdapterSignal]:
        """Main entry point. Ingest stream stats and update adaptive bounds."""
        signals = []
        
        self.latency_history.append(latency_ms)
        if len(self.latency_history) > 30:
            self.latency_history.pop(0)
            
        mean_latency = np.mean(self.latency_history)
        
        # S2L adaptation formula with latency-adjusted factor
        adjusted_alpha = self.alpha / (1.0 + mean_latency / 100.0)  # dampens update if latency is high
        
        # Target limit is inversely proportional to volatility
        target_limit = 5000.0 / (stream_volatility + 1e-6)
        old_limit = self.limit
        self.limit = self.limit * (1.0 - adjusted_alpha) + target_limit * adjusted_alpha
        
        # 1. Adapt ceiling
        signals.append(AdapterSignal(
            module='s2l_laura_adapter', timestamp=timestamp, action='ADAPT_CEILING',
            adapter_id=adapter_id, limit_value=round(self.limit, 4), confidence=0.95,
            meta={'old_limit': round(old_limit, 4), 'volatility': round(stream_volatility, 4), 'alpha_used': round(adjusted_alpha, 4)}
        ))
        
        # 2. Spread warning under volatile stream conditions
        if stream_volatility > 5.0:
            signals.append(AdapterSignal(
                module='s2l_laura_adapter', timestamp=timestamp, action='SPREAD_COMPRESS',
                adapter_id=adapter_id, limit_value=round(self.limit * 0.75, 4), confidence=0.85,
                meta={'warning': 'High volatility stream, compressing limit envelope', 'raw_volatility': stream_volatility}
            ))
            
        # 3. Latency warning
        if mean_latency > 300.0:
            signals.append(AdapterSignal(
                module='s2l_laura_adapter', timestamp=timestamp, action='WARN',
                adapter_id=adapter_id, limit_value=round(self.limit, 4), confidence=0.9,
                meta={'warning': 'S2L adapter stream experiencing high latency', 'mean_latency_ms': round(mean_latency, 2)}
            ))
            
        return signals

    def to_ark_angel_json(self, signals: List[AdapterSignal]) -> str:
        return json.dumps({
            'module': 's2l_laura_adapter', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'adapter_id': s.adapter_id, 'limit_value': s.limit_value, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    adapter = S2LLauraAdapter(base_limit=2000.0)
    signals = adapter.adapt('2026-07-12T08:00:00Z', 'laura_node_1', 1.25, 45.0)
    print(adapter.to_ark_angel_json(signals))
