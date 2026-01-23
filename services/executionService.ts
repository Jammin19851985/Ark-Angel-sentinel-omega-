
import { ExecutionIntent } from "../utils/spine";

const API_BASE_URL = "http://localhost:8000";

export interface ExecutionResponse {
    symbol: string;
    side: string;
    confidence: number;
    alpha_score: number;
    risk_passed: boolean;
    verdict: 'APPROVE' | 'REJECT';
    color: 'GREEN' | 'RED';
    reason_tree: string[];
    execution_status: string;
    intent_id?: string;
    order_id?: string;
}

export const executionService = {
    /**
     * Sends a Trade Intent to the FastAPI Control Surface.
     * Gated by the Backend Execution Spine (IBKR + Hardware Auth).
     */
    async executeLiveTrade(intent: ExecutionIntent, confidence: number): Promise<ExecutionResponse> {
        console.log(">> SENDING LIVE EXECUTION INTENT:", intent);
        try {
            const response = await fetch(`${API_BASE_URL}/trade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: intent.symbol,
                    side: intent.side,
                    quantity: intent.quantity,
                    limit_price: intent.price,
                    confidence: confidence,
                    order_type: "MARKET" // SICO orders default to Market for immediacy
                })
            });

            const data = await response.json();

            if (!response.ok) {
                const detail = data.detail || {};
                throw new Error(detail.verdict === 'REJECT' 
                    ? `SPINE_REJECTION: ${detail.reason}`
                    : `API_ERROR: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error("AODE_EXECUTION_FAILURE:", error);
            throw error;
        }
    },

    /**
     * Checks if the Execution Spine (FastAPI) is responsive.
     */
    async checkHealth(): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE_URL}/health`, { 
                signal: AbortSignal.timeout(2000) 
            });
            return res.ok;
        } catch {
            return false;
        }
    }
};
