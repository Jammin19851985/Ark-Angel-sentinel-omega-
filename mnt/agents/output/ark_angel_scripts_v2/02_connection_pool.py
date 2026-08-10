#!/usr/bin/env python3
"""
Ark Angel Module: Dedicated Connection Pool (Suggestion #2)
Mathematical Theory: M/M/c Queueing + Connection Lifecycle Optimization
Core Formula: P(wait) = Erlang-C formula
  - c: pool size (servers)
  - λ: connection request rate
  - μ: service rate (1/mean_hold_time)
Enhancement: Dynamic pool sizing + connection health checks + warm standby
"""

import numpy as np
import json
import time
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from collections import deque
import math

@dataclass
class PoolSignal:
    module: str
    timestamp: str
    action: str  # 'ACQUIRE', 'RELEASE', 'EXPAND', 'SHRINK', 'HEALTH_CHECK'
    pool_id: str
    connection_id: str
    confidence: float
    meta: dict

class ConnectionPoolEngine:
    """
    Manages database/exchange connection pools using queueing theory.
    Optimizes for latency while preventing resource exhaustion.
    """
    
    def __init__(self,
                 min_size: int = 5,
                 max_size: int = 100,
                 target_utilization: float = 0.7,
                 idle_timeout_sec: float = 300.0,
                 health_check_interval_sec: float = 30.0):
        self.min_size = min_size
        self.max_size = max_size
        self.target_util = target_utilization
        self.idle_timeout = idle_timeout_sec
        self.health_interval = health_check_interval_sec
        
        self.pools = {}  # pool_id -> {connections, waiting, stats}
        self.connection_history = deque(maxlen=1000)
        
    def _erlang_c(self, arrival_rate: float, service_rate: float, c: int) -> float:
        """Calculate probability of waiting in M/M/c queue."""
        rho = arrival_rate / (c * service_rate)
        if rho >= 1:
            return 1.0
        
        numerator = (arrival_rate / service_rate) ** c / math.factorial(c) * (1 / (1 - rho))
        denominator = sum((arrival_rate / service_rate) ** k / math.factorial(k) for k in range(c)) + numerator
        return numerator / denominator
    
    def _optimal_pool_size(self, arrival_rate: float, service_rate: float) -> int:
        """Find minimum c such that P(wait) < 0.01 and utilization < target."""
        for c in range(self.min_size, self.max_size + 1):
            rho = arrival_rate / (c * service_rate)
            if rho > self.target_util:
                continue
            if self._erlang_c(arrival_rate, service_rate, c) < 0.01:
                return c
        return self.max_size
    
    def create_pool(self, pool_id: str, host: str, port: int) -> PoolSignal:
        """Initialize a new connection pool."""
        self.pools[pool_id] = {
            'host': host,
            'port': port,
            'connections': [{'id': f'{pool_id}_conn_{i}', 'status': 'idle', 'created': time.time(), 'last_used': time.time()} for i in range(self.min_size)],
            'waiting': deque(),
            'stats': {'acquired': 0, 'released': 0, 'expired': 0, 'failed': 0}
        }
        
        return PoolSignal(
            module='connection_pool', timestamp=str(time.time()), action='EXPAND',
            pool_id=pool_id, connection_id='*', confidence=1.0,
            meta={'initial_size': self.min_size, 'host': host, 'port': port}
        )
    
    def acquire(self, timestamp: str, pool_id: str, timeout_ms: float = 5000) -> List[PoolSignal]:
        """Main entry point. Acquire connection from pool."""
        signals = []
        pool = self.pools.get(pool_id)
        
        if not pool:
            signals.append(PoolSignal(
                module='connection_pool', timestamp=timestamp, action='ACQUIRE',
                pool_id=pool_id, connection_id='', confidence=0.0,
                meta={'error': 'pool_not_found'}
            ))
            return signals
        
        # Find idle connection
        idle_conn = None
        for conn in pool['connections']:
            if conn['status'] == 'idle':
                # Check if expired
                if time.time() - conn['last_used'] > self.idle_timeout:
                    conn['status'] = 'expired'
                    pool['stats']['expired'] += 1
                    continue
                idle_conn = conn
                break
        
        if idle_conn:
            idle_conn['status'] = 'acquired'
            idle_conn['last_used'] = time.time()
            pool['stats']['acquired'] += 1
            
            signals.append(PoolSignal(
                module='connection_pool', timestamp=timestamp, action='ACQUIRE',
                pool_id=pool_id, connection_id=idle_conn['id'], confidence=1.0,
                meta={'wait_time_ms': 0, 'pool_size': len(pool['connections']), 'active': sum(1 for c in pool['connections'] if c['status'] == 'acquired')}
            ))
        else:
            # Pool exhausted - check if we can expand
            current_size = len(pool['connections'])
            active = sum(1 for c in pool['connections'] if c['status'] == 'acquired')
            
            # Estimate arrival rate from history
            recent = [h for h in self.connection_history if h['pool_id'] == pool_id and time.time() - h['timestamp'] < 60]
            arrival_rate = len(recent) / 60.0 if recent else 1.0
            service_rate = 1.0 / 5.0  # Assume 5s average hold time
            
            optimal = self._optimal_pool_size(arrival_rate, service_rate)
            
            if current_size < min(optimal, self.max_size):
                # Expand pool
                new_conn = {'id': f'{pool_id}_conn_{current_size}', 'status': 'acquired', 'created': time.time(), 'last_used': time.time()}
                pool['connections'].append(new_conn)
                pool['stats']['acquired'] += 1
                
                signals.append(PoolSignal(
                    module='connection_pool', timestamp=timestamp, action='EXPAND',
                    pool_id=pool_id, connection_id=new_conn['id'], confidence=0.95,
                    meta={'new_size': len(pool['connections']), 'optimal_size': optimal, 'reason': 'pool_exhausted'}
                ))
            else:
                # Add to waiting queue
                pool['waiting'].append({'timestamp': time.time(), 'timeout': timeout_ms})
                
                signals.append(PoolSignal(
                    module='connection_pool', timestamp=timestamp, action='ACQUIRE',
                    pool_id=pool_id, connection_id='', confidence=0.5,
                    meta={'wait_queued': True, 'queue_position': len(pool['waiting']), 'estimated_wait_ms': active * 100}
                ))
        
        self.connection_history.append({'pool_id': pool_id, 'timestamp': time.time(), 'action': 'acquire'})
        return signals
    
    def release(self, timestamp: str, pool_id: str, connection_id: str) -> PoolSignal:
        """Release connection back to pool."""
        pool = self.pools.get(pool_id)
        if not pool:
            return PoolSignal(
                module='connection_pool', timestamp=timestamp, action='RELEASE',
                pool_id=pool_id, connection_id=connection_id, confidence=0.0,
                meta={'error': 'pool_not_found'}
            )
        
        for conn in pool['connections']:
            if conn['id'] == connection_id:
                conn['status'] = 'idle'
                conn['last_used'] = time.time()
                pool['stats']['released'] += 1
                
                # Check if we should shrink
                idle_count = sum(1 for c in pool['connections'] if c['status'] == 'idle')
                if idle_count > self.min_size * 2 and len(pool['connections']) > self.min_size:
                    # Mark oldest idle for removal
                    oldest = min((c for c in pool['connections'] if c['status'] == 'idle'), key=lambda x: x['last_used'])
                    pool['connections'].remove(oldest)
                    
                    return PoolSignal(
                        module='connection_pool', timestamp=timestamp, action='SHRINK',
                        pool_id=pool_id, connection_id=oldest['id'], confidence=0.9,
                        meta={'new_size': len(pool['connections']), 'reason': 'too_many_idle'}
                    )
                
                return PoolSignal(
                    module='connection_pool', timestamp=timestamp, action='RELEASE',
                    pool_id=pool_id, connection_id=connection_id, confidence=1.0,
                    meta={'hold_time_ms': round((time.time() - conn['last_used']) * 1000, 2)}
                )
        
        return PoolSignal(
            module='connection_pool', timestamp=timestamp, action='RELEASE',
            pool_id=pool_id, connection_id=connection_id, confidence=0.0,
            meta={'error': 'connection_not_found'}
        )
    
    def health_check(self, timestamp: str, pool_id: str) -> List[PoolSignal]:
        """Run health checks on all connections in pool."""
        signals = []
        pool = self.pools.get(pool_id)
        if not pool:
            return signals
        
        for conn in pool['connections']:
            if conn['status'] == 'idle':
                # Simulate health check
                is_healthy = np.random.random() > 0.05  # 5% failure rate
                
                if not is_healthy:
                    conn['status'] = 'failed'
                    pool['stats']['failed'] += 1
                    
                    signals.append(PoolSignal(
                        module='connection_pool', timestamp=timestamp, action='HEALTH_CHECK',
                        pool_id=pool_id, connection_id=conn['id'], confidence=0.0,
                        meta={'healthy': False, 'reason': 'connection_reset', 'age_sec': round(time.time() - conn['created'], 2)}
                    ))
                else:
                    signals.append(PoolSignal(
                        module='connection_pool', timestamp=timestamp, action='HEALTH_CHECK',
                        pool_id=pool_id, connection_id=conn['id'], confidence=1.0,
                        meta={'healthy': True, 'latency_ms': round(np.random.exponential(2), 2)}
                    ))
        
        return signals
    
    def to_ark_angel_json(self, signals: List[PoolSignal]) -> str:
        return json.dumps({
            'module': 'connection_pool', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'pool_id': s.pool_id, 'connection_id': s.connection_id, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    pool = ConnectionPoolEngine(min_size=3, max_size=20)
    sig = pool.create_pool('exchange_nyse', 'nyse.api.com', 443)
    signals = [sig]
    signals.extend(pool.acquire('2026-07-12T08:33:00Z', 'exchange_nyse'))
    signals.extend(pool.acquire('2026-07-12T08:33:01Z', 'exchange_nyse'))
    signals.extend(pool.health_check('2026-07-12T08:33:02Z', 'exchange_nyse'))
    print(pool.to_ark_angel_json(signals))
