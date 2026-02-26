
/**
 * RUST KERNEL BRIDGE (v205.0 - PRODUCTION)
 * Connects to the local FastAPI/Rust backend for real system telemetry.
 */

const BACKEND_URL = "http://localhost:8000";

export interface KernelMetrics {
    heapUsage: number; 
    threadCount: number;
    gcPause: number;
    throughput: number;
    panicCount: number;
    ffiLatency: number;
}

export class RustKernelBridge {
    private static instance: RustKernelBridge;
    private isRunning: boolean = false;
    private metrics: KernelMetrics = {
        heapUsage: 0,
        threadCount: 0,
        gcPause: 0,
        throughput: 0,
        panicCount: 0,
        ffiLatency: 0
    };

    private constructor() {}

    static getInstance(): RustKernelBridge {
        if (!RustKernelBridge.instance) {
            RustKernelBridge.instance = new RustKernelBridge();
        }
        return RustKernelBridge.instance;
    }

    public start() {
        this.isRunning = true;
        this.checkConnection();
    }

    public stop() {
        this.isRunning = false;
    }

    private async checkConnection() {
        try {
            const res = await fetch(`${BACKEND_URL}/health`);
            if (res.ok) {
                console.log(">> RUST_KERNEL: UPLINK ESTABLISHED.");
            } else {
                console.warn(">> RUST_KERNEL: BACKEND UNREACHABLE.");
            }
        } catch (e) {
            console.warn(">> RUST_KERNEL: CONNECTION FAILED. IS BACKEND RUNNING?");
        }
    }

    public async getMetrics(): Promise<KernelMetrics> {
        if (!this.isRunning) return this.metrics;

        try {
            const response = await fetch(`${BACKEND_URL}/status`);
            if (response.ok) {
                const data = await response.json();
                // Map backend status to kernel metrics
                this.metrics = {
                    heapUsage: data.metrics?.memory_mb || 0,
                    threadCount: data.active_connections || 0,
                    gcPause: 0,
                    throughput: data.metrics?.tps || 0,
                    panicCount: 0,
                    ffiLatency: data.latency_ms || 0
                };
            }
        } catch (e) {
            // Silently fail to avoid console spam, keep last metrics
        }

        return this.metrics;
    }
}
