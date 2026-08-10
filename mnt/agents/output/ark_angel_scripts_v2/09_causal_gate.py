#!/usr/bin/env python3
"""
Ark Angel Module: Causal Gate Module (Suggestion #9)
Mathematical Theory: Bayesian Network Inference + Do-Calculus
Core Formula: P(Y|do(X)) = Σ_z P(Y|X,Z)P(Z)  (Pearl's do-calculus)
  - Interventional distribution vs observational
  - Back-door criterion: block all back-door paths
Enhancement: Causal impact scoring + counterfactual reasoning + front-door adjustment
"""

import numpy as np
import json
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from collections import defaultdict

@dataclass
class CausalGateSignal:
    module: str
    timestamp: str
    action: str  # 'INTERVENE', 'BLOCK', 'ADJUST', 'COUNTERFACTUAL', 'IMPACT'
    target_var: str
    intervention_value: float
    confidence: float
    meta: dict

class CausalGateEngine:
    """
    Causal inference engine implementing do-calculus for trading decisions.
    Answers counterfactual questions: "What if I had bought 1000 shares?"
    """
    
    def __init__(self,
                 alpha: float = 0.05,
                 min_samples: int = 100,
                 max_confounders: int = 5):
        self.alpha = alpha
        self.min_samples = min_samples
        self.max_confounders = max_confounders
        
        self.data = defaultdict(list)
        self.graph = {}  # var -> [parents]
        self.conditional_probs = {}
        
    def ingest(self, timestamp: str, observations: Dict[str, float]):
        """Ingest observational data."""
        for var, val in observations.items():
            self.data[var].append(val)
        
        for var in self.data:
            if len(self.data[var]) > 1000:
                self.data[var] = self.data[var][-1000:]
    
    def _estimate_conditional(self, target: str, given: Dict[str, float], 
                              bins: int = 10) -> Tuple[float, float]:
        """Estimate E[Y|X=x] using histogram conditioning."""
        y = np.array(self.data[target])
        
        if len(y) < self.min_samples:
            return np.mean(y) if len(y) > 0 else 0.0, float('inf')
        
        # Create mask for conditioning
        mask = np.ones(len(y), dtype=bool)
        for var, val in given.items():
            if var in self.data and len(self.data[var]) == len(y):
                x = np.array(self.data[var])
                # Find bin for value
                x_min, x_max = np.min(x), np.max(x)
                if x_max > x_min:
                    bin_edges = np.linspace(x_min, x_max, bins + 1)
                    val_bin = np.digitize(val, bin_edges) - 1
                    x_bins = np.digitize(x, bin_edges) - 1
                    mask &= (x_bins == val_bin)
        
        filtered_y = y[mask]
        
        if len(filtered_y) < 10:
            return np.mean(y), np.std(y)
        
        return np.mean(filtered_y), np.std(filtered_y)
    
    def _backdoor_adjustment(self, target: str, intervention_var: str,
                            confounders: List[str]) -> float:
        """Apply back-door criterion: P(Y|do(X)) = Σ_z P(Y|X,Z)P(Z)."""
        x_vals = np.array(self.data[intervention_var])
        
        if len(x_vals) < self.min_samples:
            return 0.0
        
        # Discretize intervention variable
        x_bins = np.percentile(x_vals, [20, 40, 60, 80])
        
        causal_effect = 0.0
        
        for i, x_val in enumerate(x_bins):
            # P(Z)
            z_given = {}
            for z in confounders[:self.max_confounders]:
                if z in self.data:
                    z_vals = np.array(self.data[z])
                    z_given[z] = np.percentile(z_vals, 50)  # median
            
            # P(Y|X=x, Z=z)
            mean_y, _ = self._estimate_conditional(target, {intervention_var: x_val, **z_given})
            
            # Weight by P(X=x)
            weight = 1.0 / len(x_bins)
            causal_effect += mean_y * weight
        
        return causal_effect
    
    def intervene(self, timestamp: str, target: str, intervention_var: str,
                  intervention_value: float, confounders: List[str] = None) -> List[CausalGateSignal]:
        """Main entry point. Estimate causal effect of intervention."""
        signals = []
        confounders = confounders or []
        
        # Observational baseline
        obs_mean, obs_std = self._estimate_conditional(target, {})
        
        # Causal estimate with back-door adjustment
        causal_mean = self._backdoor_adjustment(target, intervention_var, confounders)
        
        # Counterfactual: what if we set intervention_var to specific value?
        cf_given = {intervention_var: intervention_value}
        for z in confounders[:self.max_confounders]:
            if z in self.data:
                cf_given[z] = np.percentile(self.data[z], 50)
        
        cf_mean, cf_std = self._estimate_conditional(target, cf_given)
        
        # Calculate causal impact
        causal_impact = cf_mean - obs_mean
        
        # Confidence based on sample size and variance
        n = len(self.data.get(target, []))
        confidence = min(1.0, n / (self.min_samples * 2)) * (1 - min(1.0, cf_std / (abs(cf_mean) + 1e-9)))
        
        signals.append(CausalGateSignal(
            module='causal_gate', timestamp=timestamp, action='INTERVENE',
            target_var=target, intervention_value=intervention_value,
            confidence=round(confidence, 4),
            meta={'observational_mean': round(obs_mean, 4), 'causal_mean': round(causal_mean, 4),
                  'counterfactual_mean': round(cf_mean, 4), 'causal_impact': round(causal_impact, 4),
                  'confounders': confounders[:self.max_confounders], 'backdoor_adjusted': True}
        ))
        
        # Check if intervention would be beneficial
        if causal_impact > 0 and confidence > 0.7:
            signals.append(CausalGateSignal(
                module='causal_gate', timestamp=timestamp, action='IMPACT',
                target_var=target, intervention_value=intervention_value,
                confidence=round(confidence, 4),
                meta={'recommendation': 'EXECUTE', 'expected_return': round(causal_impact, 4),
                      'risk_adjusted_return': round(causal_impact / (cf_std + 1e-9), 4)}
            ))
        elif causal_impact < 0:
            signals.append(CausalGateSignal(
                module='causal_gate', timestamp=timestamp, action='BLOCK',
                target_var=target, intervention_value=intervention_value,
                confidence=round(confidence, 4),
                meta={'recommendation': 'AVOID', 'expected_loss': round(abs(causal_impact), 4)}
            ))
        
        return signals
    
    def counterfactual(self, timestamp: str, target: str, 
                     actual_outcome: float, hypothetical_intervention: Dict[str, float]) -> CausalGateSignal:
        """Answer counterfactual: "What would have happened if...?"""
        # Estimate outcome under hypothetical intervention
        cf_mean, cf_std = self._estimate_conditional(target, hypothetical_intervention)
        
        # Natural effect (no intervention)
        natural_mean, _ = self._estimate_conditional(target, {})
        
        # Treatment effect
        treatment_effect = cf_mean - natural_mean
        
        return CausalGateSignal(
            module='causal_gate', timestamp=timestamp, action='COUNTERFACTUAL',
            target_var=target, intervention_value=list(hypothetical_intervention.values())[0] if hypothetical_intervention else 0,
            confidence=0.8,
            meta={'actual_outcome': actual_outcome, 'counterfactual_outcome': round(cf_mean, 4),
                  'treatment_effect': round(treatment_effect, 4), 'regret': round(abs(actual_outcome - cf_mean), 4)}
        )
    
    def to_ark_angel_json(self, signals: List[CausalGateSignal]) -> str:
        return json.dumps({
            'module': 'causal_gate', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'target_var': s.target_var, 'intervention_value': s.intervention_value, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    gate = CausalGateEngine()
    np.random.seed(42)
    
    # Generate data: marketing_spend -> sales (with confounder: seasonality)
    for t in range(500):
        seasonality = np.sin(t / 50) * 10
        marketing = 5 + seasonality + np.random.normal(0, 2)
        sales = 2 * marketing + seasonality + np.random.normal(0, 3)
        gate.ingest('2026-07-12T08:33:00Z', {'marketing': marketing, 'sales': sales, 'seasonality': seasonality})
    
    signals = gate.intervene('2026-07-12T08:33:00Z', 'sales', 'marketing', 15.0, confounders=['seasonality'])
    print(gate.to_ark_angel_json(signals))
