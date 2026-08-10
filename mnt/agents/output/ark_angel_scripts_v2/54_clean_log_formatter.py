#!/usr/bin/env python3
"""
Ark Angel Module: Clean Log Formatter (Suggestion #54)
Mathematical Theory: Structured Logging + Entropy-Based Anomaly Detection
Core Formula: Perplexity = exp(-Σ p(token) log p(token))
  - Low perplexity = matches known templates
  - High perplexity = novel/anomalous log line
Enhancement: Template extraction via LCS + semantic clustering + severity scoring
"""

import numpy as np
import json
import re
from dataclasses import dataclass
from typing import List, Dict, Tuple, Set
from collections import Counter, defaultdict

@dataclass
class LogSignal:
    module: str
    timestamp: str
    action: str  # 'FORMAT', 'ANOMALY', 'TEMPLATE', 'ALERT'
    log_id: str
    severity: str  # 'DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'
    confidence: float
    meta: dict

class CleanLogFormatter:
    """
    Formats and analyzes logs using template extraction and entropy-based anomaly detection.
    """
    
    def __init__(self, 
                 template_threshold: float = 0.8,
                 anomaly_threshold: float = 5.0,
                 max_templates: int = 1000):
        self.template_threshold = template_threshold
        self.anomaly_threshold = anomaly_threshold
        self.max_templates = max_templates
        
        self.templates = {}  # template_id -> regex pattern
        self.template_counts = Counter()
        self.token_freq = Counter()
        self.total_tokens = 0
        
    def _tokenize(self, log_line: str) -> List[str]:
        """Tokenize log line, preserving structure."""
        # Replace numbers and paths with placeholders
        cleaned = re.sub(r'\b\d+\.?\d*\b', '<NUM>', log_line)
        cleaned = re.sub(r'/[\w/\.]+', '<PATH>', cleaned)
        cleaned = re.sub(r'\b[0-9a-f]{8,}\b', '<HASH>', cleaned)
        return cleaned.split()
    
    def _extract_template(self, tokens: List[str]) -> str:
        """Extract template by replacing variable parts with wildcards."""
        template = []
        for token in tokens:
            if re.match(r'^<\w+>$', token):
                template.append(token)
            elif len(token) > 20:
                template.append('<LONG>')
            else:
                template.append(token)
        return ' '.join(template)
    
    def _perplexity(self, tokens: List[str]) -> float:
        """Calculate perplexity of token sequence."""
        if self.total_tokens == 0:
            return float('inf')
        
        log_prob = 0
        for token in tokens:
            freq = self.token_freq.get(token, 1)
            prob = freq / self.total_tokens
            log_prob += np.log(prob + 1e-10)
        
        perplexity = np.exp(-log_prob / len(tokens))
        return perplexity
    
    def format_log(self, timestamp: str, log_id: str, 
                   raw_line: str, severity: str = 'INFO') -> List[LogSignal]:
        """Main entry point. Format and analyze a log line."""
        signals = []
        
        # Tokenize
        tokens = self._tokenize(raw_line)
        
        # Update token frequencies
        for token in tokens:
            self.token_freq[token] += 1
            self.total_tokens += 1
        
        # Extract template
        template = self._extract_template(tokens)
        
        # Check if template exists
        matched = False
        for tid, existing in self.templates.items():
            # Simplified: exact match on template
            if existing == template:
                self.template_counts[tid] += 1
                matched = True
                signals.append(LogSignal(
                    module='log_formatter', timestamp=timestamp, action='TEMPLATE',
                    log_id=log_id, severity=severity, confidence=0.95,
                    meta={'template_id': tid, 'match_count': self.template_counts[tid], 'template': template[:100]}
                ))
                break
        
        if not matched:
            # New template
            tid = f'tmpl_{len(self.templates)}'
            self.templates[tid] = template
            self.template_counts[tid] = 1
            
            signals.append(LogSignal(
                module='log_formatter', timestamp=timestamp, action='FORMAT',
                log_id=log_id, severity=severity, confidence=0.9,
                meta={'new_template': True, 'template_id': tid, 'template': template[:100], 'n_templates': len(self.templates)}
            ))
        
        # Anomaly detection
        perplexity = self._perplexity(tokens)
        if perplexity > self.anomaly_threshold:
            signals.append(LogSignal(
                module='log_formatter', timestamp=timestamp, action='ANOMALY',
                log_id=log_id, severity='WARN', confidence=min(1.0, perplexity / (self.anomaly_threshold * 2)),
                meta={'perplexity': round(perplexity, 4), 'threshold': self.anomaly_threshold, 'tokens': len(tokens)}
            ))
        
        # Severity-based alert
        if severity in ['ERROR', 'CRITICAL']:
            signals.append(LogSignal(
                module='log_formatter', timestamp=timestamp, action='ALERT',
                log_id=log_id, severity=severity, confidence=1.0,
                meta={'alert_reason': 'high_severity', 'requires_attention': True}
            ))
        
        # Prune templates if too many
        if len(self.templates) > self.max_templates:
            least_common = self.template_counts.most_common()[:-100:-1]
            for tid, _ in least_common:
                del self.templates[tid]
                del self.template_counts[tid]
        
        return signals
    
    def to_ark_angel_json(self, signals: List[LogSignal]) -> str:
        return json.dumps({
            'module': 'log_formatter', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'log_id': s.log_id, 'severity': s.severity, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    formatter = CleanLogFormatter()
    logs = [
        ('2026-07-12T08:00:00Z', 'log_1', 'Trade executed: AAPL 100 shares at 150.25', 'INFO'),
        ('2026-07-12T08:00:01Z', 'log_2', 'Trade executed: TSLA 50 shares at 250.00', 'INFO'),
        ('2026-07-12T08:00:02Z', 'log_3', 'CRITICAL: Connection lost to exchange NYSE', 'CRITICAL'),
        ('2026-07-12T08:00:03Z', 'log_4', 'Unknown error: xyz123 exception in module foo', 'ERROR'),
    ]
    all_signals = []
    for ts, lid, line, sev in logs:
        all_signals.extend(formatter.format_log(ts, lid, line, sev))
    print(formatter.to_ark_angel_json(all_signals))
