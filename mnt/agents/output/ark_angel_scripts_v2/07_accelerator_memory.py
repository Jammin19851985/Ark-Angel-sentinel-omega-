#!/usr/bin/env python3
"""
Ark Angel Module: Custom Accelerator Memory Tracer (Suggestion #7)
Mathematical Theory: Cache Coherence Protocols + Memory Access Pattern Analysis
Core Formula: Cache hit rate = hits / (hits + misses)
  - Temporal locality: P(access addr at t+Δt | access addr at t) ∝ 1/Δt
  - Spatial locality: P(access addr+d | access addr) ∝ 1/d
Enhancement: Prefetch prediction + NUMA-aware allocation + cache line coloring
"""

import numpy as np
import json
import time
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from collections import defaultdict, deque

@dataclass
class MemorySignal:
    module: str
    timestamp: str
    action: str  # 'ALLOC', 'ACCESS', 'PREFETCH', 'MIGRATE', 'EVICT'
    address: str
    size_bytes: int
    confidence: float
    meta: dict

class AcceleratorMemoryTracer:
    """
    Traces and optimizes memory access patterns for FPGA/ASIC accelerators.
    Predicts prefetch opportunities and optimizes NUMA placement.
    """
    
    def __init__(self,
                 cache_line_size: int = 64,
                 l1_size_kb: int = 32,
                 l2_size_kb: int = 256,
                 l3_size_kb: int = 8192,
                 numa_nodes: int = 2):
        self.cache_line = cache_line_size
        self.l1_size = l1_size_kb * 1024
        self.l2_size = l2_size_kb * 1024
        self.l3_size = l3_size_kb * 1024
        self.numa_nodes = numa_nodes
        
        self.access_log = deque(maxlen=10000)
        self.address_history = defaultdict(deque)  # addr -> [timestamps]
        self.cache_state = {'l1': set(), 'l2': set(), 'l3': set()}
        self.numa_affinity = defaultdict(int)  # thread_id -> numa_node
        
    def _get_cache_line(self, address: int) -> int:
        """Get cache line address."""
        return address // self.cache_line
    
    def _check_cache(self, cache_line: int) -> Tuple[str, bool]:
        """Check if cache line is in any cache level."""
        if cache_line in self.cache_state['l1']:
            return 'l1', True
        elif cache_line in self.cache_state['l2']:
            return 'l2', True
        elif cache_line in self.cache_state['l3']:
            return 'l3', True
        return 'memory', False
    
    def _update_cache(self, cache_line: int):
        """Update cache hierarchy on access."""
        # Promote to L1, evict if necessary
        if cache_line in self.cache_state['l1']:
            return  # Already in L1
        
        if len(self.cache_state['l1']) >= self.l1_size // self.cache_line:
            # Evict oldest (simplified LRU)
            evicted = next(iter(self.cache_state['l1']))
            self.cache_state['l1'].remove(evicted)
            # Move to L2
            self.cache_state['l2'].add(evicted)
        
        self.cache_state['l1'].add(cache_line)
        
        # Remove from lower levels
        self.cache_state['l2'].discard(cache_line)
        self.cache_state['l3'].discard(cache_line)
    
    def _predict_prefetch(self, address: int, thread_id: int) -> List[int]:
        """Predict next addresses to prefetch using stride detection."""
        history = self.address_history.get(address, deque(maxlen=10))
        if len(history) < 3:
            return []
        
        # Detect stride pattern
        diffs = [history[i] - history[i-1] for i in range(1, len(history))]
        
        if len(set(diffs)) == 1:
            # Constant stride
            stride = diffs[0]
            return [address + stride * i for i in range(1, 4)]
        
        # Check for power-of-2 access patterns (common in matrix ops)
        if all(d > 0 and (d & (d - 1)) == 0 for d in diffs if d > 0):
            return [address + max(diffs) * i for i in range(1, 3)]
        
        return []
    
    def trace_access(self, timestamp: str, address: int, size: int,
                     access_type: str = 'read', thread_id: int = 0) -> List[MemorySignal]:
        """Main entry point. Trace memory access and generate optimization signals."""
        signals = []
        cache_line = self._get_cache_line(address)
        
        # Log access
        self.access_log.append({'address': address, 'timestamp': time.time(), 'thread': thread_id})
        self.address_history[address].append(time.time())
        
        # Check cache
        level, hit = self._check_cache(cache_line)
        
        if hit:
            signals.append(MemorySignal(
                module='accel_memory', timestamp=timestamp, action='ACCESS',
                address=f'0x{address:08x}', size_bytes=size, confidence=1.0,
                meta={'cache_level': level, 'hit': True, 'thread_id': thread_id,
                      'cache_line': cache_line}
            ))
        else:
            signals.append(MemorySignal(
                module='accel_memory', timestamp=timestamp, action='ACCESS',
                address=f'0x{address:08x}', size_bytes=size, confidence=1.0,
                meta={'cache_level': 'memory', 'hit': False, 'thread_id': thread_id,
                      'miss_penalty_cycles': 200 if level == 'memory' else 20}
            ))
            
            # Update cache on miss
            self._update_cache(cache_line)
        
        # Predict prefetch
        prefetch_addrs = self._predict_prefetch(address, thread_id)
        for prefetch_addr in prefetch_addrs:
            prefetch_line = self._get_cache_line(prefetch_addr)
            if prefetch_line not in self.cache_state['l1']:
                signals.append(MemorySignal(
                    module='accel_memory', timestamp=timestamp, action='PREFETCH',
                    address=f'0x{prefetch_addr:08x}', size_bytes=self.cache_line, confidence=0.8,
                    meta={'predicted_stride': prefetch_addr - address if prefetch_addr > address else 0,
                          'target_cache': 'l2', 'thread_id': thread_id}
                ))
        
        # NUMA affinity check
        current_numa = self.numa_affinity.get(thread_id, 0)
        # Simplified: alternate NUMA nodes for different threads
        optimal_numa = thread_id % self.numa_nodes
        
        if current_numa != optimal_numa:
            self.numa_affinity[thread_id] = optimal_numa
            signals.append(MemorySignal(
                module='accel_memory', timestamp=timestamp, action='MIGRATE',
                address=f'0x{address:08x}', size_bytes=size, confidence=0.7,
                meta={'from_numa': current_numa, 'to_numa': optimal_numa,
                      'thread_id': thread_id, 'reason': 'affinity_optimization'}
            ))
        
        return signals
    
    def allocate(self, timestamp: str, size_bytes: int, 
                 thread_id: int = 0, alignment: int = 4096) -> MemorySignal:
        """Allocate accelerator memory with alignment and NUMA awareness."""
        # Simulate aligned allocation
        base_addr = np.random.randint(0, 2**32) & ~(alignment - 1)
        
        return MemorySignal(
            module='accel_memory', timestamp=timestamp, action='ALLOC',
            address=f'0x{base_addr:08x}', size_bytes=size_bytes, confidence=1.0,
            meta={'alignment': alignment, 'numa_node': thread_id % self.numa_nodes,
                  'thread_id': thread_id, 'pages': size_bytes // alignment + 1}
        )
    
    def to_ark_angel_json(self, signals: List[MemorySignal]) -> str:
        return json.dumps({
            'module': 'accel_memory', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'address': s.address, 'size_bytes': s.size_bytes, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    tracer = AcceleratorMemoryTracer(cache_line_size=64, numa_nodes=2)
    signals = []
    # Simulate sequential access pattern
    for i in range(10):
        addr = 0x1000 + i * 64
        sigs = tracer.trace_access(f'2026-07-12T08:33:{i:02d}Z', addr, 64, thread_id=0)
        signals.extend(sigs)
    signals.append(tracer.allocate('2026-07-12T08:33:10Z', 1024*1024, thread_id=1))
    print(tracer.to_ark_angel_json(signals))
