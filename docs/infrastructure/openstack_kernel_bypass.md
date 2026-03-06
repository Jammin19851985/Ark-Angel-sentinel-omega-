# OpenStack Compute Node: HugePages & CPU Pinning

For Kernel Bypass to work, we need to prevent the CPU from context-switching and ensure the memory is locked and ready.

## 1. GRUB Configuration
**File:** `/etc/default/grub`
Modify the `GRUB_CMDLINE_LINUX_DEFAULT` to reserve memory and isolate CPUs for the Seraphim Engine.

```bash
# Reserve 1GB HugePages and isolate CPUs 2-15 for trading tasks
GRUB_CMDLINE_LINUX_DEFAULT="default_hugepagesz=1G hugepagesz=1G hugepages=32 isolcpus=2-15 intel_iommu=on iommu=pt"
```
*After editing, run `update-grub` and reboot.*

## 2. Neutron (Networking) Configuration: SR-IOV & DPDK
We need to tell OpenStack to allow the Stateless Proxy Nodes (SPN) to bypass the virtual switch (OVS) and hit the wire directly.

**File:** `/etc/neutron/plugins/ml2/ml2_conf.ini`
```ini
[ml2]
type_drivers = vlan,flat
tenant_network_types = vlan
mechanism_drivers = openvswitch,sriovnicswitch

[ml2_type_vlan]
network_vlan_ranges = physnet1:1000:2000
```

**File:** `/etc/nova/nova.conf` (On Compute Nodes)
```ini
[DEFAULT]
# Pinning the Seraphim Swarm to specific hardware threads
cpu_shared_set = 0,1
cpu_dedicated_set = 2-15

[pci]
# Passthrough the Intel/Mellanox NIC directly to the ArkAngel VM
passthrough_whitelist = {"devname": "eth1", "physical_network": "physnet1"}
```
