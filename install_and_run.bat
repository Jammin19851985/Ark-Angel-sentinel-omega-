@echo off
echo ========================================================
echo ARCHANGEL OMEGA - AUTOMATED SETUP AND EXECUTION SCRIPT
echo ========================================================
echo Installing dependencies...
npm install
pip install -r requirements.txt
echo Establishing bridges to ais-pre and ais-dev endpoints...
echo Launching Archangel Sentinel...
python main.py
pause
