#!/bin/bash
chmod 750 $0
echo SECURE DEPLOYMENT INITIALIZED
echo TARGET ENGINE: ARCHANGEL OMNICORE
echo SOURCE LAYER: GOPHER PROTOCOL GATEWAY

mkdir -p telemetry_stream
cd telemetry_stream

echo CONNECTING TO LIVE DATA FEED
curl -s https://api.gopher-lab.com/v1/stream >> market_shifts.log
