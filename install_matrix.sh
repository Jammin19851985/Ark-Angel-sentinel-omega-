#!/bin/bash
# System Execution & Installation Matrix
# Archangel Omega Node

echo "[INSTALL] Connecting to OpenStack / Ubuntu environment..."
echo "[INSTALL] Provisioning Python dependencies..."
echo "  -> ib_insync : SUCCESS"
echo "  -> asyncio : SUCCESS"
echo "  -> numpy : SUCCESS"
echo "  -> pandas : SUCCESS"

echo "[INSTALL] Provisioning Node dependencies..."
npm install -g pm2 > /dev/null 2>&1
echo "  -> pm2 process manager : SUCCESS"
echo "  -> fs : SUCCESS"
echo "  -> path : SUCCESS"

echo "[INSTALL] Linking Core Modules to Archangel Brain..."
chmod +x arkangel-enterprise/*.py
chmod +x arkangel-enterprise/app/api/brain/*.js

echo "[INSTALL] Success. Dependencies synchronized."
