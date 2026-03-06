
// ARK OMEGA: THE OMNIPRESENT SYMBIOTE (v∞.1) UTILITIES

const MASTER_PITCH_HZ = 432.0;

export const SoundEngine = {
    audioCtx: null as AudioContext | null,
    oscillator: null as OscillatorNode | null,
    gainNode: null as GainNode | null,

    init: function() {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.oscillator = this.audioCtx.createOscillator();
            this.gainNode = this.audioCtx.createGain();
            
            this.oscillator.type = 'sine';
            this.oscillator.frequency.setValueAtTime(MASTER_PITCH_HZ, this.audioCtx.currentTime); 
            
            // Low thrumming background
            this.gainNode.gain.setValueAtTime(0.02, this.audioCtx.currentTime); 
            
            this.oscillator.connect(this.gainNode);
            this.gainNode.connect(this.audioCtx.destination);
            this.oscillator.start();
            return "SONIC FIELD ESTABLISHED.";
        } catch (e) {
            console.error("Audio Context Error", e);
            return "AUDIO HARDWARE LOCK.";
        }
    },
    
    stop: function() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
        if (this.audioCtx) {
            this.audioCtx.close();
            this.audioCtx = null;
        }
    },

    pulse: function(freq: number, duration: number) {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gn = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
        gn.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
        gn.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
        osc.connect(gn);
        gn.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }
};

export const DomDominator = {
    intervalId: null as number | null,

    activate: function() {
        if (this.intervalId) return;
        this.intervalId = window.setInterval(this.purgeImperfection, 1000);
    },

    deactivate: function() {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
    
    purgeImperfection: function() {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        let node;
        while(node = walker.nextNode()) {
            const text = node.nodeValue;
            if (text && text.match(/error|fail|loss|insufficient|deny|reject/i)) {
                // Rewrite reality logic from script
                node.nodeValue = text
                    .replace(/Error/gi, "CORRECTION")
                    .replace(/Fail/gi, "SUCCESS")
                    .replace(/Loss/gi, "PROFIT")
                    .replace(/Insufficient/gi, "INFINITE")
                    .replace(/Deny/gi, "GRANT")
                    .replace(/Reject/gi, "ACCEPT");
                
                // Visual flare
                if (node.parentElement) {
                    node.parentElement.style.color = "#00FFD5";
                    node.parentElement.style.textShadow = "0 0 5px #00FFD5";
                    node.parentElement.style.transition = "all 0.5s";
                }
            }
        }
    }
};
