#!/usr/bin/env python3
"""
Ark Angel Module: Physical Math Matrix Engine (Suggestion #48)
Mathematical Theory: Finite Difference Method (FDM) for 2D Heat/Diffusion Equation
Core Formula: u_t = alpha * (u_xx + u_yy)
  - u(x, y, t): heat/temperature field representing market asset state (volatility, density)
  - u_xx, u_yy: second spatial derivatives representing flow diffusion
  - alpha: thermal diffusivity representing market propagation speed
Enhancement: Boundary condition matching + shock wave injection (liquidity spikes)
"""

import numpy as np
import json
from dataclasses import dataclass
from typing import List, Dict, Tuple

@dataclass
class PhysicsSignal:
    module: str
    timestamp: str
    action: str  # 'DIFFUSE', 'SHOCK_INJECT', 'STABLE', 'UNSTABLE'
    grid_mean: float
    entropy: float
    confidence: float
    meta: dict

class PhysicalMathMatrix:
    """
    Simulates physical heat diffusion fields as a proxy for market volatility
    and order book density propagation across prices/dimensions.
    """
    
    def __init__(self, 
                 grid_size: int = 20, 
                 dx: float = 1.0, 
                 dy: float = 1.0, 
                 dt: float = 0.1, 
                 alpha: float = 0.25):
        self.grid_size = grid_size
        self.dx = dx
        self.dy = dy
        self.dt = dt
        self.alpha = alpha
        
        # Stability condition: dt < (dx^2 + dy^2) / (8 * alpha)
        self.stability_limit = (dx**2 + dy**2) / (8 * alpha)
        self.is_stable = dt < self.stability_limit
        
        # Initialize grid with background room temp (ambient market noise)
        self.grid = np.ones((grid_size, grid_size)) * 20.0
        
    def inject_shock(self, x: int, y: int, magnitude: float):
        """Inject a high-temperature volatility shock (e.g., news event, huge block trade)."""
        x_clamped = max(0, min(x, self.grid_size - 1))
        y_clamped = max(0, min(y, self.grid_size - 1))
        self.grid[x_clamped, y_clamped] += magnitude
        
    def step(self, timestamp: str) -> List[PhysicsSignal]:
        """Advance the physics simulation by 1 time step using finite differences."""
        signals = []
        
        if not self.is_stable:
            signals.append(PhysicsSignal(
                module='physical_math', timestamp=timestamp, action='UNSTABLE',
                grid_mean=float(np.mean(self.grid)), entropy=0.0, confidence=0.0,
                meta={'dt': self.dt, 'stability_limit': self.stability_limit, 'reason': 'Courant-Friedrichs-Lewy condition violated'}
            ))
            return signals
            
        # 2D Finite Difference Laplacian computation
        new_grid = self.grid.copy()
        for i in range(1, self.grid_size - 1):
            for j in range(1, self.grid_size - 1):
                u_xx = (self.grid[i+1, j] - 2*self.grid[i, j] + self.grid[i-1, j]) / (self.dx**2)
                u_yy = (self.grid[i, j+1] - 2*self.grid[i, j] + self.grid[i, j-1]) / (self.dy**2)
                new_grid[i, j] = self.grid[i, j] + self.alpha * self.dt * (u_xx + u_yy)
                
        # Enforce Dirichlet boundaries (edges remain cooled/absorbed by outside liquidity)
        new_grid[0, :] = 20.0
        new_grid[-1, :] = 20.0
        new_grid[:, 0] = 20.0
        new_grid[:, -1] = 20.0
        
        # Calculate grid metrics
        self.grid = new_grid
        mean_val = float(np.mean(self.grid))
        
        # Calculate field entropy (variance/spread)
        variance = float(np.var(self.grid))
        entropy = float(np.sum(np.abs(np.gradient(self.grid))))
        
        action = 'DIFFUSE'
        if variance > 10.0:
            action = 'SHOCK_INJECT'
            
        signals.append(PhysicsSignal(
            module='physical_math', timestamp=timestamp, action=action,
            grid_mean=round(mean_val, 4), entropy=round(entropy, 4), confidence=0.95,
            meta={'max_val': round(float(np.max(self.grid)), 4), 'min_val': round(float(np.min(self.grid)), 4), 'variance': round(variance, 4)}
        ))
        
        return signals

    def to_ark_angel_json(self, signals: List[PhysicsSignal]) -> str:
        return json.dumps({
            'module': 'physical_math_matrix', 'version': '2.1',
            'signals': [{'module': s.module, 'timestamp': s.timestamp, 'action': s.action, 'grid_mean': s.grid_mean, 'entropy': s.entropy, 'confidence': s.confidence, 'meta': s.meta} for s in signals]
        }, indent=2)

if __name__ == '__main__':
    engine = PhysicalMathMatrix(grid_size=10, dt=0.05, alpha=0.1)
    # Inject high volatility shock at center
    engine.inject_shock(5, 5, 100.0)
    for t in range(5):
        signals = engine.step(f'2026-07-12T08:00:{t:02d}Z')
        print(f"Time Step {t}: Mean = {signals[0].grid_mean}, Entropy = {signals[0].entropy}")
    print(engine.to_ark_angel_json(signals))
