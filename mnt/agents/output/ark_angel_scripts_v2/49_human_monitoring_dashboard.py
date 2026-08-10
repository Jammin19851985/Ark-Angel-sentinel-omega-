#!/usr/bin/env python3
"""
Ark Angel Module: Human Monitoring Dashboard (Suggestion #49)
Mathematical Theory: Telemetry Metric Aggregation + Rolling Window Heartbeats
Core Formula: H(t) = 1 if (t - last_heartbeat) < max_latency else 0
Enhancement: Alert thresholds based on rolling standard deviation + anomaly metrics
"""

import numpy as np
import json
import time
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class DashboardSignal:
    module: str
    timestamp: str
    action: str  # 'HEARTBEAT', 'LATENCY_ALERT', 'METRIC_AGGREGATE', 'NOMINAL'
    metric_name: str
    value: float
    confidence: float
    meta: dict

class HumanMonitoringDashboard:
    """
    Tracks microservices telemetry, processes heartbeats, and detects anomalous
    latencies using running standard deviation bounds.
    """
    
    def __init__(self, latency_threshold_ms: float = 500.0, rolling_window_size: int = 50):
        self.latency_threshold = latency_threshold_ms
        self.rolling_window = rolling_window_size
        self.latencies = []
        self.last_heartbeat_time = time.time()
        
    def log_heartbeat(self, timestamp: str) -> DashboardSignal:
        """Log system heartbeat to maintain alive state."""
        now = time.time()
        elapsed = (now - self.last_heartbeat_time) * 1000.0  # converted to ms
        self.last_heartbeat_time = now
        
        return DashboardSignal(
            module='dashboard_monitor', timestamp=timestamp, action='HEARTBEAT',
            metric_name='heartbeat_interval_ms', value=round(elapsed, 2), confidence=1.0,
            meta={'status': 'alive', 'time_since_last_sec': round(elapsed / 1000.0, 4)}
        )
        
    def process_telemetry(self, timestamp: str, latency_ms: float, error_rate: float) -> List[DashboardSignal]:
        """Main entry point. Ingest telemetry data and output signals."""
        signals = []
        
        # Track latency history
        self.latencies.append(latency_ms)
        if len(self.latencies) > self.rolling_window:
            self.latencies.pop(0)
            
        # Statistical threshold computation
        arr = np.array(self.latencies)
        mean_lat = np.mean(arr)
        std_lat = np.std(arr) if len(arr) > 1 else 0.0
        
        # Check absolute threshold and standard deviation anomaly (z-score)
        z_score = (latency_ms - mean_lat) / (std_lat + 1e-9) if std_lat > 0 else 0.0
        
        if latency_ms > self.latency_threshold:
            signals.append(DashboardSignal(
                module='dashboard_monitor', timestamp=timestamp, action='LATENCY_ALERT',
                metric_name='response_latency_ms', value=latency_ms, confidence=0.95,
                meta={'reason': 'Absolute latency threshold exceeded', 'limit': self.latency_threshold, 'rolling_mean': round(mean_lat, 2)}
            ))
        elif z_score > 3.0:
            signals.append(DashboardSignal(
                module='dashboard_monitor', timestamp=timestamp, action='LATENCY_ALERT',
                metric_name='response_latency_ms', value=latency_ms, confidence=0.9,
                meta={'reason': 'Statistical latency spike (Z > 3)', 'z_score': round(z_score, 2), 'rolling_mean': round(mean_lat, 2)}
            ))
            
        # Error rate alert
        if error_rate > 0.05:
            signals.append(DashboardSignal(
                module='dashboard_monitor', timestamp=timestamp, action='LATENCY_ALERT',
                metric_name='error_rate_pct', value=error_rate * 100.0, confidence=1.0,
                meta={'reason': 'High error rate detected', 'limit_pct': 5.0}
            ))
            
        # Nominal dashboard metric update
        signals.append(DashboardSignal(
            module='dashboard_monitor', timestamp=timestamp, action='METRIC_AGGREGATE',
            metric_name='system_health_index', value=round(100.0 * (1.0 - error_rate), 2), confidence=0.95,
            meta={
                'rolling_mean_latency_ms': round(mean_lat, 2),
                'rolling_std_latency': round(std_lat, 2),
                'error_rate_pct': round(error_rate * 100.0, 2),
                'data_points_analyzed': len(self.latencies)
            }
        ))
        
        return signals

    def to_ark_angel_json(self, signals: List[DashboardSignal]) -> str:
        return json.dumps({
            'module': 'human_dashboard', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'metric_name': s.metric_name, 'value': s.value, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    dashboard = HumanMonitoringDashboard(latency_threshold_ms=100.0)
    # Log some stable latencies
    for _ in range(10):
        dashboard.process_telemetry('2026-07-12T08:00:00Z', 50.0, 0.0)
    # Trigger a spike
    signals = dashboard.process_telemetry('2026-07-12T08:00:10Z', 250.0, 0.01)
    signals.append(dashboard.log_heartbeat('2026-07-12T08:00:11Z'))
    print(dashboard.to_ark_angel_json(signals))
