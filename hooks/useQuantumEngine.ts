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
        let socket: WebSocket | null = null;
        let reconnectTimeout: any = null;
        let connectionTimeout: any = null;

        const connect = () => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.host;
            const wsUrl = `${protocol}//${host}`;
            
            console.log(`[QuantumEngine] Connecting to ${wsUrl}...`);
            setStatus('CONNECTING');
            setError(null);
            
            socket = new WebSocket(wsUrl);

            connectionTimeout = setTimeout(() => {
                if (socket?.readyState !== WebSocket.OPEN) {
                    console.warn("[QuantumEngine] Connection timeout.");
                    socket?.close();
                    setStatus('ERROR');
                    setError('CONNECTION_TIMEOUT');
                }
            }, 10000);

            socket.onopen = () => {
                console.log("[QuantumEngine] Connected to Execution Spine.");
                setStatus('CONNECTED');
                if (connectionTimeout) clearTimeout(connectionTimeout);
            };

            socket.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    if (parsed.type === 'QUANTUM_UPDATE') {
                        setData(parsed);
                    } else if (parsed.type === 'MARKET_UPDATE') {
                        updateMarketData(parsed.updates);
                    }
                } catch (err) {
                    console.error("[QuantumEngine] Parse Error:", err);
                }
            };

            socket.onclose = () => {
                console.log("[QuantumEngine] Disconnected. Retrying in 5s...");
                if (status !== 'ERROR') setStatus('DISCONNECTED');
                reconnectTimeout = setTimeout(connect, 5000);
                if (connectionTimeout) clearTimeout(connectionTimeout);
            };

            socket.onerror = (err) => {
                console.error("[QuantumEngine] WebSocket Error:", err);
                setStatus('ERROR');
                setError('WEBSOCKET_ERROR');
                socket?.close();
            };
        };

        connect();

        return () => {
            if (socket) socket.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (connectionTimeout) clearTimeout(connectionTimeout);
        };
    }, []);

    return { data, status, error };
};
