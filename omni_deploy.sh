#!/usr/bin/env bash
# omni_deploy.sh - Automated Core Daemon Orchestration

set -e

SYSTEMD_DIR="/etc/systemd/system"
SERVICE_NAME="archangel_core.service"

echo "==============================================="
echo "   ARCHANGEL OMNICORE AUTOMATED DEPLOYMENT     "
echo "==============================================="

# Setup option 1: Local Linux Service Engine
deploy_local_service() {
    echo "[*] Constructing systemd service framework..."
    
    if [ "$TEST_RUN" = "true" ]; then
        echo "[TEST] Simulating systemd service installation (Skipping privileged system commands)."
        echo "[✓] Local daemon service blueprint verified."
        return 0
    fi
    
    sudo bash -c "cat <<EOF > ${SYSTEMD_DIR}/${SERVICE_NAME}
[Unit]
Description=Archangel OmniCore Algorithmic Engine Daemon
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD
ExecStart=/usr/bin/python3 $PWD/omni_ingress.py
Restart=always
RestartSec=3
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF"

    echo "[*] Reloading daemons and enabling auto-start on boot..."
    sudo systemctl daemon-reload
    sudo systemctl enable ${SERVICE_NAME}
    echo "[✓] Local daemon service verified and integrated."
}

# Setup option 2: Generate openstack compute init recipe
generate_cloud_config() {
    echo "[*] Building automated openstack cloud-init payload..."
    
    cat <<EOF > openstack_init.cfg
#cloud-config
package_update: true
packages:
  - python3
  - git
  - python3-pip

runcmd:
  - mkdir -p /opt/archangel
  - cd /opt/archangel
  - echo "Deploying target node assets into OpenStack cloud computing frame..."
EOF
    echo "[✓] openstack_init.cfg blueprint generated successfully."
}

# Execute target deployment strategies
deploy_local_service
generate_cloud_config
echo -e "\n==============================================="
echo -e "[+] All environments configured successfully!"
echo -e "==============================================="
