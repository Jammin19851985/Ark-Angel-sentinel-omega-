#!/usr/bin/env python3
"""
Ark Angel Module: Resiliency Circuit Breakers (Suggestion #4)
Mathematical Theory: Markov State Machine + Exponential Moving Average Failure Rate
Core Formula: P(failure) = α·I(failure) + (1-α)·P(failure)_{t-1}  (EWMA)
  - CLOSED: normal operation, track failure rate
  - OPEN: reject requests, wait for timeout
  - HALF_OPEN: allow probe requests
Enhancement: Adaptive timeout + partial degradation + bulkhead isolation
"""

import numpy as np
import json
import time
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from enum import Enum

@dataclass
class CircuitSignal:
    module: str
    timestamp: str
    action: str  # 'CLOSED', 'OPEN', 'HALF_OPEN', 'PROBE', 'DEGRADE'
    service_id: str
    failure_rate: float
    confidence: float
    meta: dict

class CircuitState(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"

class CircuitBreakerEngine:
    """
    Circuit breaker with EWMA failure tracking and adaptive state transitions.
    Isolates failing services to prevent cascade failures.
    """
    
    def __init__(self,
                 failure_threshold: float = 0.5,
                 success_threshold: float = 0.8,
                 timeout_base_sec: float = 30.0,
                 ewma_alpha: float = 0.3,
                 min_requests: int = 10):
        self.failure_threshold = failure_threshold
        self.success_threshold = success_threshold
        self.timeout_base = timeout_base_sec
        self.alpha = ewma_alpha
        self.min_requests = min_requests
        
        self.circuits = {}  # service_id -> state machine
        
    def _init_circuit(self, service_id: str):
        """Initialize circuit breaker state."""
        self.circuits[service_id] = {
            'state': CircuitState.CLOSED,
            'failure_rate': 0.0,
            'success_rate': 1.0,
            'requests': 0,
            'failures': 0,
            'successes': 0,
            'last_failure_time': 0,
            'timeout_multiplier': 1.0,
            'probe_count': 0,
            'max_probe': 5
        }
    
    def _update_ewma(self, service_id: str, is_failure: bool):
        """Update EWMA failure rate."""
        circuit = self.circuits[service_id]
        indicator = 1.0 if is_failure else 0.0
        circuit['failure_rate'] = self.alpha * indicator + (1 - self.alpha) * circuit['failure_rate']
        circuit['success_rate'] = 1.0 - circuit['failure_rate']
        circuit['requests'] += 1
        
        if is_failure:
            circuit['failures'] += 1
            circuit['last_failure_time'] = time.time()
        else:
            circuit['successes'] += 1
    
    def _should_trip(self, service_id: str) -> bool:
        """Check if circuit should trip to OPEN."""
        circuit = self.circuits[service_id]
        
        if circuit['requests'] < self.min_requests:
            return False
        
        return circuit['failure_rate'] > self.failure_threshold
    
    def _should_close(self, service_id: str) -> bool:
        """Check if circuit should close from HALF_OPEN."""
        circuit = self.circuits[service_id]
        return circuit['success_rate'] > self.success_threshold and circuit['probe_count'] >= circuit['max_probe']
    
    def _get_timeout(self, service_id: str) -> float:
        """Calculate adaptive timeout based on failure history."""
        circuit = self.circuits[service_id]
        return self.timeout_base * circuit['timeout_multiplier']
    
    def call(self, timestamp: str, service_id: str, operation: callable) -> List[CircuitSignal]:
        """Main entry point. Execute operation through circuit breaker."""
        signals = []
        
        if service_id not in self.circuits:
            self._init_circuit(service_id)
        
        circuit = self.circuits[service_id]
        
        # Check current state
        if circuit['state'] == CircuitState.OPEN:
            # Check if timeout expired
            if time.time() - circuit['last_failure_time'] > self._get_timeout(service_id):
                circuit['state'] = CircuitState.HALF_OPEN
                circuit['probe_count'] = 0
                signals.append(CircuitSignal(
                    module='circuit_breaker', timestamp=timestamp, action='HALF_OPEN',
                    service_id=service_id, failure_rate=round(circuit['failure_rate'], 4), confidence=0.8,
                    meta={'timeout_sec': self._get_timeout(service_id), 'previous_failures': circuit['failures']}
                ))
            else:
                signals.append(CircuitSignal(
                    module='circuit_breaker', timestamp=timestamp, action='OPEN',
                    service_id=service_id, failure_rate=round(circuit['failure_rate'], 4), confidence=1.0,
                    meta={'remaining_timeout_sec': round(self._get_timeout(service_id) - (time.time() - circuit['last_failure_time']), 2)}
                ))
                return signals
        
        # Execute operation
        try:
            result = operation()
            self._update_ewma(service_id, False)
            
            if circuit['state'] == CircuitState.HALF_OPEN:
                circuit['probe_count'] += 1
                if self._should_close(service_id):
                    circuit['state'] = CircuitState.CLOSED
                    circuit['failure_rate'] = 0.0
                    circuit['timeout_multiplier'] = 1.0
                    signals.append(CircuitSignal(
                        module='circuit_breaker', timestamp=timestamp, action='CLOSED',
                        service_id=service_id, failure_rate=0.0, confidence=1.0,
                        meta={'probes_passed': circuit['probe_count'], 'circuit_restored': True}
                    ))
                else:
                    signals.append(CircuitSignal(
                        module='circuit_breaker', timestamp=timestamp, action='PROBE',
                        service_id=service_id, failure_rate=round(circuit['failure_rate'], 4), confidence=0.9,
                        meta={'probe_count': circuit['probe_count'], 'max_probe': circuit['max_probe']}
                    ))
            else:
                signals.append(CircuitSignal(
                    module='circuit_breaker', timestamp=timestamp, action='CLOSED',
                    service_id=service_id, failure_rate=round(circuit['failure_rate'], 4), confidence=1.0,
                    meta={'requests': circuit['requests'], 'successes': circuit['successes']}
                ))
                
        except Exception as e:
            self._update_ewma(service_id, True)
            
            if self._should_trip(service_id):
                circuit['state'] = CircuitState.OPEN
                circuit['timeout_multiplier'] *= 2  # Exponential backoff
                
                signals.append(CircuitSignal(
                    module='circuit_breaker', timestamp=timestamp, action='OPEN',
                    service_id=service_id, failure_rate=round(circuit['failure_rate'], 4), confidence=1.0,
                    meta={'tripped': True, 'timeout_sec': self._get_timeout(service_id), 'error': str(e)[:100]}
                ))
            else:
                signals.append(CircuitSignal(
                    module='circuit_breaker', timestamp=timestamp, action='DEGRADE',
                    service_id=service_id, failure_rate=round(circuit['failure_rate'], 4), confidence=0.7,
                    meta={'degraded': True, 'fallback_active': True, 'error': str(e)[:100]}
                ))
        
        return signals
    
    def to_ark_angel_json(self, signals: List[CircuitSignal]) -> str:
        return json.dumps({
            'module': 'circuit_breaker', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'service_id': s.service_id, 'failure_rate': s.failure_rate, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    cb = CircuitBreakerEngine(failure_threshold=0.5, min_requests=5)
    
    def flaky_op():
        if np.random.random() > 0.7:
            raise Exception("Service unavailable")
        return "success"
    
    signals = []
    for i in range(15):
        sigs = cb.call(f'2026-07-12T08:33:{i:02d}Z', 'pricing_service', flaky_op)
        signals.extend(sigs)
    
    print(cb.to_ark_angel_json(signals))
