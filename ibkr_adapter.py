
import asyncio
from ib_insync import *
import logging

logger = logging.getLogger("IBKR_ADAPTER")

class IBKRAdapter:
    def __init__(self):
        self.ib = IB()
        self.connected = False
        self.client_id = None

    async def connect(self, host: str, port: int, client_id: int):
        logger.info(f"Connecting to IBKR Gateway at {host}:{port} (ID: {client_id})...")
        try:
            await self.ib.connectAsync(host, port, clientId=client_id)
            self.connected = True
            self.client_id = client_id
            logger.info(">> IBKR UPLINK ESTABLISHED.")
        except Exception as e:
            logger.error(f">> IBKR CONNECTION FAILED: {e}")
            self.connected = False

    async def get_buying_power(self) -> float:
        if not self.connected:
            return 0.0
        try:
            account_summary = await self.ib.accountSummaryAsync()
            for tag in account_summary:
                if tag.tag == 'TotalCashValue':
                    return float(tag.value)
            return 0.0
        except:
            return 0.0

    async def place_order(self, intent) -> str:
        if not self.connected:
            raise Exception("IBKR_OFFLINE")

        contract = Crypto(intent.symbol, 'PAXOS', 'USD') if intent.symbol in ['BTC', 'ETH'] else Stock(intent.symbol, 'SMART', 'USD')
        
        # SICO Logic: If confidence is high, use Market for speed. Else Limit.
        if intent.order_type == "MARKET":
            order = MarketOrder(intent.side.upper(), intent.quantity)
        else:
            order = LimitOrder(intent.side.upper(), intent.quantity, intent.limit_price)

        trade = self.ib.placeOrder(contract, order)
        
        # Async wait for fill
        while not trade.isDone():
            await asyncio.sleep(0.01) # 10ms poll
        
        if trade.orderStatus.status == 'Filled':
            return str(trade.order.orderId)
        else:
            raise Exception(f"Order failed: {trade.orderStatus.status}")

    def disconnect(self):
        self.ib.disconnect()
        self.connected = False
