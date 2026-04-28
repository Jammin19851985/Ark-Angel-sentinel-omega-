import time
import hashlib
import copy

class TemporalSovereigntyLedger:
    def __init__(self):
        self.ledger = []
        self.state_history = []  # Feature #184: State Snapshots
        print("TEMPORAL SOVEREIGNTY LEDGER INITIALIZED.")

    def record_causal_event(self, action, pair, confidence, current_state=None):
        timestamp = time.time()
        # Save snapshot BEFORE event for inversion
        if current_state:
            self.state_history.append({"ts": timestamp, "snapshot": copy.deepcopy(current_state)})
            if len(self.state_history) > 100: self.state_history.pop(0)

        causal_sig = hashlib.sha256(f"{action}{pair}{timestamp}".encode()).hexdigest()[:16]
        event = {
            "causal_signature": causal_sig,
            "t_minus_zero": timestamp,
            "action": action,
            "pair": pair,
            "confidence": confidence,
            "status": "PRE-MANIFESTED"
        }
        self.ledger.append(event)
        return causal_sig

    def trigger_dimension_inversion(self):
        """Feature #184: Temporal Dimension Inversion (The Great Reversal)"""
        if not self.state_history:
            print(">> INVERSION ERROR: NO STATE ANCHORS FOUND.")
            return None
        
        last_anchor = self.state_history.pop()
        print(f">> INVERSION: Reversing thermodynamic arrow to T-Minus {last_anchor['ts']:.2f}")
        return last_anchor['snapshot']

ledger = TemporalSovereigntyLedger()
