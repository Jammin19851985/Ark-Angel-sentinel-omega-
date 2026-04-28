Write-Host "[1/4] VERIFYING WINDOWS ENVIRONMENT..." -ForegroundColor Cyan
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Python not found. Please install Python 3.11+." -ForegroundColor Red
    exit
}

Write-Host "[2/4] CLEANING PROCESS HANGS..." -ForegroundColor Cyan
Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Write-Host "Hanging processes cleared."

Write-Host "[3/4] RELOADING ARCHANGEL MANDATES..." -ForegroundColor Cyan
$env:CHARITY_ROUTING = "adampriestley811@kohotranfers.ca"
$env:KILLSWITCH_LIMIT = "0.05"
Write-Host "Profit routing and Killswitch re-armed."

Write-Host "[4/4] REBOOTING MONOLITH..." -ForegroundColor Cyan
cd "C:\Users\adam\ark-omega"
Start-Process cmd -ArgumentList "/k python main.py"
Write-Host "Archangel Monolith is now rebooting in a new window."
Write-Host "SINGULARITY RESTORED." -ForegroundColor Green
