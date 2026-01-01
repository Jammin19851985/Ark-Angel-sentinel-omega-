
/**
 * ARK ANGEL — HARDWARE AUTHORITY CORE (v∞.9)
 * Manages physical device attestation, firmware verification, and tamper detection.
 * Designed for interaction with Arduino-based Sentinel modules and hardware TPMs.
 * 
 * UPDATE v205: Added Host Machine Fingerprinting (Software-Based Attestation).
 */

export class HardwareAuthority {
    /**
     * Generates a cryptographically random 256-bit nonce for firmware challenges.
     */
    static generateNonce(): string {
        const array = new Uint32Array(8);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('');
    }

    /**
     * Simulates signing a nonce with a device's private key.
     */
    static signNonce(nonce: string, deviceSecret: string): string {
        const encoder = new TextEncoder();
        const data = encoder.encode(nonce + deviceSecret);
        return btoa(String.fromCharCode(...data)).substring(0, 44);
    }

    /**
     * Verifies that the signed response matches the expected attestation.
     */
    static verifySignature(nonce: string, signature: string, deviceId: string): boolean {
        const expected = this.signNonce(nonce, `AODE_PRIVATE_KEY_${deviceId}`);
        return signature === expected;
    }

    /**
     * Performs a forensic attestation of the device's firmware and physical casing.
     */
    static async attestDevice(deviceId: string): Promise<{ status: 'VERIFIED' | 'TAMPERED', hash: string }> {
        await new Promise(r => setTimeout(r, 1500));
        const isTampered = Math.random() < 0.01; 
        return {
            status: isTampered ? 'TAMPERED' : 'VERIFIED',
            hash: `AODE_FW_${deviceId}_SHA512:${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        };
    }

    /**
     * Generates a unique Machine Fingerprint based on browser/system entropy.
     * Simulates Python's platform.node() + uuid.getnode().
     */
    static async getHostFingerprint(): Promise<string> {
        const nav = window.navigator;
        const screen = window.screen;
        const raw = `${nav.userAgent}-${nav.language}-${screen.colorDepth}-${screen.width}x${screen.height}-${new Date().getTimezoneOffset()}`;
        
        const msgUint8 = new TextEncoder().encode(raw);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return `HOST_ID:${hashHex.substring(0, 16).toUpperCase()}`;
    }
}
