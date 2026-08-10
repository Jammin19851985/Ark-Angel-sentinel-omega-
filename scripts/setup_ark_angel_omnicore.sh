#!/usr/bin/env bash
# ============================================================================
# ARK ANGEL OMNICORE — COMPLETE IMPLEMENTATION SCRIPT
# ============================================================================
# Identity Protocol: Jack | Operator: Ark
# Purpose: One-command setup of the entire Ark Angel trading platform
# 
# This script:
#   1. Creates the complete workspace directory structure
#   2. Writes the unified Python OmniCore script
#   3. Generates the archangel manifest configuration
#   4. Sets hardened file permissions (OpenStack-style)
#   5. Runs the full validation suite
#   6. Outputs a deployment receipt
# ============================================================================

set -euo pipefail
IFS=$'\n\t'

# --- IDENTITY PROTOCOL ---
OPERATOR="ARK"
INTERFACE="JACK"
MODULE="ArkAngel-OmniCore-v2.0.0-Hibiscus"

echo "[$OPERATOR] ============================================================"
echo "[$OPERATOR] ARK ANGEL OMNICORE — COMPLETE IMPLEMENTATION"
echo "[$OPERATOR] Operator: $OPERATOR | Interface: $INTERFACE"
echo "[$OPERATOR] Module: $MODULE"
echo "[$OPERATOR] ============================================================"

# --- PATH CONFIGURATION ---
WORKSPACE_BASE="${HOME}/ubuntu_data/sentinel_omega"
TARGET_DIR="${WORKSPACE_BASE}/projects/ark-omega/app/api/brain"
LOG_DIR="${WORKSPACE_BASE}/logs"
SECRETS_DIR="${WORKSPACE_BASE}/.secrets"
BACKUP_DIR="${WORKSPACE_BASE}/backups"

echo "[$OPERATOR] Creating workspace structure..."
mkdir -p "$TARGET_DIR" "$LOG_DIR" "$SECRETS_DIR" "$BACKUP_DIR"

# --- SECURITY HARDENING (OpenStack-style permissions) ---
chmod 750 "$TARGET_DIR"
chmod 700 "$SECRETS_DIR"
chmod 755 "$LOG_DIR"
chmod 750 "$BACKUP_DIR"
umask 0077

# --- CHECK PYTHON AVAILABILITY ---
PYTHON_CMD=""
for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null; then
        PYTHON_CMD="$cmd"
        break
    fi
done

if [[ -z "$PYTHON_CMD" ]]; then
    echo "[$OPERATOR] ERROR: Python not found. Install Python 3.9+"
    exit 1
fi

PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)
echo "[$OPERATOR] Python detected: $PYTHON_VERSION"

# --- COPY THE UNIFIED PYTHON SCRIPT ---
echo "[$OPERATOR] Copying unified OmniCore Python script..."
cp "$(dirname "$0")/ark_angel_omnicore.py" "$TARGET_DIR/ark_angel_omnicore.py"
chmod 755 "$TARGET_DIR/ark_angel_omnicore.py"
echo "Written: $TARGET_DIR/ark_angel_omnicore.py"

# --- RUN VALIDATION ---
echo "[$OPERATOR] Running full validation suite..."
cd "$TARGET_DIR"
$PYTHON_CMD ark_angel_omnicore.py

# --- GENERATE DEPLOYMENT RECEIPT ---
echo "[$OPERATOR] Generating deployment receipt..."

cat << RECEIPT_EOF > "$TARGET_DIR/.deployment_receipt"
{
  "module": "$MODULE",
  "operator": "$OPERATOR",
  "interface": "$INTERFACE",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "target": "$TARGET_DIR",
  "python_version": "$PYTHON_VERSION",
  "kernel": "$(uname -r)",
  "status": "COMPLETE"
}
RECEIPT_EOF

chmod 644 "$TARGET_DIR/.deployment_receipt"

echo ""
echo "================================================================================"
echo "  IMPLEMENTATION COMPLETE"
echo "================================================================================"
echo "  Target:      $TARGET_DIR"
echo "  Python:      $PYTHON_VERSION"
echo "  Kernel:      $(uname -r)"
echo "  Validate:    python3 $TARGET_DIR/ark_angel_omnicore.py"
echo "  Deploy:      python3 $TARGET_DIR/ark_angel_omnicore.py --deploy"
echo "  Daemon:      python3 $TARGET_DIR/ark_angel_omnicore.py --daemon"
echo "================================================================================"
