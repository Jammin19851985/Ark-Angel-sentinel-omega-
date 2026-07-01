#!/usr/bin/env python3
import os
import sys
import stat
import asyncio
import logging
import json
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict

# Ensure terminal output remains completely flat and clean
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

@dataclass
class MarketSignal:
    venue: str
    symbol: str
    bid_price: float
    ask_price: float
    bid_size: float
    ask_size: float
    micro_price: float
    order_book_imbalance: float
    timestamp: float

@dataclass
class ScalpOrder:
    order_id: str
    symbol: str
    venue: str
    side: str
    price: float
    quantity: float
    strategy_type: str
    timestamp: float

class ArchangelScalpingEngine:
    def __init__(self):
        self.active_positions: Dict[str, float] = {}
        self.execution_metrics: Dict[str, List[float]] = {"latency": [], "pnl": []}
        self.is_running: bool = False
        self.imbalance_threshold: float = 0.65
        self.min_spread_ticks: float = 0.0002
        
    async def initialize_engine(self) -> None:
        logging.info("Initializing Archangel Scalping Matrix and Dark Pool Sync Interface")
        self.is_running = True
        
    def calculate_micro_structure(self, bid: float, ask: float, bid_sz: float, ask_sz: float) -> tuple:
        total_sz = bid_sz + ask_sz
        if total_sz == 0:
            return float(bid + ask) / 2.0, 0.0
        
        imbalance = float(bid_sz - ask_sz) / float(total_sz)
        micro_price = float(bid * ask_sz + ask * bid_sz) / float(total_sz)
        return micro_price, imbalance

    async def evaluate_order_book_imbalance(self, signal: MarketSignal) -> Optional[ScalpOrder]:
        if abs(signal.order_book_imbalance) > self.imbalance_threshold:
            side = "BUY" if signal.order_book_imbalance > 0 else "SELL"
            price = signal.bid_price if side == "BUY" else signal.ask_price
            
            # Prevent over-exposure in a single asset direction
            current_pos = self.active_positions.get(signal.symbol, 0.0)
            if side == "BUY" and current_pos >= 1.0:
                return None
            if side == "SELL" and current_pos <= -1.0:
                return None

            return ScalpOrder(
                order_id=f"SCALP_{int(time.time() * 1000)}",
                symbol=signal.symbol,
                venue=signal.venue,
                side=side,
                price=price,
                quantity=0.1,
                strategy_type="BOOK_IMBALANCE",
                timestamp=time.time()
            )
        return None

    async def evaluate_spread_scalp(self, signal: MarketSignal) -> Optional[ScalpOrder]:
        spread = float(signal.ask_price - signal.bid_price)
        if spread >= self.min_spread_ticks and signal.ask_size > 0 and signal.bid_size > 0:
            # Check if liquidity is drying up on one side to front-run minor shifts
            if signal.ask_size < signal.bid_size * 0.3:
                return ScalpOrder(
                    order_id=f"SCALP_{int(time.time() * 1000)}",
                    symbol=signal.symbol,
                    venue=signal.venue,
                    side="BUY",
                    price=signal.bid_price + 0.0001,
                    quantity=0.1,
                    strategy_type="SPREAD_COMPRESSION",
                    timestamp=time.time()
                )
        return None

    async def execute_scalp(self, order: ScalpOrder) -> None:
        start_time = time.time()
        # Direct simulation of internal pipeline execution
        await asyncio.sleep(0.002) 
        latency = (time.time() - start_time) * 1000
        
        # Update internal ledger positions securely
        position_change = order.quantity if order.side == "BUY" else -order.quantity
        self.active_positions[order.symbol] = self.active_positions.get(order.symbol, 0.0) + position_change
        
        self.execution_metrics["latency"].append(latency)
        logging.info(f"Execution Confirmation: {order.order_id} - {order.strategy_type} - {order.side} {order.symbol} via {order.venue} at price {order.price} - Latency: {latency:.2f}ms")

    async def run_pipeline_loop(self) -> None:
        # High-frequency operational simulation matrix
        symbols = ["BTCUSD", "ETHUSD"]
        venues = ["DARK_POOL_01", "LIT_VENUE_02"]
        
        tick_counter = 0
        while self.is_running and tick_counter < 10:
            for symbol in symbols:
                for venue in venues:
                    # Alternating matrix logic to test both strategies
                    if tick_counter % 2 == 0:
                        bid, ask, b_sz, a_sz = 65000.0, 65000.5, 12.5, 2.1
                    else:
                        bid, ask, b_sz, a_sz = 65000.0, 65002.0, 1.0, 5.0

                    micro_p, imbalance = self.calculate_micro_structure(bid, ask, b_sz, a_sz)
                    
                    signal = MarketSignal(
                        venue=venue,
                        symbol=symbol,
                        bid_price=bid,
                        ask_price=ask,
                        bid_size=b_sz,
                        ask_size=a_sz,
                        micro_price=micro_p,
                        order_book_imbalance=imbalance,
                        timestamp=time.time()
                    )

                    # Strategy Layer 1: Book Imbalance Momentum
                    order = await self.evaluate_order_book_imbalance(signal)
                    if order:
                        await self.execute_scalp(order)
                        
                    # Strategy Layer 2: Spread Compression Exploitation
                    order_spread = await self.evaluate_spread_scalp(signal)
                    if order_spread:
                        await self.execute_scalp(order_spread)

            tick_counter += 1
            await asyncio.sleep(0.01)

    def print_final_state(self) -> None:
        print("\n=== SYSTEM EXECUTION PROFILE ===")
        print(f"Active Positions: {json.dumps(self.active_positions)}")
        if self.execution_metrics["latency"]:
            avg_lat = sum(self.execution_metrics["latency"]) / len(self.execution_metrics["latency"])
            print(f"Average Exec Latency: {avg_lat:.3f} ms")
        print("================================")

async def main():
    engine = ArchangelScalpingEngine()
    await engine.initialize_engine()
    await engine.run_pipeline_loop()
    engine.print_final_state()

if __name__ == "__main__":
    # Self-executing setup logic for background daemonization
    script_path = os.path.abspath(__file__)
    st = os.stat(script_path)
    os.chmod(script_path, st.st_mode | stat.S_IEXEC)
    
    asyncio.run(main())
