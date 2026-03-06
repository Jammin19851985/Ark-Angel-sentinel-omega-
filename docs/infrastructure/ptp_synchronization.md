# Precision Time Protocol (PTP) Configuration: Bohemos Phase Sync

To achieve the Bohemos Phase Sync, we are implementing IEEE 1588v2, moving from millisecond-level NTP to nanosecond-level accuracy.

## 1. Linux PTP Configuration (ptp4l)
We use `ptp4l` to sync the physical hardware clock (PHC) on the NIC with the external Grandmaster.

**File:** `/etc/ptp4l.conf`
```ini
[global]
# Use Hardware Timestamping for nanosecond accuracy
time_stamping          hardware
# Use the Best Master Clock Algorithm (BMCA)
priority1              128
priority2              128
domainNumber           0
# Log synchronization stats for the Watcher
summary_interval       1
verbose                1

[eth1]
# Pointing to the SR-IOV/DPDK enabled interface from Phase 1
network_transport      UDPv4
delay_mechanism        E2E
```

**Execution:**
```bash
sudo ptp4l -f /etc/ptp4l.conf -i eth1 -m
```

## 2. System Clock Sync (phc2sys)
Use `phc2sys` to align the OS System Clock with the NIC's hardware clock.

**Execution:**
```bash
sudo phc2sys -s eth1 -c CLOCK_REALTIME -w -m
```
* `-s eth1`: Source (The synchronized NIC).
* `-c CLOCK_REALTIME`: Target (The OS System Clock).
* `-w`: Wait for ptp4l to achieve a stable lock before starting.

## 3. Global Implementation: Bohemos Phase Sync
| Hub | Clock Source | Role | Accuracy |
|---|---|---|---|
| Dubai (DFM) | GPS Grandmaster | Stratum 0 | <50ns |
| London (LSE) | GPS Grandmaster | Stratum 0 | <50ns |
| New York (NYSE) | GPS Grandmaster | Stratum 0 | <50ns |

## 4. Success Check: RMS Verification
The Watcher monitors the `ptp4l` logs for the RMS (Root Mean Square) value.
* **Success:** `rms < 100` (Clock is within 100 nanoseconds of the Grandmaster).
* **Warning:** `rms > 500` (Jitter detected; Heisenberg Compensator active).
