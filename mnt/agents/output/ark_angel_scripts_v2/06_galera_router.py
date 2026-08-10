#!/usr/bin/env python3
"""
Ark Angel Module: Galera Active-Passive Write Router (Suggestion #6)
Mathematical Theory: Multi-Master Replication + Quorum Consensus (Certification)
Core Formula: Certification: ∀ transactions T_i, T_j: if conflict(T_i, T_j) → abort younger
  - wsrep_certification_rules: primary key uniqueness + foreign key constraints
  - Flow control: pause replication when slave lag > threshold
Enhancement: Intelligent read routing + lag-aware load balancing + auto-failover
"""

import numpy as np
import json
import time
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from collections import deque

@dataclass
class GaleraSignal:
    module: str
    timestamp: str
    action: str  # 'WRITE_PRIMARY', 'READ_REPLICA', 'CERTIFY', 'FLOW_CONTROL', 'FAILOVER'
    node_id: str
    query_type: str
    confidence: float
    meta: dict

class GaleraRouterEngine:
    """
    Routes database queries to Galera cluster nodes with active-passive logic.
    Handles certification-based replication and flow control.
    """
    
    def __init__(self,
                 write_nodes: List[str],
                 read_nodes: List[str],
                 max_repl_lag_ms: float = 100.0,
                 flow_control_threshold: float = 0.8,
                 certification_timeout_ms: float = 50.0):
        self.write_nodes = write_nodes
        self.read_nodes = read_nodes
        self.max_lag = max_repl_lag_ms
        self.flow_threshold = flow_control_threshold
        self.certification_timeout_ms = certification_timeout_ms
        
        self.nodes = {}  # node_id -> {role, lag_ms, load, status, last_seen}
        self.primary = write_nodes[0] if write_nodes else None
        self.repl_queue = deque(maxlen=10000)
        self.certification_log = deque(maxlen=1000)
        
        for node in write_nodes:
            self.nodes[node] = {'role': 'writer', 'lag_ms': 0, 'load': 0, 'status': 'up', 'last_seen': time.time()}
        for node in read_nodes:
            self.nodes[node] = {'role': 'reader', 'lag_ms': 0, 'load': 0, 'status': 'up', 'last_seen': time.time()}
    
    def _certification_check(self, transaction_keys: List[str]) -> Tuple[bool, str]:
        """Check if transaction can be certified (no conflicts)."""
        # Check against recent certification log
        for key in transaction_keys:
            for cert in self.certification_log:
                if cert['key'] == key and cert['status'] == 'committed':
                    return False, f"conflict_on_key:{key}"
        
        return True, "no_conflict"
    
    def _select_reader(self) -> str:
        """Select least-loaded reader with acceptable lag."""
        candidates = []
        for node_id, info in self.nodes.items():
            if info['role'] == 'reader' and info['status'] == 'up' and info['lag_ms'] <= self.max_lag:
                # Score: lower load, lower lag = better
                score = info['load'] * 0.5 + info['lag_ms'] * 0.01
                candidates.append((score, node_id))
        
        if not candidates:
            # Fallback to primary writer
            return self.primary
        
        candidates.sort()
        return candidates[0][1]
    
    def _check_flow_control(self) -> bool:
        """Check if flow control should be activated."""
        total_capacity = len(self.nodes)
        stressed = sum(1 for info in self.nodes.values() if info['lag_ms'] > self.max_lag * self.flow_threshold)
        return stressed / total_capacity > self.flow_threshold if total_capacity > 0 else False
    
    def route_write(self, timestamp: str, query: str, 
                    transaction_keys: List[str]) -> List[GaleraSignal]:
        """Main entry point. Route write query through certification."""
        signals = []
        
        # Flow control check
        if self._check_flow_control():
            signals.append(GaleraSignal(
                module='galera_router', timestamp=timestamp, action='FLOW_CONTROL',
                node_id='cluster', query_type='WRITE', confidence=1.0,
                meta={'reason': 'replication_lag_high', 'max_lag_ms': self.max_lag,
                      'recommendation': 'pause_writes'}
            ))
        
        # Certification
        can_certify, reason = self._certification_check(transaction_keys)
        
        if not can_certify:
            signals.append(GaleraSignal(
                module='galera_router', timestamp=timestamp, action='CERTIFY',
                node_id=self.primary, query_type='WRITE', confidence=0.0,
                meta={'certified': False, 'reason': reason, 'transaction_keys': transaction_keys}
            ))
            return signals
        
        # Log certification
        for key in transaction_keys:
            self.certification_log.append({
                'key': key, 'timestamp': time.time(), 'status': 'committed',
                'node': self.primary
            })
        
        # Route to primary
        signals.append(GaleraSignal(
            module='galera_router', timestamp=timestamp, action='WRITE_PRIMARY',
            node_id=self.primary, query_type='WRITE', confidence=1.0,
            meta={'certified': True, 'keys': transaction_keys, 'repl_factor': len(self.read_nodes) + 1}
        ))
        
        return signals
    
    def route_read(self, timestamp: str, query: str, 
                   consistency: str = 'eventual') -> List[GaleraSignal]:
        """Route read query with consistency level."""
        signals = []
        
        if consistency == 'strong':
            # Read from primary
            node = self.primary
            action = 'WRITE_PRIMARY'
        else:
            # Read from replica
            node = self._select_reader()
            action = 'READ_REPLICA'
        
        node_info = self.nodes.get(node, {})
        
        signals.append(GaleraSignal(
            module='galera_router', timestamp=timestamp, action=action,
            node_id=node, query_type='READ', confidence=0.95 if node_info.get('status') == 'up' else 0.5,
            meta={'consistency': consistency, 'replica_lag_ms': node_info.get('lag_ms', 0),
                  'load': node_info.get('load', 0)}
        ))
        
        return signals
    
    def failover(self, timestamp: str, failed_node: str) -> List[GaleraSignal]:
        """Handle node failure and promote new primary."""
        signals = []
        
        self.nodes[failed_node]['status'] = 'down'
        
        if failed_node == self.primary:
            # Promote next writer
            available_writers = [n for n in self.write_nodes if self.nodes[n]['status'] == 'up']
            if available_writers:
                self.primary = available_writers[0]
                signals.append(GaleraSignal(
                    module='galera_router', timestamp=timestamp, action='FAILOVER',
                    node_id=self.primary, query_type='WRITE', confidence=0.9,
                    meta={'failed_node': failed_node, 'promotion_type': 'writer_to_primary',
                          'quorum_size': len(available_writers)}
                ))
            else:
                # Promote best reader
                best_reader = self._select_reader()
                self.primary = best_reader
                self.nodes[best_reader]['role'] = 'writer'
                signals.append(GaleraSignal(
                    module='galera_router', timestamp=timestamp, action='FAILOVER',
                    node_id=self.primary, query_type='WRITE', confidence=0.7,
                    meta={'failed_node': failed_node, 'promotion_type': 'reader_to_writer',
                          'warning': 'degraded_mode'}
                ))
        
        return signals
    
    def to_ark_angel_json(self, signals: List[GaleraSignal]) -> str:
        return json.dumps({
            'module': 'galera_router', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'node_id': s.node_id, 'query_type': s.query_type, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    router = GaleraRouterEngine(
        write_nodes=['galera_1', 'galera_2'],
        read_nodes=['galera_3', 'galera_4', 'galera_5']
    )
    signals = router.route_write('2026-07-12T08:33:00Z', 'INSERT INTO trades...', ['trade_id_123'])
    signals.extend(router.route_read('2026-07-12T08:33:01Z', 'SELECT * FROM positions', consistency='eventual'))
    print(router.to_ark_angel_json(signals))
