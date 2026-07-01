
import asyncio
import random
import logging

# Ensure util.patchAsyncio() is called if ib_insync is available
try:
    from ib_insync import IB, MarketOrder, LimitOrder, Crypto, Stock, Forex, Index, util
    util.patchAsyncio()
    HAS_IB = True
except ImportError:
    HAS_IB = False

logger = logging.getLogger("IBKR_ADAPTER")

class IBKRAdapter:
    def __init__(self):
        self.ib = None
        self.connected = False
        self.is_mock = True
        self.client_id = None
        self.account_id = None

    async def connect(self, host: str, port: int, client_id: int):
        self.client_id = client_id
        logger.info(f"Connecting to IBKR Gateway at {host}:{port} (ID: {client_id})...")
        
        if HAS_IB and self.ib is None:
            try:
                self.ib = IB()
            except Exception as e:
                logger.error(f"Failed to initialize IB instance: {e}")
                self.ib = None

        if not HAS_IB or self.ib is None:
            logger.warning("ib_insync missing or failed to init. Engaging SHADOW_MOCK mode.")

            self.connected = False # Not truly connected to a gateway
            self.is_mock = True
            return

        try:
            # Attempt real connection with 5s timeout
            await asyncio.wait_for(self.ib.connectAsync(host, port, clientId=client_id), timeout=5.0)
            self.connected = True
            self.is_mock = False
            
            # Get account ID
            accounts = self.ib.accounts()
            if accounts:
                self.account_id = accounts[0]
                
            logger.info(f">> IBKR UPLINK ESTABLISHED. Account: {self.account_id}")
        except Exception as e:
            logger.warning(f">> IBKR CONNECTION FAILED: {e}. Engaging SHADOW_MOCK mode.")
            self.connected = False 
            self.is_mock = True
            # Try to disconnect if it was partially connected
            try:
                if self.ib:
                    self.ib.disconnect()
            except:
                pass

    async def get_buying_power(self) -> float:
        if self.is_mock:
            return 125000.00 # Mock buying power
            
        try:
            if not self.ib or not self.ib.isConnected():
                return 0.0
                
            account_summary = await self.ib.accountSummaryAsync()
            for tag in account_summary:
                # TotalCashValue or BuyingPower depending on account type
                if tag.tag in ['TotalCashValue', 'BuyingPower', 'AvailableFunds']:
                    return float(tag.value)
            return 0.0
        except Exception as e:
            logger.error(f"Error fetching buying power: {e}")
            return 0.0

    def _create_contract(self, symbol: str):
        symbol = symbol.upper()
        
        # 1. Forex Detection (e.g., EUR/USD, USD.CAD)
        if '/' in symbol or ('.' in symbol and len(symbol) == 7):
            base, quote = symbol.replace('.', '/').split('/')
            return Forex(f"{base}{quote}")
            
        # 2. Crypto Detection
        crypto_symbols = ['BTC', 'ETH', 'SOL', 'LTC', 'BCH']
        if symbol in crypto_symbols:
            return Crypto(symbol, 'PAXOS', 'USD')
            
        # 3. TSX/Canadian Stocks
        currency = 'USD'
        exchange = 'SMART'
        if symbol.endswith('.TO'):
            symbol = symbol.replace('.TO', '')
            currency = 'CAD'
            exchange = 'TSX'
        elif symbol.endswith('.V'):
            symbol = symbol.replace('.V', '')
            currency = 'CAD'
            exchange = 'VENTURE'
            
        # 4. Indices
        indices = ['SPX', 'NDX', 'VIX']
        if symbol in indices:
            return Index(symbol, 'CBOE' if symbol == 'VIX' else 'CME')
            
        # Default to Stock
        return Stock(symbol, exchange, currency)

    async def place_order(self, intent) -> str:
        # If we are in mock mode, we just simulate
        if self.is_mock:
            logger.info(f"[MOCK_IBKR] Simulating Order: {intent.side} {intent.quantity} {intent.symbol}")
            await asyncio.sleep(0.5) # Simulate network latency
            return f"MOCK_{random.randint(1000, 9999)}"

        if not self.ib or not self.ib.isConnected():
            raise Exception("IBKR_DISCONNECTED")

        try:
            contract = self._create_contract(intent.symbol)
            
            # Qualify contract (fetch details from IBKR)
            qualified_contracts = await self.ib.qualifyContractsAsync(contract)
            if not qualified_contracts:
                raise Exception(f"INVALID_CONTRACT: {intent.symbol}")
            contract = qualified_contracts[0]

            # Order Logic
            if intent.order_type.upper() == "MARKET":
                order = MarketOrder(intent.side.upper(), intent.quantity)
            elif intent.order_type.upper() == "LIMIT":
                order = LimitOrder(intent.side.upper(), intent.quantity, intent.limit_price)
            else:
                # Default to Market for SICO if not specified
                order = MarketOrder(intent.side.upper(), intent.quantity)

            trade = self.ib.placeOrder(contract, order)
            
            # Async wait for fill or rejection
            timeout = 60.0 # Increased timeout for real execution
            start_time = asyncio.get_event_loop().time()
            
            while not trade.isDone():
                if asyncio.get_event_loop().time() - start_time > timeout:
                    # Don't cancel, just report timeout. The order might still fill.
                    logger.warning(f"Order {trade.order.orderId} timed out waiting for fill.")
                    return f"PENDING_{trade.order.orderId}"
                await asyncio.sleep(0.2)
            
            if trade.orderStatus.status == 'Filled':
                logger.info(f">> IBKR_ORDER_FILLED: {intent.symbol} {intent.side} @ {trade.orderStatus.avgFillPrice}")
                return str(trade.order.orderId)
            elif trade.orderStatus.status in ['Cancelled', 'Inactive', 'ApiCancelled']:
                raise Exception(f"ORDER_CANCELLED: {trade.orderStatus.status}")
            else:
                raise Exception(f"ORDER_FAILED: {trade.orderStatus.status}")
                
        except Exception as e:
            logger.error(f"IBKR Execution Error: {e}")
            raise e

    def disconnect(self):
        if self.ib:
            try:
                self.ib.disconnect()
            except:
                pass
        self.connected = False
