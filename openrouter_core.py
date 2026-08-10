#!/usr/bin/env python3
"""
Module: openrouter_core.py
Author: Jack
Target: Ark
Description: Independent OpenRouter Multi-Agent Orchestrator module with 
             automatic file execution permissions setup.
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


class OpenRouterAgent:
    """Represents an individual agent connected via OpenRouter."""

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
        print(f"[+] Agent '{agent.name}' ({agent.role}) registered with model {agent.model}.")

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


if __name__ == "__main__":
    print("=== Archangel OpenRouter Agent Integration ===")
    router = OpenRouterClient()
    init_default_agents(router)
    print("\n[+] System ready. Execution permissions verified.")
