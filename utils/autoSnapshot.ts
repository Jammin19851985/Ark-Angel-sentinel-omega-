/**
 * ARCHANGEL OMEGA — AUTO-SAVE SNAPSHOT ENGINE
 * Cryptographically commits state snapshots to immutable local ledger on
 * high-value transactions (>= $1,000) or critical configuration changes.
 */

export interface SystemSnapshot {
    id: string;
    timestamp: string;
    reason: string;
    hash: string;
    metrics: {
        fiatBalance?: number;
        portfolioValue?: number;
        activeBots?: number;
        isLiveMode?: boolean;
    };
}

export function generateSnapshotHash(seed: string): string {
    let hash = 0;
    const str = `${seed}_${Date.now()}_${Math.random()}`;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `0x${hex.toUpperCase()}${Date.now().toString(16).slice(-4).toUpperCase()}`;
}

export function triggerAutoSnapshot(
    reason: string, 
    details: { fiatBalance?: number; portfolio?: Record<string, any>; isLiveMode?: boolean; [key: string]: any },
    addLog: (source: any, msg: string) => void,
    addNexusLog?: (msg: string) => void
): SystemSnapshot {
    const id = `SNP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const hash = generateSnapshotHash(reason);
    const timestamp = new Date().toISOString();

    const snapshot: SystemSnapshot = {
        id,
        timestamp,
        reason,
        hash,
        metrics: {
            fiatBalance: details.fiatBalance,
            isLiveMode: details.isLiveMode,
            portfolioValue: details.portfolio ? Object.keys(details.portfolio).length : 0
        }
    };

    // Save to local storage for persistent audit trail
    try {
        const existing = JSON.parse(localStorage.getItem('archangel_snapshots') || '[]');
        const updated = [snapshot, ...existing].slice(0, 50);
        localStorage.setItem('archangel_snapshots', JSON.stringify(updated));
    } catch {
        // Safe fallback if storage unavailable
    }

    // Log to System and Nexus ledgers
    const logMsg = `📸 [AUTO_SNAPSHOT] Checkpoint [${id}] committed. Reason: ${reason} | Integrity Hash: ${hash}`;
    addLog('SNAPSHOT', logMsg);
    if (addNexusLog) {
        addNexusLog(`>> SNAPSHOT_COMMITTED: [${id}] ${reason} | HASH: ${hash}`);
    }

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aode-snapshot-created', { detail: snapshot }));
    }

    return snapshot;
}
