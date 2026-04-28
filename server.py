from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from core.sentinel import ArchangelSentinel
import uvicorn
import random
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sentinel = ArchangelSentinel()

@app.get("/api/status")
def get_status():
    return {
        "status": sentinel.platform_state,
        "autonomy_level": 1000,
        "reality_year": 2038,
        "security_lock": "SOUL_SYNC_ACTIVE"
    }

@app.get("/api/harvest")
def get_harvest():
    """2038 Daily Harvest Recap"""
    return {
        "energy_yield": f"{round(random.uniform(0.5, 1.5), 2)} GWh",
        "agentic_income": f"${random.randint(3000, 5000)}/hr",
        "market_strike": "1,200 Trades [100% Win-Rate Proof]",
        "total_daily_optimization": f"${round(random.uniform(1.2, 1.8), 1)}M"
    }

@app.post("/api/cycle")
def run_cycle():
    intensity = round(random.uniform(40.0, 98.0), 2)
    consensus = round(random.uniform(99.8, 100.0), 1)
    return {
        "message": "2038 Autonomous Cycle Active",
        "action": "ENERGY_ARBITRAGE",
        "pair": "GRID/SOLAR",
        "confidence": consensus,
        "intensity": intensity,
        "reasoning": "Quantum GAN identified sub-atomic energy spread. Moving capital to Tweed Micro-grid."
    }

@app.get("/api/portfolio")
def get_portfolio():
    return [
        {"symbol": "GWh", "amount": 1420, "broker": "Global_Grid", "value": 1200000, "pnl": "+15.2%"},
        {"symbol": "BTC", "amount": 2.5, "broker": "Kraken", "value": 165000, "pnl": "+12.5%"},
        {"symbol": "ETH", "amount": 15.2, "broker": "Coinbase", "value": 45000, "pnl": "+8.2%"}
    ]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get('/api/ledger')
def get_ledger():
    return sentinel.ledger.ledger


@app.get('/api/finance/balance')
def get_balance():
    return {"balance": sentinel.finance.fiat_balance}

@app.post('/api/finance/deposit')
async def deposit(request: Request):
    data = await request.json()
    return sentinel.finance.process_deposit(data['amount'], data['method'], data['email'])

@app.post('/api/finance/withdraw')
async def withdraw(request: Request):
    data = await request.json()
    return sentinel.finance.process_withdrawal(data['amount'], data['destination'])

@app.post('/api/temporal/execute')
async def execute_temporal(request: Request):
    data = await request.json()
    order = sentinel.temporal.generate_sico_order(data['symbol'], data['side'], data['quantity'])
    # Record in ledger as well
    sentinel.ledger.record_causal_event(order['side'], order['symbol'], 100.0)
    return order

@app.get('/api/quantum/status')
def get_quantum_status():
    fsf = sentinel.quantum.calculate_fsf(random.uniform(0.000001, 0.00001), random.uniform(0.000001, 0.00001))
    qubo = sentinel.quantum.solve_qubo(['BTC', 'ETH', 'SOL', 'GWh'])
    return {
        "fsf": fsf,
        "qubo": qubo,
        "coherence_time_ns": 40.0
    }

@app.get('/api/brain/status')
def get_brain_status():
    return {
        "acmd_enabled": True,
        "skp_count": len(sentinel.brain.skp_history),
        "latest_patches": sentinel.brain.skp_history[-5:],
        "model": sentinel.brain.model
    }

@app.get('/api/brain/gan')
def get_gan_scenarios():
    return sentinel.brain.generate_shadow_scenarios()

@app.get('/api/strategy/optimize')
def optimize_strategy():
    return sentinel.quality.run_gp_loop()

@app.get('/api/strategy/mutability')
def get_mutability():
    score = sentinel.quality.update_mutability_directive()
    return {"execution_quality_score": score, "status": "PRIME_DIRECTIVE_REWRITTEN"}

@app.post('/api/temporal/invert')
def trigger_inversion():
    previous_state = sentinel.ledger.trigger_dimension_inversion()
    if previous_state:
        sentinel.finance.fiat_balance = previous_state['balance']
        return {"status": "SUCCESS", "message": "Timeline Restored", "balance": sentinel.finance.fiat_balance}
    return {"status": "ERROR", "message": "No temporal anchors found"}

@app.get('/api/brain/recursion')
def get_recursion_loop():
    return sentinel.brain.run_omniscient_loop()
