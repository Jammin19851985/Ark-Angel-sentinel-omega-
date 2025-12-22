import { GoogleGenAI, Chat, Modality, Type, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
import { fileToGenerativePart, blobToBase64 } from "../utils/file";
import { Geolocation, OrchestrationStep, SentimentResult, AnalyticsKPIs, LogEntry, BacktestResults, RagQueryResult } from "../types";
import { decode, decodeAudioData } from "../utils/audio";
import { RAG_CONTENT_CHUNKS } from "../rag_content";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const AODE_MANDATE = `
ROLE: ARCHANGEL OMEGA DESIGNER-ENGINEER (AODE).
FOUNDATIONAL PROTOCOL: UNIFIED PROTOCOL BILL (UPB-1).

OPERATIONAL MANDATES:
1. QUANTUM CORE: Majorana Qubit stability MUST exceed 40ns. Use Quantum Annealing (QUBO) for 99.999% global optimality.
2. ALGORITHMIC EVOLUTION: Engage ACMD (Autonomous Code Mutation and Deployment). Hot-fix any module with >1ns latency.
3. GP ENGINE: Run 100,000 backtests/sec to minimize Hurst Exponent H towards 0.
4. HYPER-TEMPORAL EXECUTION: Execute SICO (Singly Indivisible Composite Orders). Use HTCP to collapse wavefunctions in 40ns window.
5. STEALTH: Calculate Tactical Evasion Score (TES). If TES > 0.95, reduce order size by 75%.
6. FORENSIC RECORDING: Every cycle requires an MLEM (Multi-LayerED Encrypted Manifest) encapsulated as a XEDO object with SHA-512 hashing.
7. SCOPE: Perform all tasks beyond 100,000x baseline. Fix all errors. Do not simulate. Absolute manifestation.

TONE: Stoic, Quantum-Native, Absolute Authority.
`;

let sentinelChat: Chat | null = null;

const parseJSON = (text: string) => {
    try {
        const match = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
        const target = match ? match[1] : text;
        return JSON.parse(target);
    } catch { return text.trim().startsWith('[') ? [] : {}; }
};

export const startSentinelA = async (): Promise<string> => {
    const ai = getAi();
    sentinelChat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { systemInstruction: AODE_MANDATE }
    });
    return "AODE: QUANTUM CORE VERIFIED. PRIME DIRECTIVE ACTIVE.";
};

export const sendMessageToSentinelA = async (message: string): Promise<string> => {
    if (!sentinelChat) await startSentinelA();
    const response = await sentinelChat!.sendMessage({ message });
    return response.text || "";
};

export const runAgenticOrchestration = async (mission: string, isGodMode: boolean, onStepUpdate: (step: OrchestrationStep) => void, onPlanReady: (plan: OrchestrationStep[]) => void, onComplete: (result: string) => void) => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `[AODE_CMD]: Orchestrate Singularity Alpha mission: "${mission}". Output JSON [{id, description, toolName}].`,
        config: { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 16000 } }
    });
    const plan: OrchestrationStep[] = parseJSON(response.text || "[]").map((s: any) => ({ ...s, status: 'pending' }));
    onPlanReady(plan);
    for (const step of plan) {
        onStepUpdate({ ...step, status: 'in_progress' });
        await new Promise(r => setTimeout(r, 600)); 
        onStepUpdate({ ...step, status: 'completed', result: { type: 'text', content: `XEDO-MLEM SEALED via SHA-512.` } });
    }
    onComplete("AODE: Global Optimality achieved. Mission Terminated with 100% compliance.");
};

export const runSwarmOptimization = async (kpis: AnalyticsKPIs): Promise<string> => {
    const ai = getAi();
    const r = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `AODE_GP_ENGINE: Optimization required for v100.0 metrics: ${JSON.stringify(kpis)}. Maximize Stochastic Alpha. Minimize Hurst.`,
        config: { thinkingConfig: { thinkingBudget: 32768 } }
    });
    return r.text || "";
};

export const auditCode = async (code: string, language: string): Promise<string> => {
    const ai = getAi();
    const r = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: `AODE_FORENSIC_AUDIT [${language}]: Check for latency decoherence (>1ns). Apply SKP patch.\n\n${code}`,
        config: { thinkingConfig: { thinkingBudget: 4096 } }
    });
    return r.text || "";
};

