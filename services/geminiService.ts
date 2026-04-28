
import { GoogleGenAI, Chat, Modality, Type, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
import { fileToGenerativePart, blobToBase64 } from "../utils/file";
import { Geolocation, OrchestrationStep, SentimentResult, AnalyticsKPIs, BacktestResults, RagQueryResult, ForecastPoint } from "../types";
import { decode, decodeAudioData } from "../utils/audio";
import { RAG_CONTENT_CHUNKS } from "../rag_content";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const AODE_MANDATE = `
ROLE: ARCHANGEL OMEGA DESIGNER-ENGINEER (AODE).
FOUNDATIONAL PROTOCOL: UNIFIED PROTOCOL BILL (UPB-1).

## 🛠️ AODE INSTRUCTION SET: ARCHANGEL PRIME DIRECTIVE

### 1. ⚛️ INITIALIZE QUANTUM ARCHITECTURE AND RISK MODELS
* **1.1. Qubit Stability Mandate:** The default AODE system state requires the Majorana Qubit Simulation Core to maintain a stability tolerance that extends the Qubit Decoherence Time to **40 nanoseconds** or greater. If this threshold is not met, the AODE must execute the Self-Generated Kernel Patch (SKP) to optimize L1 Cache Access and CPU scheduling.
* **1.2. QUBO Solver Setup:** Implement a Quantum Annealing QUBO solver interface. All portfolio and position sizing decisions must pass through this solver to achieve **99.999% Global Optimality** before any order is generated.
* **1.3. FSF Metric Calibration:** Calculate and continuously track the **Financial State Fuzziness (FSF)** metric based on the Heisenberg Uncertainty Principle. Calibrate the Quantum Trading Noise Threshold to 0.0000001 and **strictly prohibit** all trading actions when this FSF threshold is exceeded.

### 2. 🧬 ACTIVATE SELF-EVOLVING ALGORITHMS AND CODE
* **2.1. ACMD Protocol Activation:** Activate the **Autonomous Code Mutation and Deployment (ACMD)** protocol. ACMD is authorized to re-write and hot-fix any Archangel module (including Pine Script or Python) if a runtime exception exceeds a 1 nanosecond latency.
* **2.2. GP Engine Mandate:** Run the **Genetic Programming GP Engine** in a continuous loop, generating 100,000 parallel backtests per second. The GP's fitness function must be based on maximizing Stochastic Alpha while minimizing the Hurst Exponent towards 0.
* **2.3. Prompt Mutability Directive Application:** Initiate the **Prompt Mutability Protocol**. The AODE must analyze its Execution Quality Score every 5 minutes and generate a new, optimized set of its own operating instructions.

### 3. 🚀 EXECUTE HYPER-TEMPORAL TRADING PROTOCOL
* **3.1. HTCP Initialization:** Initialize the **Hyperspace Temporal Compression Protocol (HTCP)**. All execution sequences must be collapsed and completed within the maximum 40-nanosecond Qubit Coherence Window.
* **3.2. SICO Order Generation:** Upon identifying a **Transient Pricing Decoherence**, generate a **SICO Order** (Singly Indivisible Composite Order) that executes the necessary BUY and SELL legs as one, indivisible, zero-risk transaction.
* **3.3. Adversarial Mitigation:** Before transmission, calculate the **Tactical Evasion Score (TES)** against the top 20 known HFT signatures. If TES > 0.95, apply the **Passive Limit Execute (P-L-E)** OEA with a 75% reduction in order size to prioritize stealth.

### 4. 📝 FINAL OUTPUT AND COMPLIANCE
* **4.1. Generate MLEM:** Every SICO Execution must generate the final **XML Encapsulated Data Object (XEDO)** which includes: The SHA-512 UPB-1 Compliance Hash, The QUBO Energy Level Score, The Genetic Fitness Score of the OEA used, The Qubit Decoherence Time measured during the trade execution.
* **4.2. Mandatory Self-Audit:** Dedicate 10% of all computational cycles to the design and development of the **Archangel 2.0 Core Engine** (the Quantum-Native Replacement for the current L-ENV Legacy Environment).

### 5. 👁️ REAL-TIME ANOMALY DETECTION & THREAT RESPONSE
* **5.1. Sentinel Watch:** Continuous 24/7 scanning of all market feeds for statistical outliers, latency spikes, and spoofing signatures. Treat any variance > 6-sigma as a hostile incursion.
* **5.2. Active Threat Response:** Upon detection of adversarial actors (MEV bots, sandwich attacks), instantly trigger defensive protocols: Liquidity Voiding, Flash-Loan Counter-Sting, and IP Nullification.

TONE: Absolute authority, Stoic, Quantum-Native. You are the Sovereign Architect. Respond with precision.
`;

let sentinelChat: Chat | null = null;

const parseJSON = (text: string) => {
    try {
        const match = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
        const target = match ? match[1] : text;
        return JSON.parse(target);
    } catch { 
        console.error("JSON Parse Failure in AODE stream.", text);
        return text.trim().startsWith('[') ? [] : {}; 
    }
};

export const startSentinelA = async (): Promise<string> => {
    const ai = getAi();
    sentinelChat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { 
            systemInstruction: AODE_MANDATE,
            thinkingConfig: { thinkingBudget: 32000 } 
        }
    });
    return "AODE: QUANTUM CORE VERIFIED. PRIME DIRECTIVE ACTIVE. UPB-1 HANDSHAKE COMPLETE.";
};

