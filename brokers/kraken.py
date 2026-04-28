import subprocess
import json
import os

class KrakenBridge:
    """
    Bridge to Kraken Exchange via Gemini CLI Extension (Kraken CLI).
    Handles authentication and execution of spot and futures orders.
    """
    def __init__(self):
        self.api_key = os.getenv("KRAKEN_API_KEY")
        self.api_secret = os.getenv("KRAKEN_API_SECRET")

    def execute_command(self, command_args):
        """Executes a kraken-cli command and returns the JSON result."""
        full_cmd = ["kraken"] + command_args + ["-o", "json"]
        try:
            result = subprocess.run(full_cmd, capture_output=True, text=True, check=True, shell=True)
            return json.loads(result.stdout)
        except subprocess.CalledProcessError as e:
            return {"error": "execution_failed", "message": e.stderr or e.stdout}
        except json.JSONDecodeError:
            return {"error": "parse_error", "message": "Failed to parse Kraken CLI response"}

    def get_ticker(self, pair, asset_class="crypto"):
        args = ["ticker", pair]
        if asset_class != "crypto":
            args += ["--asset-class", asset_class]
        return self.execute_command(args)

    def place_order(self, action, pair, amount, order_type="limit", price=None, validate=True):
        """
        Places an order on Kraken.
        action: 'buy' or 'sell'
        validate: If True, uses --validate flag for safety.
        """
        args = ["order", action, pair, str(amount), "--type", order_type]
        if price:
            args += ["--price", str(price)]
        if validate:
            args.append("--validate")
        
        return self.execute_command(args)

    def get_balance(self):
        return self.execute_command(["balance"])
