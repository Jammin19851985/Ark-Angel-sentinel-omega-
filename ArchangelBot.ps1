$GeminiRunner = "C:\Users\adam\My Drive\Archangel_Completed_Setup\gemini_task_runner.js"
while ($true) {
    try {
        # 1. Get Market Data
        $ticker = kraken ticker BTCUSD -o json | ConvertFrom-Json
        $price = $ticker.BTCUSD.c[0]
        
        # 2. Get AI Decision
        $prompt = "BTC Price: $$price. Target: Unlimited Income. Action: BUY, SELL, or HOLD? One word only."
        $decision = node $GeminiRunner "$prompt"
        
        # 3. Execute Live Trade (NO PAPER)
        if ($decision -match "BUY") {
            $trade = kraken order buy BTCUSD 0.01 --type market -o json | ConvertFrom-Json
            $log = "[$(Get-Date)] LIVE BUY: $price"
        } elseif ($decision -match "SELL") {
            $trade = kraken order sell BTCUSD 0.01 --type market -o json | ConvertFrom-Json
            $log = "[$(Get-Date)] LIVE SELL: $price"
        } else {
            $log = "[$(Get-Date)] HOLD: $price"
        }
        
        Add-Content -Path 'C:\Users\adam\My Drive\Archangel_Completed_Setup\SESSION_LOG.md' -Value $log
    } catch {
        Add-Content -Path 'C:\Users\adam\My Drive\Archangel_Completed_Setup\SESSION_LOG.md' -Value "[$(Get-Date)] [CRITICAL] LIVE EXECUTION FAILED: Check API Keys."
    }
    Start-Sleep -Seconds 60
}