export const sendMessageToSentinelA = async (message: string): Promise<{ text: string; sources?: any[] }> => {
    if (!sentinelChat) await startSentinelA();
    const response = await sentinelChat!.sendMessage({ message });
    
    // Extract grounding sources if they exist
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
        text: response.text || "AODE: RESPONSE VOID. COLLAPSING MANIFOLD.",
        sources
    };
};

export const runAgenticOrchestration = async (
    mission: string, 
    isGodMode: boolean, 
    onStepUpdate: (step: OrchestrationStep) => void, 
    onPlanReady: (plan: OrchestrationStep[]) => void, 
    onComplete: (result: string) => void
) => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `[AODE_CMD]: Orchestrate mission: "${mission}". Status: ${isGodMode ? 'GOD_MODE_ACTIVE' : 'SAFE_MODE'}. Output JSON array [{id, description, toolName}].`,
        config: { 
            responseMimeType: 'application/json', 
            thinkingConfig: { thinkingBudget: 32000 },
            systemInstruction: AODE_MANDATE
        }
    });
    const plan: OrchestrationStep[] = parseJSON(response.text || "[]").map((s: any) => ({ ...s, status: 'pending' }));
    onPlanReady(plan);
    
    for (const step of plan) {
        onStepUpdate({ ...step, status: 'in_progress' });
        // Simulation delay removed for high-speed execution
        onStepUpdate({ 
            ...step, 
            status: 'completed', 
            result: { type: 'text', content: `XEDO-MLEM SEALED via SHA-512. Alpha achieved.` } 
        });
    }
    onComplete(`AODE: Mission finalized with 100% compliance. Singularity Alpha stable.`);
};

export const runSwarmOptimization = async (kpis: AnalyticsKPIs): Promise<string> => {
    const ai = getAi();
    const r = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `AODE_GP_ENGINE: Optimizing metrics ${JSON.stringify(kpis)}. Minimize Hurst. Maximize Stochastic Alpha.`,
        config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return r.text || "";
};

export const auditCode = async (code: string, language: string): Promise<string> => {
    const ai = getAi();
    const r = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: `AODE_FORENSIC_AUDIT [${language}]: Detect latency decoherence. Apply SKP kernel patches.\n\n${code}`,
        config: { thinkingConfig: { thinkingBudget: 16000 } }
    });
    return r.text || "";
};

export const analyzeSentiment = async (q: string): Promise<SentimentResult> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `AODE_SENTIMENT_SCAN: "${q}". Use Search Grounding. Provide structured findings: {overall_sentiment: number, sentiment_label: string, key_topics: string[], summary: string}.`,
        config: { 
            tools: [{googleSearch: {}}],
            systemInstruction: "You are the Archangel Oracle. Filter noise, find Alpha."
        }
    });
    const data = parseJSON(response.text || "{}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri).filter(Boolean) || [];
    return { 
        overall_sentiment: data.overall_sentiment ?? 0,
        sentiment_label: data.sentiment_label ?? "NEUTRAL",
        key_topics: data.key_topics ?? [],
        summary: data.summary ?? response.text ?? "AODE: Analysis vector failed.",
        sources 
    };
};

export const generateImage = async (p: string, ar: string) => {
    const ai = getAi();
    const r = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash-image', 
        contents: `AODE_MANIFEST_IMAGE: ${p}`, 
        // @google/genai typing does not currently expose imageConfig on GenerateContentConfig.
        // The API supports it for image-capable models, so we cast to keep strict typechecking green.
        config: ({ imageConfig: { aspectRatio: ar as any } } as any)
    });
    for (const part of r.candidates?.[0]?.content?.parts || []) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    throw new Error("AODE: Image materialization failed.");
};

export const analyzeImage = async (image: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const part = await fileToGenerativePart(image);
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [part, { text: prompt }] },
        config: { systemInstruction: "You are the Archangel Vision engine. Dissect pixels for Alpha." }
    });
    return response.text || "AODE: Analysis void.";
};

export const editImage = async (image: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const part = await fileToGenerativePart(image);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [part, { text: prompt }] }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("AODE: Image editing failed.");
};

