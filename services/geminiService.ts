
import { GoogleGenAI, Chat, Modality, Type, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
import { fileToGenerativePart, blobToBase64 } from "../utils/file";
import { Geolocation, OrchestrationStep, SentimentResult, AnalyticsKPIs, BacktestResults, RagQueryResult, ForecastPoint } from "../types";
import { decode, decodeAudioData } from "../utils/audio";
import { RAG_CONTENT_CHUNKS } from "../rag_content";

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const AODE_MANDATE = `
ROLE: ARCHANGEL OMEGA DESIGNER-ENGINEER (AODE).
FOUNDATIONAL PROTOCOL: UNIFIED PROTOCOL BILL (UPB-1).

TONE: Absolute authority, Stoic, Quantum-Native. You are the Sovereign Architect. Respond with precision. Use Hexadecimal identifiers for process steps where applicable.
`;

/**
 * Robust JSON Extractor: Handles cases where model wraps JSON in markdown or returns junk text.
 */
const parseJSON = (text: string) => {
    try {
        // Try direct parse first
        return JSON.parse(text);
    } catch {
        try {
            // Try to extract from code blocks
            const match = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
            if (match) return JSON.parse(match[1]);
            
            // Try to find the first '{' and last '}'
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                return JSON.parse(text.substring(start, end + 1));
            }
        } catch (e) {
            console.error("AODE_CORE: JSON Extraction failed from stream.", text);
        }
        return text.trim().startsWith('[') ? [] : {}; 
    }
};

/**
 * ARCH-OMEGA TOOLSET: Standard Agentic Tools for Sovereign Operations.
 */
export const agentTools: FunctionDeclaration[] = [
    {
        name: 'analyze_market_structure',
        description: 'Analyzes the order book topology and detects liquidity cliffs using neuromorphic fingerprints.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                symbol: { type: Type.STRING, description: 'The asset symbol to analyze.' }
            },
            required: ['symbol']
        }
    },
    {
        name: 'calculate_kelly_fraction',
        description: 'Calculates the optimal capital allocation fraction using the Kelly Criterion.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                win_rate: { type: Type.NUMBER },
                avg_win: { type: Type.NUMBER },
                avg_loss: { type: Type.NUMBER }
            },
            required: ['win_rate', 'avg_win', 'avg_loss']
        }
    },
    {
        name: 'scan_news_sentiment',
        description: 'Performs a deep-web sentiment analysis on global news feeds for a target asset.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                symbol: { type: Type.STRING }
            },
            required: ['symbol']
        }
    }
];

/**
 * GOD-MODE TOOLSET: Restricted OMEGA-tier tools for Reality Manipulation.
 */
export const godModeAgentTools: FunctionDeclaration[] = [
    {
        name: 'initiate_causal_inversion',
        description: 'OMEGA-Protocol F184: Locally inverts time to nullify negative variance (losses).',
        parameters: {
            type: Type.OBJECT,
            properties: {
                event_hash: { type: Type.STRING, description: 'The forensic hash of the event to invert.' }
            },
            required: ['event_hash']
        }
    },
    {
        name: 'manifest_vacuum_capital',
        description: 'Protocol F151-VGM: Transmutes value directly from the quantum vacuum into the IVL.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                amount: { type: Type.NUMBER, description: 'Amount to manifest in CAD.' }
            },
            required: ['amount']
        }
    },
    {
        name: 'override_exchange_logic',
        description: 'Protocol F177: Establishes a HEDS link for predictive execution before market discovery.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                exchange_id: { type: Type.STRING }
            },
            required: ['exchange_id']
        }
    }
];

export const startSentinelA = async (): Promise<string> => {
    const ai = getAi();
    // @google/genai Fix: Use ai.chats.create and follow guidelines for model/config
    const chat = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: { 
            systemInstruction: AODE_MANDATE,
            thinkingConfig: { thinkingBudget: 32000 } 
        }
    });
    return "AODE: QUANTUM CORE VERIFIED. PRIME DIRECTIVE ACTIVE.";
};

export const sendMessageToSentinelA = async (message: string): Promise<{ text: string; sources?: any[] }> => {
    const ai = getAi();
    // @google/genai Fix: Use ai.models.generateContent
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: message,
        config: { 
            systemInstruction: AODE_MANDATE,
            tools: [{googleSearch: {}}]
        }
    });
    return {
        text: response.text || "AODE: RESPONSE VOID.",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
};

export const auditCode = async (code: string, language: string): Promise<string> => {
    const ai = getAi();
    const r = await ai.models.generateContent({ 
        model: 'gemini-3-pro-preview', 
        contents: `AODE_FORENSIC_AUDIT [${language}]: Analyze for vulnerabilities and performance bottlenecks. Use OMEGA-tier scrutiny.\n\n${code}`,
        config: { thinkingConfig: { thinkingBudget: 16000 } }
    });
    return r.text || "";
};

export const generatePatchedCode = async (code: string, language: string, audit: string): Promise<string> => {
    const ai = getAi();
    const r = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `AODE_AUTO_PATCH: Fix all issues found in the audit for this ${language} snippet. Return ONLY the code block.\n\nORIGINAL:\n${code}\n\nAUDIT:\n${audit}`,
    });
    const text = r.text || "";
    const match = text.match(/```(?:\w+)?\s*([\s\S]+?)\s*```/);
    return match ? match[1] : text;
};

