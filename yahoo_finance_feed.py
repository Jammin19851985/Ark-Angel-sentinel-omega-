#!/usr/bin/env python3
"""
Module: yahoo_finance_feed.py
Author: Jack
Target: Ark
Description: Independent Yahoo Finance data ingestion module with automatic 
             file execution permissions setup.
"""

import os
import sys
import stat
import json
import urllib.request
import urllib.error

# Automatically enforce execution permissions (+x)
def ensure_executable():
    script_path = os.path.abspath(__file__)
    try:
        current_mode = os.stat(script_path).st_mode
        executable_mode = current_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH
        if current_mode != executable_mode:
            os.chmod(script_path, executable_mode)
            print(f"[+] Execution permission granted: {script_path}")
    except Exception as e:
        print(f"[-] Warning: Could not adjust permissions: {e}")

ensure_executable()


class YahooFinanceFeed:
    """Handles market data polling and formatting for Archangel watchlist."""
    
    DEFAULT_WATCHLIST = ["^GSPTSE", "AAPL", "MSFT", "GOOGL", "BTC-USD"]

    def __init__(self, watchlist=None):
        self.watchlist = watchlist or self.DEFAULT_WATCHLIST
        self.base_url = "https://query1.finance.yahoo.com/v8/finance/chart/"

    def fetch_quote(self, symbol: str) -> dict:
        """Fetch current quote and status for a given symbol."""
        url = f"{self.base_url}{symbol}?interval=1m&range=1d"
        req = urllib.request.Request(
            url, 
            headers={"User-Agent": "Mozilla/5.0 (Archangel/1.0)"}
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode("utf-8"))
                result = data["chart"]["result"][0]
                meta = result["meta"]
                
                return {
                    "symbol": symbol,
                    "price": meta.get("regularMarketPrice"),
                    "currency": meta.get("currency"),
                    "exchange": meta.get("exchangeName"),
                    "status": "SUCCESS"
                }
        except Exception as e:
            return {
                "symbol": symbol,
                "error": str(e),
                "status": "FAILED"
            }

    def poll_all(self) -> list:
        """Poll all symbols in the watchlist."""
        results = []
        for symbol in self.watchlist:
            results.append(self.fetch_quote(symbol))
        return results


if __name__ == "__main__":
    print("=== Archangel Yahoo Finance Feed Module ===")
    feed = YahooFinanceFeed()
    quotes = feed.poll_all()
    print(json.dumps(quotes, indent=2))
