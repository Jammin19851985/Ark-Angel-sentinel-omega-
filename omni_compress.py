#!/usr/bin/env python3
# omni_compress.py - Archangel Asynchronous Log Compactor

import os
import json
import gzip
import shutil
from datetime import datetime, timedelta

LOG_DIR = os.path.expanduser("~/archangel_logs")
ARCHIVE_DIR = os.path.expanduser("~/archangel_logs/archive")
MAX_AGE_HOURS = 48

os.makedirs(ARCHIVE_DIR, exist_ok=True)

def compact_logs():
    print(f"[*] Starting log compaction run at {datetime.now()}")
    now = datetime.now()
    cutoff_time = now - timedelta(hours=MAX_AGE_HOURS)
    
    if not os.path.exists(LOG_DIR):
        print(f"[!] Log directory {LOG_DIR} does not exist. Creating...")
        os.makedirs(LOG_DIR, exist_ok=True)
        return

    # Simple search for uncompressed tracking or telemetry logs
    for filename in os.listdir(LOG_DIR):
        file_path = os.path.join(LOG_DIR, filename)
        if not os.path.isfile(file_path) or filename.endswith('.gz'):
            continue
            
        file_mod_time = datetime.fromtimestamp(os.path.getmtime(file_path))
        
        # Archive and compress if file is older than the cutoff threshold
        if file_mod_time < cutoff_time:
            archive_name = f"{filename}-{file_mod_time.strftime('%Y%m%d')}.gz"
            archive_path = os.path.join(ARCHIVE_DIR, archive_name)
            
            print(f"[-] Compressing and archiving: {filename} ➔ {archive_name}")
            with open(file_path, 'rb') as f_in:
                with gzip.open(archive_path, 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)
            
            os.remove(file_path)

if __name__ == "__main__":
    compact_logs()