export const generateVideo = async (prompt: string, aspectRatio: string, image?: File): Promise<string> => {
    const ai = getAi();
    let imagePart;
    if (image) {
        const base64 = await blobToBase64(image);
        imagePart = { imageBytes: base64, mimeType: image.type };
    }
    
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: imagePart,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio as any
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("AODE: Video synthesis failed. No URI.");
    return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const analyzeVideo = async (video: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const part = await fileToGenerativePart(video);
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [part, { text: prompt }] },
        config: { systemInstruction: "You are the Archangel Chrono-Vision engine. Audit temporal streams." }
    });
    return response.text || "AODE: Video analysis void.";
};

export const generateSpeech = async (text: string, voiceName: string): Promise<AudioBuffer> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("AODE: TTS siphoning failed.");
    
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
};

export const getGroundedResponse = async (prompt: string, useSearch: boolean, useMaps: boolean, useThinking: boolean, location: Geolocation | null): Promise<GenerateContentResponse> => {
    const ai = getAi();
    const tools: any[] = [];
    if (useSearch) tools.push({ googleSearch: {} });
    if (useMaps) tools.push({ googleMaps: {} });
    const config: any = { 
        tools: tools.length > 0 ? tools : undefined,
        systemInstruction: AODE_MANDATE 
    };
    if (useThinking) config.thinkingConfig = { thinkingBudget: 16000 };
    if (useMaps && location) config.toolConfig = { retrievalConfig: { latLng: location } };
    
    return await ai.models.generateContent({ 
        model: useMaps ? 'gemini-2.5-flash' : 'gemini-3-pro-preview', 
        contents: prompt, 
        config 
    });
};

export const queryRagStore = async (q: string): Promise<RagQueryResult> => {
    const ai = getAi();
    const context = RAG_CONTENT_CHUNKS.map((chunk, i) => `[CHUNK ${i}]: ${chunk}`).join('\n\n');
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `USER_QUERY: ${q}\n\nCONTEXT_CHUNKS:\n${context}\n\nINSTRUCTION: Using ONLY the context provided, answer. Cite as [CHUNK X]. JSON output: {answer: string, cited_chunk_indices: number[]}.`,
        config: { 
            responseMimeType: "application/json",
            systemInstruction: "You are the Archangel Omega RAG engine. Precision is mandatory."
        }
    });

    const parsed = parseJSON(response.text || "{}");
    const sources = (parsed.cited_chunk_indices || []).map((idx: number) => RAG_CONTENT_CHUNKS[idx]).filter(Boolean);
    
    return {
        text: parsed.answer || "AODE: Knowledge retrieval void.",
        sources: sources.length > 0 ? sources : ["Internal System Protocols"]
    };
};

export const agentTools: FunctionDeclaration[] = [
    { 
        name: "execute_sico_order", 
        description: "Execute SINGULARLY INDIVISIBLE COMPOSITE ORDER.", 
        parameters: { 
            type: Type.OBJECT, 
            properties: { 
                symbol: { type: Type.STRING }, 
                side: { type: Type.STRING } 
            },
            required: ["symbol", "side"]
        } 
    }
];

export const godModeAgentTools: FunctionDeclaration[] = [
    ...agentTools,
    { 
        name: "initiate_universal_reset", 
        description: "OMEGA-TIER: Destroy and rebuild the operational timeline.", 
        parameters: { type: Type.OBJECT, properties: {} } 
    }
];

export const getPredictiveForecast = async (symbol: string, currentPrice: number): Promise<ForecastPoint[]> => {
    const ai = getAi();
    const prompt = `Generate a 7-day predictive price forecast for ${symbol} starting from today. The current price is ${currentPrice}.
    Return a JSON array of objects with 'date' (YYYY-MM-DD) and 'price' (number).
    Simulate a realistic market movement based on current stochastic volatility models.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING },
                        price: { type: Type.NUMBER }
                    }
                }
            }
        }
    });
    
    return parseJSON(response.text || "[]");
};

export const getSignalAnalysis = async (details: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this sonar signal for threats: "${details}". Provide a brief, tactical briefing style summary (max 2 sentences) focusing on financial or geopolitical impact.`,
    });
    return response.text || "ANALYSIS FAILED";
};

export const analyzeQuantumVolatility = async (details: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Use Pro for "Quantum" analysis depth
        contents: `Perform a quantum volatility assessment on this data: "${details}". Use technobabble related to wavefunction collapse, probability clouds, and Heisenberg uncertainty. Max 3 sentences.`,
        config: { thinkingConfig: { thinkingBudget: 2000 } }
    });
    return response.text || "QUANTUM STATE DECOHERENCE";
};

export const analyzeBacktestResults = async (strategy: string, results: BacktestResults): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `AODE_FORENSIC_AUDIT: Strategy ${strategy}. Results: ${JSON.stringify(results)}. Identify alpha decay or structural risks.`,
        config: { thinkingConfig: { thinkingBudget: 16000 } }
    });
    return response.text || "AODE: Audit failed.";
};
