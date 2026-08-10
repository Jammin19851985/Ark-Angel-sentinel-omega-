#!/usr/bin/env python3
"""
Module: archangel_unified.py
Author: Jack
Target: Ark
Description: Unified Archangel Orchestrator & OpenStack Market Feed Ingestion.
              Automatically enforces execution permissions (+x).
"""

import os
import sys
import stat
import json
import urllib.request
import urllib.error


# ==========================================
# 1. Automatic Permission Management
# ==========================================
def ensure_executable():
    """Ensure script has owner execution permissions (+x)."""
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


# ==========================================
# 2. OpenStack Market Feed Module
# ==========================================
class OpenStackFinanceFeed:
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


# ==========================================
# 3. OpenRouter Multi-Agent Orchestrator
# ==========================================
class OpenRouterAgent:
    """Represents an individual agent profile."""
    def __init__(self, name: str, role: str, model: str):
        self.name = name
        self.role = role
        self.model = model


class OpenRouterClient:
    """Handles agent dispatching and LLM interaction via OpenRouter API."""
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"
        self.agents = {}

    def register_agent(self, agent: OpenRouterAgent):
        """Register an agent profile with the client."""
        self.agents[agent.name] = agent
        print(f"[+] Agent '{agent.name}' ({agent.role}) registered [Model: {agent.model}]")

    def run_agent_task(self, agent_name: str, prompt: str) -> str:
        """Dispatch prompt to specific registered agent."""
        if agent_name not in self.agents:
            raise ValueError(f"Agent '{agent_name}' is not registered.")
        
        if not self.api_key:
            return "[-] Error: OPENROUTER_API_KEY environment variable not set."

        agent = self.agents[agent_name]
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://localhost",
            "X-Title": "Archangel Multi-Agent System"
        }

        payload = {
            "model": agent.model,
            "messages": [
                {"role": "system", "content": f"You are {agent.name}, operating as {agent.role}."},
                {"role": "user", "content": prompt}
            ]
        }

        req = urllib.request.Request(
            self.base_url,
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            return f"[-] HTTP Error ({e.code}): {e.read().decode('utf-8')}"
        except Exception as e:
            return f"[-] Request Failed: {e}"


def init_default_agents(client: OpenRouterClient):
    """Configures default agents for the Archangel orchestrator."""
    default_agents = [
        OpenRouterAgent("Jack", "Lead System Developer", "openai/gpt-4o"),
        OpenRouterAgent("Executor", "Script Automator & Terminal Runner", "meta-llama/llama-3.3-70b-instruct")
    ]
    for agent in default_agents:
        client.register_agent(agent)


# ==========================================
# 4. Entry Point Execution
# ==========================================
if __name__ == "__main__":
    print("=== ARCHANGEL UNIFIED SYSTEM START ===")
    
    # Initialize & Execute Market Feed
    print("\n--- [1] Fetching OpenStack Market Data ---")
    feed = OpenStackFinanceFeed()
    quotes = feed.poll_all()
    print(json.dumps(quotes, indent=2))
    
    # Initialize Agent Router
    print("\n--- [2] Initializing OpenRouter Agents ---")
    router = OpenRouterClient()
    init_default_agents(router)
    
    print("\n[+] Unified script initialized successfully with execution permissions.")
