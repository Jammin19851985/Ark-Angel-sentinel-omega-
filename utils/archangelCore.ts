
export class DualManifoldReasoner {
    score(price_features: number[], sentiment_features: number[]): number {
        // Lightweight cognitive proxy
        const p = price_features.reduce((a, b) => a + b, 0) / (price_features.length || 1);
        const s = sentiment_features.reduce((a, b) => a + b, 0) / (sentiment_features.length || 1);
        
        // Sigmoid-like confidence calculation
        const val = (p - s);
        const confidence = 1 / (1 + Math.exp(-val));
        return parseFloat(confidence.toFixed(4));
    }
}

export class Governance {
    last_confidence = 0.0;

    approve(confidence: number): boolean {
        const delta = Math.abs(confidence - this.last_confidence);
        this.last_confidence = confidence;
        
        // Governance Rules from Python script
        if (confidence < 0.55) return false;
        if (delta > 0.25) return false; // Reject high volatility in confidence
        return true;
    }
}

export class Reconciliation {
    ledger: any[] = [];

    record(event: any): string {
        const timestamp = Date.now();
        const eventStr = JSON.stringify(event);
        // Simple hash simulation since we don't want external deps for sha256 in this snippet
        const hash = this.simpleHash(`${timestamp}-${eventStr}`);
        
        const entry = {
            timestamp,
            event,
            hash
        };
        
        this.ledger.push(entry);
        if (this.ledger.length > 100) this.ledger.shift(); // Keep last 100
        return hash;
    }

    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        // Return a hex-like string
        return Math.abs(hash).toString(16).padStart(8, '0') + 'X' + Date.now().toString(16).substring(8);
    }
}

export class ArchangelCore {
    reasoner = new DualManifoldReasoner();
    gov = new Governance();
    recon = new Reconciliation();

    cycle(price: number, sentimentScore: number) {
        // Feature Engineering (Simulated based on Python script)
        const price_features = [
            (price % 100) / 100, 
            Math.sin(price / 1000)
        ];
        
        // Sentiment normalized 0..1
        const normSentiment = (sentimentScore + 1) / 2; 
        const sentiment_features = [
            normSentiment, 
            Math.random() // Noise feature
        ];

        const confidence = this.reasoner.score(price_features, sentiment_features);
        const approved = this.gov.approve(confidence);

        const event = {
            price,
            confidence,
            approved,
            cycle_time: Date.now()
        };

        const hash = this.recon.record(event);

        return {
            confidence,
            approved,
            hash,
            ledgerSize: this.recon.ledger.length
        };
    }
}
