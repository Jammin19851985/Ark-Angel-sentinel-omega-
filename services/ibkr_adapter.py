# services/ibkr_adapter.py

import asyncio
import logging
from ib_insync import IB, Stock, Trade, util

# Configure logging to catch real-time connection issues
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IBKR_ADAPTER")

class IBKRAdapter:
    def __init__(self, host='127.0.0.1', port=4001, clientId=1):
        self.host = host
        self.port = port
        self.clientId = clientId
        self.ib = IB()
        self.account_info = None

    async def connect(self, mock_mode=False):
        """
        Establishes connection to TWS/Gateway.
        Fix: Removed 'read-only' assumption that caused fetch errors.
        """
        try:
            print(f">> [IBKR] Connecting to {self.host}:{self.port} (Live: {not mock_mode})...")
            # Connect to IBKR (Gateway: 4001, TWS: 7496)
            await self.ib.connectAsync(self.host, self.port, clientId=self.clientId)
            
            # [FIX] Immediate Account Info Verification
            # This ensures the API isn't just 'connected' but has permissions to read data
            self.account_info = await self.fetch_account_summary()
            
            if not self.account_info:
                print(">> [WARNING] Connection active but Account Summary returned empty. Check API permissions.")
                return False

            print(f">> [IBKR] Success. Connected to Account: {self.account_info.get('AccountCode', 'Unknown')}")
            return True
        except Exception as e:
            print(f">> [CRITICAL] IBKR Connection Failed: {str(e)}")
            return False

    async def fetch_account_summary(self):
        """
        Corrects the 'Failed to fetch' error by ensuring a valid request for 
        NetLiquidation and AvailableFunds.
        """
        try:
            summary = await self.ib.accountSummaryAsync()
            data = {item.tag: item.value for item in summary}
            return data
        except Exception as e:
            logger.error(f"Failed to fetch account info: {str(e)}")
            return None

    async def place_order(self, symbol, action, quantity, order_type='MKT'):
        """
        Executes a live trade.
        """
        contract = Stock(symbol, 'SMART', 'USD')
        await self.ib.qualifyContractsAsync(contract)
        
        if order_type == 'MKT':
            from ib_insync import MarketOrder
            order = MarketOrder(action, quantity)
        
        trade = self.ib.placeOrder(contract, order)
        print(f">> [TRADE] {action} {quantity} {symbol} submitted.")
        return trade
