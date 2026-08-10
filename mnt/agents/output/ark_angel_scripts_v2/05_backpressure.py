#!/usr/bin/env python3
"""
Ark Angel Module: Backpressure Handler (Suggestion #5)
Mathematical Theory: Token Bucket + Leaky Bucket Rate Limiting
Core Formula: tokens(t) = min(capacity, tokens(t-Δt) + rate·Δt) - consumed
  - Token bucket: allows burst up to capacity
  - Leaky bucket: smooths output to constant rate
Enhancement: Adaptive rate based on downstream latency + priority queuing
"""

import numpy as np
import json
import time
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from collections import deque

@dataclass
class BackpressureSignal:
    module: str
    timestamp: str
    action: str  # 'ACCEPT', 'BUFFER', 'DROP', 'THROTTLE', 'SCHEDULE'
    stream_id: str
    queue_depth: int
    confidence: float
    meta: dict

class BackpressureEngine:
    """
    Manages backpressure with token bucket and adaptive rate limiting.
    Prevents downstream services from being overwhelmed.
    """
    
    def __init__(self,
                 token_rate: float = 1000.0,  # tokens/sec
                 token_capacity: int = 5000,
                 max_queue_size: int = 10000,
                 target_latency_ms: float = 50.0,
                 priority_levels: int = 5):
        self.token_rate = token_rate
        self.capacity = token_capacity
        self.max_queue = max_queue_size
        self.target_latency = target_latency_ms
        self.n_priorities = priority_levels
        
        self.tokens = token_capacity
        self.last_update = time.time()
        self.queues = {i: deque() for i in range(priority_levels)}
        self.processed = 0
        self.dropped = 0
        self.latency_history = deque(maxlen=100)
        
    def _add_tokens(self):
        """Add tokens based on elapsed time."""
        now = time.time()
        elapsed = now - self.last_update
        self.tokens = min(self.capacity, self.tokens + self.token_rate * elapsed)
        self.last_update = now
    
    def _adaptive_rate(self, observed_latency_ms: float) -> float:
        """Adjust token rate based on observed downstream latency."""
        error = (observed_latency_ms - self.target_latency) / self.target_latency
        
        if error > 0.5:  # Latency too high
            self.token_rate *= 0.9
        elif error < -0.3:  # Latency low, can increase
            self.token_rate *= 1.05
        
        # Bounds
        self.token_rate = max(10, min(self.token_rate, self.capacity * 2))
        return self.token_rate
    
    def _select_queue(self) -> Optional[Tuple[int, dict]]:
        """Select highest priority item using weighted fair queuing."""
        for priority in range(self.n_priorities):
            if self.queues[priority]:
                return (priority, self.queues[priority].popleft())
        return None
    
    def submit(self, timestamp: str, stream_id: str, payload: bytes,
               priority: int = 2, observed_latency_ms: float = None) -> List[BackpressureSignal]:
        """Main entry point. Submit item with backpressure handling."""
        signals = []
        
        # Update adaptive rate if latency provided
        if observed_latency_ms is not None:
            self.latency_history.append(observed_latency_ms)
            avg_latency = np.mean(self.latency_history) if self.latency_history else observed_latency_ms
            self._adaptive_rate(avg_latency)
        
        # Check token availability
        self._add_tokens()
        
        # Calculate total queue depth
        total_queued = sum(len(q) for q in self.queues.values())
        
        if self.tokens >= 1 and total_queued < self.max_queue * 0.8:
            # Immediate processing
            self.tokens -= 1
            self.processed += 1
            
            signals.append(BackpressureSignal(
                module='backpressure', timestamp=timestamp, action='ACCEPT',
                stream_id=stream_id, queue_depth=total_queued, confidence=1.0,
                meta={'tokens_remaining': int(self.tokens), 'priority': priority,
                      'payload_bytes': len(payload), 'rate_tps': round(self.token_rate, 2)}
            ))
        elif total_queued < self.max_queue:
            # Buffer for later
            self.queues[priority].append({
                'stream_id': stream_id,
                'payload': payload,
                'timestamp': timestamp,
                'priority': priority
            })
            
            signals.append(BackpressureSignal(
                module='backpressure', timestamp=timestamp, action='BUFFER',
                stream_id=stream_id, queue_depth=total_queued + 1, confidence=0.9,
                meta={'queue_position': len(self.queues[priority]), 'priority': priority,
                      'estimated_wait_ms': round(total_queued / self.token_rate * 1000, 2)}
            ))
        else:
            # Queue full - drop or throttle
            if priority >= self.n_priorities - 1:  # Lowest priority
                self.dropped += 1
                signals.append(BackpressureSignal(
                    module='backpressure', timestamp=timestamp, action='DROP',
                    stream_id=stream_id, queue_depth=total_queued, confidence=1.0,
                    meta={'reason': 'queue_full', 'dropped_total': self.dropped,
                          'drop_rate': round(self.dropped / (self.processed + self.dropped + 1), 4)}
                ))
            else:
                # Throttle: reduce priority and retry
                signals.append(BackpressureSignal(
                    module='backpressure', timestamp=timestamp, action='THROTTLE',
                    stream_id=stream_id, queue_depth=total_queued, confidence=0.7,
                    meta={'new_priority': priority + 1, 'retry_after_ms': 100,
                          'adaptive_rate': round(self.token_rate, 2)}
                ))
        
        return signals
    
    def drain(self, timestamp: str, batch_size: int = 100) -> List[BackpressureSignal]:
        """Drain queued items when tokens available."""
        signals = []
        self._add_tokens()
        
        processed = 0
        while self.tokens >= 1 and processed < batch_size:
            item = self._select_queue()
            if not item:
                break
            
            priority, data = item
            self.tokens -= 1
            processed += 1
            
            signals.append(BackpressureSignal(
                module='backpressure', timestamp=timestamp, action='SCHEDULE',
                stream_id=data['stream_id'], queue_depth=sum(len(q) for q in self.queues.values()),
                confidence=1.0,
                meta={'wait_time_ms': round((time.time() - data.get('enqueue_time', time.time())) * 1000, 2),
                      'priority': priority}
            ))
        
        return signals
    
    def to_ark_angel_json(self, signals: List[BackpressureSignal]) -> str:
        return json.dumps({
            'module': 'backpressure', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'stream_id': s.stream_id, 'queue_depth': s.queue_depth, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    bp = BackpressureEngine(token_rate=100, token_capacity=500, max_queue_size=1000)
    signals = []
    for i in range(20):
        sigs = bp.submit(f'2026-07-12T08:33:{i:02d}Z', f'stream_{i}', b'payload', priority=i % 5, observed_latency_ms=45)
        signals.extend(sigs)
    print(bp.to_ark_angel_json(signals))
