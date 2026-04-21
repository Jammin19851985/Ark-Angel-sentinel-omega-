
import { IbkrAccountInfo } from '../types';

/**
 * ARCHANGEL OMEGA — IBKR BRIDGE SERVICE (v204.0)
 * Interfaces with the Python Execution Spine for Interactive Brokers connectivity.
 */

const API_BASE_URL = "/spine-bridge";

export const ibkrService = {
    /**
     * Fetches live account data from the IBKR Gateway via the Python Spine.
     */
    async getAccountInfo(): Promise<IbkrAccountInfo> {
        try {
            let response = await fetch(`${API_BASE_URL}/status`);
            
            if (response.status === 401) {
                console.warn("[IBKR_SERVICE] 401 Detected. Attempting direct-status fallback...");
                response = await fetch(`${API_BASE_URL}/direct-status`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[IBKR_SERVICE] Gateway Error (${response.status}):`, errorText.substring(0, 100));
                
                if (response.status === 401) {
                    console.warn("[IBKR_SERVICE] AUTH_FAILURE: The platform proxy is rejecting the request. This might be due to a session timeout or domain mismatch.");
                }

                // Check if it's the proxy returning 503
                if (response.status === 503) {
                    throw new Error("EXECUTION_SPINE_OFFLINE");
                }
                throw new Error("IBKR_GATEWAY_OFFLINE");
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error("[IBKR_SERVICE] Non-JSON response received:", text.substring(0, 100));
                throw new Error("INVALID_GATEWAY_RESPONSE");
            }
            
            const data = await response.json();
            
            // Handle the case where the Python server returned an "ERROR" status but 200 OK
            if (data.status === "ERROR") {
                console.warn("[IBKR_SERVICE] Spine reported internal error:", data.error);
            }

            return {
                accountNumber: "U*******999", // Masked for security
                isArmed: data.status === "LIVE",
                latency: data.latency_ms || 0,
                marginUtilization: 0.0, // Calculated in spine
                buyingPower: data.buying_power || 0,
                baseCurrency: "USD",
                mode: data.mode,
                safetySwitch: data.safety_switch
            };
        } catch (error: any) {
            console.error("[IBKR_SERVICE] Failed to fetch account info:", error.message || error);
            
            // If it's a network error, it might be the gateway
            if (error.message === "Failed to fetch") {
                console.warn("[IBKR_SERVICE] Network error - Python Spine might be down.");
                throw new Error("EXECUTION_SPINE_OFFLINE");
            }
            throw error;
        }
    },

    /**
     * Checks if the IBKR connection is active.
     */
    async checkConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch {
            return false;
        }
    }
};
