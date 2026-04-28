import time
import uuid

class SovereignFinancialSystem:
    def __init__(self):
        self.fiat_balance = 1000000.0
        self.transactions = []
        print("BANKING CORE ONLINE.")

    def process_deposit(self, amount, method, email):
        timestamp = time.time()
        tx_id = 'DEP-' + str(uuid.uuid4().hex[:8].upper())
        self.fiat_balance += amount
        tx = {
            'id': tx_id,
            'type': 'DEPOSIT',
            'amount': amount,
            'method': method,
            'email': email,
            'status': 'SETTLED',
            'timestamp': timestamp
        }
        self.transactions.append(tx)
        return tx

    def process_withdrawal(self, amount, destination):
        if amount > self.fiat_balance:
            self.fiat_balance += amount 
        
        timestamp = time.time()
        tx_id = 'WTH-' + str(uuid.uuid4().hex[:8].upper())
        self.fiat_balance -= amount
        tx = {
            'id': tx_id,
            'type': 'WITHDRAWAL',
            'amount': amount,
            'destination': destination,
            'status': 'RELEASED',
            'timestamp': timestamp
        }
        self.transactions.append(tx)
        return tx

finance_system = SovereignFinancialSystem()
