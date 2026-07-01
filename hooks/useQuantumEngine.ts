import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export interface QuantumData {
    type: string;
    timestamp: number;
    qubit_coherence: number;
    entropy_level: number;
    causal_drift: number;
    market_resonance: number;
    active_agents: number;
}

export const useQuantumEngine = () => {
    const [data, setData] = useState<QuantumData | null>(null);
    const [status, setStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR'>('CONNECTING');
    const [error, setError] = useState<string | null>(null);
    const updateMarketData = useAppStore(state => state.updateMarketData);

    useEffect(() => {
        let isMounted = true;
        let pollTimeout: any = null;

        const pollData = async () => {
            if (!isMounted) return;
            try {
                if (status !== 'CONNECTED') setStatus('CONNECTING');
                
                const res = await fetch('/spine-bridge/quantum-sync');
                if (!res.ok) throw new Error("HTTP " + res.status);
                
                const data = await res.json();
                if (!isMounted) return;
                
                setData(data.quantum);
                updateMarketData(data.market.updates);
                
                if (status !== 'CONNECTED') setStatus('CONNECTED');
                setError(null);
                
                pollTimeout = setTimeout(pollData, 1000);
            } catch (err: any) {
                if (err.message !== "Failed to fetch" && !String(err).includes('429')) {
                    console.warn("[QuantumEngine] Polling Error:", err.message);
                }
                if (isMounted) {
                    setStatus('ERROR');
                    setError(err.message || 'POLLING_ERROR');
                    pollTimeout = setTimeout(pollData, 5000);
                }
            }
        };

        pollData();

        return () => {
            isMounted = false;
            if (pollTimeout) clearTimeout(pollTimeout);
        };
    }, []);

    return { data, status, error };
};
