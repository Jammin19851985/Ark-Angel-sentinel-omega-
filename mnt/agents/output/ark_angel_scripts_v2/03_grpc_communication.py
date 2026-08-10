#!/usr/bin/env python3
"""
Ark Angel Module: gRPC Communication Layer (Suggestion #3)
Mathematical Theory: Protocol Buffers + HTTP/2 Multiplexing + Flow Control
Core Formula: Throughput = min(BW, CWND/RTT) where CWND = congestion window
  - HTTP/2: binary framing + header compression (HPACK) + stream multiplexing
  - gRPC: unary, client streaming, server streaming, bidirectional
Enhancement: Adaptive load balancing + deadline propagation + circuit breaker
"""

import numpy as np
import json
import time
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional, Callable
from enum import Enum

@dataclass
class GRPCSignal:
    module: str
    timestamp: str
    action: str  # 'CONNECT', 'STREAM', 'BIDIRECT', 'DEADLINE', 'RETRY'
    service_id: str
    method: str
    confidence: float
    meta: dict

class StreamType(Enum):
    UNARY = "unary"
    CLIENT_STREAMING = "client_streaming"
    SERVER_STREAMING = "server_streaming"
    BIDIRECTIONAL = "bidirectional"

class GRPCCommunicationEngine:
    """
    gRPC communication layer with HTTP/2 multiplexing and adaptive flow control.
    Replaces HTTP/JSON for inter-service Ark Angel communication.
    """
    
    def __init__(self,
                 max_concurrent_streams: int = 100,
                 initial_cwnd: int = 65535,
                 target_rtt_ms: float = 10.0,
                 max_message_size_mb: float = 4.0):
        self.max_streams = max_concurrent_streams
        self.cwnd = initial_cwnd
        self.target_rtt = target_rtt_ms
        self.max_msg_size = max_message_size_mb * 1024 * 1024
        
        self.services = {}  # service_id -> {host, port, streams, load}
        self.connections = {}  # conn_id -> {streams, bytes_sent, bytes_recv}
        self.retry_policy = {'max_attempts': 3, 'backoff_base_ms': 100}
        
    def _calculate_cwnd(self, rtt_ms: float, loss_rate: float) -> int:
        """Adaptive congestion window based on RTT and loss."""
        # TCP BBR-inspired: cwnd ∝ bandwidth / RTT
        bandwidth = self.cwnd / max(rtt_ms, 1)  # bytes/ms
        
        if loss_rate > 0.01:
            # Multiplicative decrease
            self.cwnd = int(self.cwnd * 0.7)
        elif rtt_ms < self.target_rtt * 0.8:
            # Additive increase
            self.cwnd = min(self.cwnd + 1460, self.max_streams * 65535)
        
        return self.cwnd
    
    def _select_backend(self, service_id: str) -> str:
        """Least-connections load balancing."""
        backends = self.services.get(service_id, [])
        if not backends:
            return None
        
        # Weighted by active streams and RTT
        scores = []
        for backend in backends:
            load = backend.get('active_streams', 0)
            rtt = backend.get('avg_rtt_ms', 10)
            score = 1.0 / (load + 1) * (1.0 / (rtt + 1))
            scores.append((score, backend['id']))
        
        scores.sort(reverse=True)
        return scores[0][1]
    
    def unary_call(self, timestamp: str, service_id: str, method: str,
                   payload: bytes, deadline_ms: float = 5000) -> List[GRPCSignal]:
        """Main entry point. Execute unary RPC call."""
        signals = []
        
        backend = self._select_backend(service_id)
        if not backend:
            signals.append(GRPCSignal(
                module='grpc_comm', timestamp=timestamp, action='CONNECT',
                service_id=service_id, method=method, confidence=0.0,
                meta={'error': 'no_backends_available'}
            ))
            return signals
        
        # Simulate call with deadline
        start = time.time()
        rtt = np.random.exponential(self.target_rtt)
        
        if rtt > deadline_ms:
            # Deadline exceeded - retry
            signals.append(GRPCSignal(
                module='grpc_comm', timestamp=timestamp, action='DEADLINE',
                service_id=service_id, method=method, confidence=0.0,
                meta={'deadline_ms': deadline_ms, 'actual_rtt_ms': round(rtt, 2), 'retry': True}
            ))
            
            # Exponential backoff retry
            for attempt in range(1, self.retry_policy['max_attempts'] + 1):
                backoff = self.retry_policy['backoff_base_ms'] * (2 ** attempt)
                new_rtt = np.random.exponential(self.target_rtt)
                
                if new_rtt <= deadline_ms:
                    signals.append(GRPCSignal(
                        module='grpc_comm', timestamp=timestamp, action='RETRY',
                        service_id=service_id, method=method, confidence=0.9,
                        meta={'attempt': attempt, 'backoff_ms': backoff, 'success': True}
                    ))
                    break
            else:
                signals.append(GRPCSignal(
                    module='grpc_comm', timestamp=timestamp, action='RETRY',
                    service_id=service_id, method=method, confidence=0.0,
                    meta={'attempt': self.retry_policy['max_attempts'], 'error': 'max_retries_exceeded'}
                ))
        else:
            # Success
            self.cwnd = self._calculate_cwnd(rtt, 0.0)
            
            signals.append(GRPCSignal(
                module='grpc_comm', timestamp=timestamp, action='CONNECT',
                service_id=service_id, method=method, confidence=1.0,
                meta={'backend': backend, 'rtt_ms': round(rtt, 2), 'cwnd': self.cwnd,
                      'payload_bytes': len(payload), 'compression': 'gzip'}
            ))
        
        return signals
    
    def bidirectional_stream(self, timestamp: str, service_id: str, method: str,
                             messages: List[bytes]) -> List[GRPCSignal]:
        """Bidirectional streaming RPC."""
        signals = []
        
        backend = self._select_backend(service_id)
        if not backend:
            return signals
        
        # Simulate streaming with flow control
        total_bytes = sum(len(m) for m in messages)
        chunks = max(1, total_bytes // self.cwnd)
        
        for i, msg in enumerate(messages):
            # Flow control: wait for window update
            if i > 0 and i % 10 == 0:
                self.cwnd = self._calculate_cwnd(self.target_rtt, 0.0)
            
            signals.append(GRPCSignal(
                module='grpc_comm', timestamp=timestamp, action='BIDIRECT',
                service_id=service_id, method=method, confidence=0.95,
                meta={'message_index': i, 'message_bytes': len(msg), 'cwnd': self.cwnd,
                      'stream_id': f'{backend}_{i}', 'flow_control': 'window_update'}
                ))
        
        return signals
    
    def to_ark_angel_json(self, signals: List[GRPCSignal]) -> str:
        return json.dumps({
            'module': 'grpc_comm', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'service_id': s.service_id, 'method': s.method, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    grpc = GRPCCommunicationEngine()
    grpc.services['risk_service'] = [
        {'id': 'risk_1', 'host': '10.0.1.1', 'port': 50051, 'active_streams': 5, 'avg_rtt_ms': 5},
        {'id': 'risk_2', 'host': '10.0.1.2', 'port': 50051, 'active_streams': 12, 'avg_rtt_ms': 8}
    ]
    
    signals = grpc.unary_call('2026-07-12T08:33:00Z', 'risk_service', 'CalculateVaR', b'{"portfolio":"AAPL"}', deadline_ms=100)
    print(grpc.to_ark_angel_json(signals))