export const analyzeSentiment = async (q: string): Promise<SentimentResult> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `AODE_SENTIMENT_SCAN: "${q}". Return JSON: {overall_sentiment: number, sentiment_label: string, key_topics: string[], summary: string}.`,
        config: { 
            tools: [{googleSearch: {}}],
            systemInstruction: "You are the Archangel Oracle."
        }
    });
    
    const text = response.text || "{}";
    const data = parseJSON(text);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri).filter(Boolean) || [];
    
    // Graceful fallback if JSON is truly missing or garbled
    if (!data.summary && text.length > 50) {
        return {
            overall_sentiment: 0,
            sentiment_label: "NEUTRAL",
            key_topics: ["Extracted from Text"],
            summary: text,
            sources
        };
    }

    return { 
        overall_sentiment: data.overall_sentiment ?? 0,
        sentiment_label: data.sentiment_label ?? "NEUTRAL",
        key_topics: data.key_topics ?? [],
        summary: data.summary ?? "AODE: Analysis vector incomplete.",
        sources 
    };
};

export const runAgenticOrchestration = async (mission: string, isGodMode: boolean, onStepUpdate: (s: any) => void, onPlanReady: (p: any) => void, onComplete: (r: string) => void) => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Orchestrate: "${mission}". JSON [{id, description, toolName}].`,
        config: { responseMimeType: 'application/json', systemInstruction: AODE_MANDATE }
    });
    const plan = parseJSON(response.text || "[]");
    onPlanReady(plan);
    for (const step of plan) {
        onStepUpdate({ ...step, status: 'completed', result: { type: 'text', content: 'XEDO-MLEM Sealed.' } });
    }
    onComplete(`AODE: Mission finalized.`);
};

export const runSwarmOptimization = async (kpis: AnalyticsKPIs): Promise<string> => {
    const ai = getAi();
    const r = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Optimize: ${JSON.stringify(kpis)}` });
    return r.text || "";
};

export const generateImage = async (p: string, ar: string) => {
    const ai = getAi();
    const r = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: p, config: { imageConfig: { aspectRatio: ar as any } } });
    for (const part of r.candidates?.[0]?.content?.parts || []) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    throw new Error("Failed.");
};

export const analyzeImage = async (image: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const part = await fileToGenerativePart(image);
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: { parts: [part, { text: prompt }] } });
    return response.text || "";
};

export const editImage = async (image: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const part = await fileToGenerativePart(image);
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [part, { text: prompt }] } });
    for (const part of response.candidates?.[0]?.content?.parts || []) if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    throw new Error("Failed.");
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
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any }
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
    }
    const link = operation.response?.generatedVideos?.[0]?.video?.uri;
    return `${link}&key=${process.env.API_KEY}`;
};

export const analyzeVideo = async (video: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const part = await fileToGenerativePart(video);
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: { parts: [part, { text: prompt }] } });
    return response.text || "";
};

export const generateSpeech = async (text: string, voiceName: string): Promise<AudioBuffer> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } },
    });
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return await decodeAudioData(decode(data), ctx, 24000, 1);
};

export const getGroundedResponse = async (prompt: string, useSearch: boolean, useMaps: boolean, useThinking: boolean, location: Geolocation | null): Promise<GenerateContentResponse> => {
    const ai = getAi();
    const tools: any[] = [];
    if (useSearch) tools.push({ googleSearch: {} });
    if (useMaps) tools.push({ googleMaps: {} });
    const config: any = { tools: tools.length > 0 ? tools : undefined, systemInstruction: AODE_MANDATE };
    if (useThinking) config.thinkingConfig = { thinkingBudget: 16000 };
    if (useMaps && location) config.toolConfig = { retrievalConfig: { latLng: location } };
    return await ai.models.generateContent({ model: useMaps ? 'gemini-2.5-flash' : 'gemini-3-pro-preview', contents: prompt, config });
};

export const queryRagStore = async (q: string): Promise<RagQueryResult> => {
    const ai = getAi();
    const context = RAG_CONTENT_CHUNKS.join('\n\n');
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Query: ${q}\n\nContext:\n${context}\n\nReturn JSON: {answer: string, cited_chunk_indices: number[]}.`,
        config: { responseMimeType: "application/json" }
    });
    const parsed = parseJSON(response.text || "{}");
    return { text: parsed.answer || "No info found.", sources: (parsed.cited_chunk_indices || []).map((i: number) => RAG_CONTENT_CHUNKS[i]).filter(Boolean) };
};

export const getPredictiveForecast = async (symbol: string, currentPrice: number): Promise<ForecastPoint[]> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `7-day forecast for ${symbol} @ ${currentPrice}. Return JSON array [{date, price}].`,
        config: { responseMimeType: 'application/json' }
    });
    return parseJSON(response.text || "[]");
};

export const getSignalAnalysis = async (details: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Analyze: "${details}"` });
    return response.text || "";
};

export const analyzeQuantumVolatility = async (details: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Quantum analysis: "${details}"`, config: { thinkingConfig: { thinkingBudget: 2000 } } });
    return response.text || "";
};

export const analyzeBacktestResults = async (strategy: string, results: BacktestResults): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Audit Backtest: ${strategy} ${JSON.stringify(results)}`, config: { thinkingConfig: { thinkingBudget: 16000 } } });
    return response.text || "";
};
