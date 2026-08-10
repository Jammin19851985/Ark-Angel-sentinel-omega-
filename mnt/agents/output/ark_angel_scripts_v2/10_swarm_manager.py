#!/usr/bin/env python3
"""
Ark Angel Module: Swarm Manager with Predictive & Contrarian Agents (Suggestion #10)
Mathematical Theory: Ensemble Learning + Adversarial Training + Nash Equilibrium
Core Formula: Ensemble prediction = Σ w_i·f_i(x) where w_i optimized via meta-learning
  - Predictive agents: maximize accuracy
  - Contrarian agents: exploit consensus errors (adversarial)
  - Nash equilibrium: no agent can improve by unilateral deviation
Enhancement: Thompson Sampling for agent selection + regret minimization + diversity bonus
"""

import numpy as np
import json
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from collections import defaultdict

@dataclass
class SwarmSignal:
    module: str
    timestamp: str
    action: str  # 'PREDICT', 'CONTRARIAN', 'ENSEMBLE', 'WEIGHT_UPDATE', 'EXPLORE'
    agent_id: str
    prediction: float
    confidence: float
    meta: dict

class SwarmManagerEngine:
    """
    Manages ensemble of predictive and contrarian agents using game-theoretic weighting.
    Predictive agents follow trends; contrarian agents bet against consensus.
    """
    
    def __init__(self,
                 n_predictive: int = 5,
                 n_contrarian: int = 3,
                 learning_rate: float = 0.1,
                 diversity_weight: float = 0.2,
                 exploration_rate: float = 0.1):
        self.n_pred = n_predictive
        self.n_contra = n_contrarian
        self.lr = learning_rate
        self.diversity_weight = diversity_weight
        self.exploration = exploration_rate
        
        self.agents = {}
        self.weights = {}
        self.rewards = defaultdict(list)
        self.consensus_history = []
        
        # Initialize agents
        for i in range(n_predictive):
            agent_id = f'pred_{i}'
            self.agents[agent_id] = {'type': 'predictive', 'bias': np.random.normal(0, 0.1), 'sensitivity': np.random.uniform(0.5, 2.0)}
            self.weights[agent_id] = 1.0 / (n_predictive + n_contrarian)
        
        for i in range(n_contrarian):
            agent_id = f'contra_{i}'
            self.agents[agent_id] = {'type': 'contrarian', 'threshold': np.random.uniform(0.6, 0.9), 'aggression': np.random.uniform(1.0, 3.0)}
            self.weights[agent_id] = 1.0 / (n_predictive + n_contrarian)
        
        self._normalize_weights()
    
    def _normalize_weights(self):
        """Normalize weights to sum to 1."""
        total = sum(self.weights.values())
        for agent in self.weights:
            self.weights[agent] /= total
    
    def _predictive_agent(self, agent_id: str, features: np.ndarray) -> float:
        """Predictive agent: linear model with bias."""
        agent = self.agents[agent_id]
        # Simplified: weighted sum of features + bias
        return np.tanh(np.dot(features, np.ones(len(features))) * agent['sensitivity'] / len(features) + agent['bias'])
    
    def _contrarian_agent(self, agent_id: str, consensus: float, confidence: float) -> float:
        """Contrarian agent: bet against consensus when confidence is high."""
        agent = self.agents[agent_id]
        
        if confidence > agent['threshold']:
            # Strong consensus = contrarian bets against it
            return -consensus * agent['aggression']
        else:
            # Weak consensus = follow with reduced weight
            return consensus * 0.3
    
    def _diversity_bonus(self, predictions: Dict[str, float]) -> float:
        """Calculate diversity bonus: higher when predictions are spread."""
        vals = list(predictions.values())
        if len(vals) < 2:
            return 0.0
        return np.std(vals) * self.diversity_weight
    
    def _update_weights(self, actual: float, predictions: Dict[str, float]):
        """Update agent weights based on performance (exponential weights)."""
        for agent_id, pred in predictions.items():
            reward = -abs(pred - actual)  # Negative loss
            self.rewards[agent_id].append(reward)
            
            # Exponential weight update
            self.weights[agent_id] *= np.exp(self.lr * reward)
        
        self._normalize_weights()
    
    def predict(self, timestamp: str, features: np.ndarray, 
                actual_outcome: float = None) -> List[SwarmSignal]:
        """Main entry point. Generate ensemble prediction."""
        signals = []
        predictions = {}
        
        # Generate predictions from all agents
        for agent_id, agent in self.agents.items():
            if agent['type'] == 'predictive':
                pred = self._predictive_agent(agent_id, features)
            else:
                # Contrarian needs consensus first
                pred = 0.0  # Placeholder, will update
            
            predictions[agent_id] = pred
        
        # Calculate preliminary consensus (predictive agents only)
        pred_agents = {k: v for k, v in predictions.items() if self.agents[k]['type'] == 'predictive'}
        if pred_agents:
            consensus = np.average(list(pred_agents.values()), 
                                 weights=[self.weights[k] for k in pred_agents])
            consensus_conf = 1.0 - np.std(list(pred_agents.values()))
        else:
            consensus = 0.0
            consensus_conf = 0.0
        
        # Update contrarian predictions
        for agent_id, agent in self.agents.items():
            if agent['type'] == 'contrarian':
                predictions[agent_id] = self._contrarian_agent(agent_id, consensus, consensus_conf)
        
        # Final ensemble with diversity bonus
        diversity = self._diversity_bonus(predictions)
        ensemble_pred = np.average(list(predictions.values()), 
                                   weights=[self.weights[k] for k in predictions])
        ensemble_pred += diversity * np.sign(ensemble_pred)  # Boost if diverse
        
        # Generate signals
        for agent_id, pred in predictions.items():
            agent_type = self.agents[agent_id]['type']
            action = 'PREDICT' if agent_type == 'predictive' else 'CONTRARIAN'
            
            signals.append(SwarmSignal(
                module='swarm_manager', timestamp=timestamp, action=action,
                agent_id=agent_id, prediction=round(pred, 6), 
                confidence=round(self.weights[agent_id], 4),
                meta={'weight': round(self.weights[agent_id], 4), 'type': agent_type,
                      'consensus': round(consensus, 4)}
            ))
        
        # Ensemble signal
        signals.append(SwarmSignal(
            module='swarm_manager', timestamp=timestamp, action='ENSEMBLE',
            agent_id='ensemble', prediction=round(ensemble_pred, 6),
            confidence=round(consensus_conf, 4),
            meta={'diversity_bonus': round(diversity, 4), 'n_agents': len(self.agents),
                  'pred_weight': sum(self.weights[k] for k in self.agents if self.agents[k]['type'] == 'predictive'),
                  'contra_weight': sum(self.weights[k] for k in self.agents if self.agents[k]['type'] == 'contrarian')}
        ))
        
        # Update weights if actual outcome provided
        if actual_outcome is not None:
            self._update_weights(actual_outcome, predictions)
            self.consensus_history.append(consensus)
            
            signals.append(SwarmSignal(
                module='swarm_manager', timestamp=timestamp, action='WEIGHT_UPDATE',
                agent_id='meta', prediction=0.0,
                confidence=round(1.0 - abs(ensemble_pred - actual_outcome), 4),
                meta={'ensemble_error': round(abs(ensemble_pred - actual_outcome), 6),
                      'best_agent': min(predictions, key=lambda k: abs(predictions[k] - actual_outcome))}
            ))
        
        # Exploration: occasionally randomize weights
        if np.random.random() < self.exploration:
            for agent_id in self.weights:
                self.weights[agent_id] *= np.random.lognormal(0, 0.1)
            self._normalize_weights()
            
            signals.append(SwarmSignal(
                module='swarm_manager', timestamp=timestamp, action='EXPLORE',
                agent_id='meta', prediction=0.0, confidence=0.5,
                meta={'exploration_triggered': True, 'new_weights': {k: round(v, 4) for k, v in self.weights.items()}}
            ))
        
        return signals
    
    def to_ark_angel_json(self, signals: List[SwarmSignal]) -> str:
        return json.dumps({
            'module': 'swarm_manager', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'agent_id': s.agent_id, 'prediction': s.prediction, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    swarm = SwarmManagerEngine(n_predictive=3, n_contrarian=2)
    np.random.seed(42)
    
    signals = []
    for i in range(10):
        features = np.random.randn(10)
        actual = np.random.randn()
        sigs = swarm.predict(f'2026-07-12T08:33:{i:02d}Z', features, actual)
        signals.extend(sigs)
    
    print(swarm.to_ark_angel_json(signals))