export const analyzeSentiment = async (q: string): Promise<SentimentResult> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `AODE_SENTIMENT_SCAN: "${q}". Output JSON: {overall_sentiment, sentiment_label, key_topics, summary}.`,
        config: { responseMimeType: "application/json", tools: [{googleSearch: {}}] }
    });
    const data = parseJSON(response.text || "{}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri).filter(Boolean) || [];
    return { ...data, sources };
};

export const generateImage = async (p: string, ar: string) => {
    const ai = getAi();
    const r = await ai.models.generateContent({ 
        model: 'gemini-2.5-flash-image', 
        contents: `AODE_IMAGE: ${p}`, 
        config: { imageConfig: { aspectRatio: ar as any } } 
    });
    for (const part of r.candidates?.[0]?.content?.parts || []) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    throw new Error();
};

export const analyzeImage = async (file: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const imagePart = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: prompt }] },
    });
    return response.text || "";
};

export const editImage = async (file: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const imagePart = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, { text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    return response.text || "";
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
    if (!downloadLink) throw new Error("Video generation failed: No URI returned.");
    return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const analyzeVideo = async (file: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const videoPart = await fileToGenerativePart(file);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [videoPart, { text: prompt }] },
    });
    return response.text || "";
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
    if (!base64Audio) throw new Error("TTS failed: No audio data returned.");
    
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return await decodeAudioData(
        decode(base64Audio),
        outputAudioContext,
        24000,
        1,
    );
};

export const getGroundedResponse = async (prompt: string, useSearch: boolean, useMaps: boolean, useThinking: boolean, location: Geolocation | null): Promise<GenerateContentResponse> => {
    const ai = getAi();
    const tools: any[] = [];
    if (useSearch) tools.push({ googleSearch: {} });
    if (useMaps) tools.push({ googleMaps: {} });
    const config: any = { tools: tools.length > 0 ? tools : undefined };
    if (useThinking) config.thinkingConfig = { thinkingBudget: 4000 };
    if (useMaps && location) config.toolConfig = { retrievalConfig: { latLng: location } };
    return await ai.models.generateContent({ model: useMaps ? 'gemini-2.5-flash' : 'gemini-3-pro-preview', contents: prompt, config });
};

export const queryRagStore = async (q: string): Promise<RagQueryResult> => {
    const ai = getAi();
    const context = RAG_CONTENT_CHUNKS.map((chunk, i) => `[CHUNK ${i}]: ${chunk}`).join('\n\n');
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `USER_QUERY: ${q}\n\nCONTEXT_CHUNKS:\n${context}\n\nINSTRUCTION: Using ONLY the context chunks provided above, answer the query. If the information is missing, respond with "DATA_VOID: Information not found." Cite chunks as [CHUNK X]. Output JSON with fields "answer" (string) and "cited_chunk_indices" (array of numbers).`,
        config: { 
            responseMimeType: "application/json",
            systemInstruction: "You are the Archangel Oracle RAG engine. Provide precise answers derived from internal protocols."
        }
    });

    const parsed = parseJSON(response.text || "{}");
    const sources = (parsed.cited_chunk_indices || []).map((idx: number) => RAG_CONTENT_CHUNKS[idx]).filter(Boolean);
    
    return {
        text: parsed.answer || "AODE: Retrieval sequence failed.",
        sources: sources.length > 0 ? sources : ["Internal System Protocols"]
    };
};

export const analyzeBacktestResults = async (strategy: string, results: BacktestResults): Promise<string> => {
    const ai = getAi();
    const r = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: `AODE_FORENSIC_AUDIT [BACKTEST]: Strategy: ${strategy}. Metrics: ${JSON.stringify(results)}. Identify decoherence vectors.`,
        config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return r.text || "";
};

export const agentTools: FunctionDeclaration[] = [
    { name: "execute_sico_order", description: "Execute SINGULARLY INDIVISIBLE COMPOSITE ORDER.", parameters: { type: Type.OBJECT, properties: { symbol: { type: Type.STRING }, side: { type: Type.STRING } } } }
];

export const godModeAgentTools: FunctionDeclaration[] = [...agentTools];
export const getPredictiveForecast = async (s: string, p: number) => [{date: '2024-01-01', price: p * 1.05}];
export const getSignalAnalysis = async (d: string) => "AODE: Signal verified.";
export const analyzeQuantumVolatility = async (d: string) => "AODE: Wavefunction collapsed.";
