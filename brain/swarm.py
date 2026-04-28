import google.generativeai as genai
import os
import asyncio

class AgentSwarm:
    """
    ARCHANGEL OMEGA - PHASE 2: AGENT SWARM (MoE)
    Logic: Multi-Agent Orchestration
    Agents: MIDAS (Technical Analysis), DUCHESS (Sentiment)
    """
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro') # Fallback from 3-pro-preview

    async def consult_midas(self, asset_data):
        print("?? [MIDAS] Analyzing Technical Indicators...")
        prompt = f"Act as an expert quantitative analyst. Analyze this raw ticker data and calculate RSI, MACD, and Bollinger Bands. Data: {asset_data}"
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"MIDAS Error: {str(e)}"

    async def consult_duchess(self, asset_name):
        print("?? [DUCHESS] Scanning Social Sentiment & Threat Vectors...")
        prompt = f"Act as a high-frequency trading sentiment analysis bot. Scan current internet context for {asset_name} and return a sentiment score from -1.0 to 1.0 with a 1-sentence justification."
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"DUCHESS Error: {str(e)}"

    async def orchestrate(self, asset):
        # Parallel intelligence gathering
        results = await asyncio.gather(
            self.consult_midas(f"Symbol: {asset}, Price: LIVE_FETCH"),
            self.consult_duchess(asset)
        )
        
        print(f"?? [SWARM] Intelligence Gathered for {asset}")
        return {
            "ta_data": results[0],
            "sentiment_data": results[1]
        }
