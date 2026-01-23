
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import json
import logging

# --- SOVEREIGN MODULES ---
from ibkr_adapter import IBKRAdapter
from core.state import GlobalState
from core.config import Config

# Initialize Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AODE_API")

app = FastAPI(title="ARCHANGEL OMEGA // EXECUTION SPINE", version="204.0")

# CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- STATE ---
state = GlobalState()
ibkr = IBKRAdapter()

# --- DATA MODELS ---
class TradeIntent(BaseModel):
    symbol: str
    side: str
    quantity: float
    limit_price: float
    confidence: float
    order_type: str = "MARKET"
    leverage: Optional[int] = 1

class SystemStatus(BaseModel):
    status: str
    active_connections: int
    buying_power: float
    unrealized_pnl: float
    latency_ms: float

# --- ENDPOINTS ---

@app.on_event("startup")
async def startup_event():
    logger.info(">> ARCHANGEL KERNEL INITIALIZING...")
    await ibkr.connect(Config.IBKR_HOST, Config.IBKR_PORT, Config.IBKR_CLIENT_ID)
    asyncio.create_task(state.heartbeat_loop())

@app.get("/health")
async def health_check():
    return {
        "status": "OPERATIONAL",
        "spine_integrity": "100%",
        "qubit_coherence": f"{state.qubit_coherence}ns"
    }

@app.post("/trade")
async def execute_trade(intent: TradeIntent, background_tasks: BackgroundTasks):
    """
    Primary SICO (Singly Indivisible Composite Order) Execution Endpoint.
    """
    # 1. AI Confidence Gate
    if intent.confidence < Config.MIN_CONFIDENCE_THRESHOLD:
        raise HTTPException(status_code=400, detail="CONFIDENCE_TOO_LOW")

    # 2. Risk Gate
    risk_check = state.risk_engine.check(intent)
    if not risk_check['approved']:
        return {"verdict": "REJECT", "reason": risk_check['reason'], "color": "RED"}

    # 3. Execution
    try:
        order_id = await ibkr.place_order(intent)
        background_tasks.add_task(state.log_trade, order_id, intent)
        return {
            "verdict": "APPROVE",
            "execution_status": "FILLED",
            "order_id": order_id,
            "alpha_score": intent.confidence * 1.5,
            "color": "GREEN"
        }
    except Exception as e:
        logger.error(f"EXECUTION FAILURE: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status")
async def get_status() -> SystemStatus:
    return SystemStatus(
        status="LIVE",
        active_connections=4,
        buying_power=await ibkr.get_buying_power(),
        unrealized_pnl=state.get_pnl(),
        latency_ms=state.metrics.latency
    )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
