
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
                let errorText = "Unknown error";
                try {
                    errorText = await response.text();
                    // Just truncate the error or parse title if HTML
                    if (errorText.includes('<html')) {
                        console.warn("[IBKR_SERVICE] Gateway Error: Received HTML error page. Spine proxy is likely offline or misconfigured (Status: " + response.status + ")");
                    } else {
                        console.warn(`[IBKR_SERVICE] Gateway Error (${response.status}):`, errorText.substring(0, 100));
                    }
                } catch(e) { }
                
                if (response.status === 401) {
                    console.warn("[IBKR_SERVICE] AUTH_FAILURE: The platform proxy is rejecting the request. This might be due to a session timeout or domain mismatch.");
                }

                console.log("[IBKR_SERVICE] Using safe fallback state due to gateway error.");
                return {
                    accountNumber: "U*******999", 
                    isArmed: false,
                    latency: 0,
                    marginUtilization: 0.0, 
                    buyingPower: 0,
                    baseCurrency: "USD",
                    mode: "MOCK",
                    safetySwitch: false
                };
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                if (text.includes('<html')) {
                    console.warn("[IBKR_SERVICE] Gateway Error: Received HTML error page. Spine proxy is likely offline or misconfigured.");
                } else {
                    console.error("[IBKR_SERVICE] Non-JSON response received:", text.substring(0, 100));
                }
                
                // Instead of throwing immediately, fallback to a safe state
                console.log("[IBKR_SERVICE] Using safe fallback state due to gateway error.");
                return {
                    accountNumber: "U*******999", 
                    isArmed: false,
                    latency: 0,
                    marginUtilization: 0.0, 
                    buyingPower: 0,
                    baseCurrency: "USD",
                    mode: "MOCK",
                    safetySwitch: false
                };
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
            console.warn("[IBKR_SERVICE] Failed to fetch account info:", error.message || error);
            
            // Fallback for any error to prevent crashing UI
            return {
                accountNumber: "U*******999", 
                isArmed: false,
                latency: 0,
                marginUtilization: 0.0, 
                buyingPower: 0,
                baseCurrency: "USD",
                mode: "MOCK",
                safetySwitch: false
            };
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
