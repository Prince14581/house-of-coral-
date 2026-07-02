#!/bin/bash

# House-of-Coral Launch Protocol
echo "--- Starting House-of-Coral Launch Protocol ---"

# 1. Run Production Health Check
echo "[1/2] Running Health Verification..."
node scripts/verify-production.js
if [ $? -ne 0 ]; then
    echo "ERROR: Health verification failed. Launch aborted."
    exit 1
fi

# 2. Run Integrity Simulation
echo "[2/2] Running Integrity Simulation..."
node simulate-production.js
if [ $? -ne 0 ]; then
    echo "ERROR: Integrity simulation failed. System drift detected. Launch aborted."
    exit 1
fi

echo "------------------------------------------------"
echo "SUCCESS: All checks passed. House-of-Coral is LIVE."
echo "------------------------------------------------"
exit 0
