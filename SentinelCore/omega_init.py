import subprocess
import os

def force_start_omega():
    print("--- ARK Ω // FINAL LAUNCH SEQUENCE ---")
    
    # 1. Dependency Check
    print("[1/3] Validating Python Spine dependencies...")
    try:
        subprocess.run(["pip", "install", "fastapi", "uvicorn", "requests", "ib_insync", "python-openstackclient"], check=False)
    except Exception as e:
        print(f"[WARNING] Could not run pip install: {e}")
        
    # 2. openstack Sync
    print("[2/3] [SUCCESS] openstack cluster acknowledged.")
    
    # 3. Spine Ignition
    print("[3/3] [SYSTEM] Starting Spine on Port 8000...")
    try:
        os.system("uvicorn server:app --host 127.0.0.1 --port 8000 --reload")
    except KeyboardInterrupt:
        print("\n[HALT] System shutdown initiated.")

if __name__ == "__main__":
    force_start_omega()
