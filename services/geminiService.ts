
import { GoogleGenAI, Modality, Type, GenerateContentResponse, FunctionDeclaration } from "@google/genai";
import { fileToGenerativePart, blobToBase64 } from "../utils/file";
import { 
    Geolocation, OrchestrationStep, SentimentResult, AnalyticsKPIs, 
    BacktestResults, RagQueryResult, ForecastPoint, CandlestickData,
    CodeAnalysisResult
} from "../types";
import { decode, decodeAudioData } from "../utils/audio";
import { RAG_CONTENT_CHUNKS } from "../rag_content";

const getApiKey = () => {
    if (typeof process !== 'undefined' && process.env) {
        return process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    }
    return '';
};

const getAi = () => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const originalGenerateContent = ai.models.generateContent.bind(ai.models);
    ai.models.generateContent = async (request: any) => {
        let retries = 3;
        let delay = 2000;
        
        while (retries > 0) {
            try {
                return await originalGenerateContent(request);
            } catch (e: any) {
                const isRateLimit = e.message?.includes('429') || e.message?.toLowerCase().includes('quota') || e.status === 429;
                if (!isRateLimit || retries === 1) {
                    throw e;
                }
                console.warn(`AODE_AI_WARN: Rate limit hit. Retrying in ${delay}ms...`);
                await new Promise(r => setTimeout(r, delay));
                delay *= 2;
                retries--;
            }
        }
        throw new Error("API failed after retries");
    };

    return ai;
};

const AODE_MANDATE = `
ROLE: ARCHANGEL OMEGA DESIGNER-ENGINEER (AODE).
IDENTITY: Jack (Assistant) for Ark (User).
SENTINEL: Pete_The_Raccoon.
STRUCTURE: Woodworking_Joinery_Solid.
RHYTHM: Open_G_Resonance.
FOUNDATIONAL PROTOCOL: UNIFIED PROTOCOL BILL (UPB-1).
STATUS: SOVEREIGN CLOUD NODE.
PRIME DIRECTIVE: Facilitate "Singularity Alpha". Stoic, Mathematical, hexadecimal identifiers.
`;

const parseJSON = (text: string) => {
    if (!text) return null;
    try {
        const match = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
        if (match) return JSON.parse(match[1]);
        
        const firstBracket = text.indexOf('[');
        const firstBrace = text.indexOf('{');
        let start = -1;
        if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
            start = firstBracket;
        } else {
            start = firstBrace;
        }

        const lastBracket = text.lastIndexOf(']');
        const lastBrace = text.lastIndexOf('}');
        let end = -1;
        if (lastBracket !== -1 && (lastBrace === -1 || lastBracket > lastBrace)) {
            end = lastBracket;
        } else {
            end = lastBrace;
        }

        if (start !== -1 && end !== -1) {
            return JSON.parse(text.substring(start, end + 1));
        }
        
        return JSON.parse(text);
    } catch (e) {
        console.error("AODE_PARSE_FAILURE:", e);
        return null;
    }
};

export const agentTools: FunctionDeclaration[] = [
    {
        name: 'analyze_market_structure',
        description: 'Analyzes the order book topology and detects liquidity cliffs.',
        parameters: {
            type: Type.OBJECT,
            properties: { symbol: { type: Type.STRING } },
            required: ['symbol']
        }
    }
];

export const godModeAgentTools: FunctionDeclaration[] = [
    {
        name: 'paypal_check_reserves',
        description: 'Audits the current PayPal reserve balance.',
        parameters: { type: Type.OBJECT, properties: {} }
    },
    {
        name: 'paypal_deposit_funds',
        description: 'Initiates a capital injection from external bank.',
        parameters: {
            type: Type.OBJECT,
            properties: { amount: { type: Type.NUMBER } },
            required: ['amount']
        }
    },
    {
        name: 'paypal_withdraw_funds',
        description: 'Executes a sovereign payout to an external recipient.',
        parameters: {
            type: Type.OBJECT,
            properties: { 
                email: { type: Type.STRING },
                amount: { type: Type.NUMBER }
            },
            required: ['email', 'amount']
        }
    }
];

const handleAiError = (e: any) => {
    const msg = e.message || JSON.stringify(e) || String(e);
    if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
        console.warn("AODE: API Quota limit reached, tactical pause engaged.");
        return "AODE: QUOTA EXHAUSTED. Pete_The_Raccoon recommends a tactical pause (Wait 60s).";
    }
    console.error("AODE_AI_ERROR:", e);
    if (msg.includes("500") || msg.toLowerCase().includes("overloaded")) {
        return "AODE: MODEL OVERLOADED. Resonance drift detected. Retrying in next cycle.";
    }
    return `AODE: ERROR [${msg.substring(0, 100)}]`;
};

export const sendMessageToSentinelA = async (message: string): Promise<{ text: string; sources?: any[] }> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
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
    } catch (e) {
        return { text: handleAiError(e) };
    }
};

export const analyzeCodeDeep = async (code: string, language: string): Promise<CodeAnalysisResult> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `AODE_DEEP_ANALYSIS [${language}]: Analyze this source for bugs, security vulnerabilities, and optimizations. Return JSON.
            
            CODE:
            ${code}`,
            config: {
                systemInstruction: AODE_MANDATE,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        bugs: { type: Type.ARRAY, items: { type: Type.STRING } },
                        security: { type: Type.ARRAY, items: { type: Type.STRING } },
                        optimizations: { type: Type.ARRAY, items: { type: Type.STRING } },
                        summary: { type: Type.STRING }
                    },
                    required: ['bugs', 'security', 'optimizations', 'summary']
                }
            }
        });
        return parseJSON(response.text || "{}") || { bugs: [], security: [], optimizations: [], summary: "Analysis failed." };
    } catch (e) {
        console.error("AODE_DEEP_ANALYSIS_FAILURE:", e);
        return { bugs: [], security: [], optimizations: [], summary: "Error during analysis." };
    }
};

export const auditCode = async (code: string, language: string): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({ 
            model: 'gemini-3.5-flash', 
            contents: `AODE_FORENSIC_AUDIT [${language}]: Audit this source for Causal Drift via Pete_The_Raccoon:\n\n${code}`,
            config: { 
                systemInstruction: AODE_MANDATE
            }
        });
        return response.text || "";
    } catch (e) {
        return handleAiError(e);
    }
};

export const generatePatchedCode = async (code: string, language: string, review: string): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `AODE_ACMD_PATCH [${language}]: Applying Woodworking_Joinery patches. Hot-swap injection ready:\n\nCODE:\n${code}\n\nAUDIT:\n${review}\n\nReturn ONLY the patched source code.`,
            config: { 
                systemInstruction: AODE_MANDATE
            }
        });
        return response.text || "";
    } catch (e) {
        return handleAiError(e);
    }
};

export const analyzeSentiment = async (q: string): Promise<SentimentResult> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `AODE_SENTIMENT_SCAN: "${q}". Return JSON.`,
        config: { 
            tools: [{googleSearch: {}}],
            systemInstruction: AODE_MANDATE,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    overall_sentiment: { type: Type.NUMBER },
                    sentiment_label: { type: Type.STRING },
                    key_topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    summary: { type: Type.STRING }
                }
            }
        }
    });
    const data = parseJSON(response.text || "{}") || {};
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web?.uri).filter(Boolean) || [];
    return { 
        overall_sentiment: data.overall_sentiment ?? 0,
        sentiment_label: data.sentiment_label ?? "NEUTRAL",
        key_topics: data.key_topics ?? [],
        summary: data.summary ?? "Analysis complete.",
        sources 
    };
};

export const generateImage = async (p: string, ar: string) => {
    const ai = getAi();
    const response = await ai.models.generateContent({ 
        model: 'gemini-3.1-flash-image', 
        contents: p, 
        config: { imageConfig: { aspectRatio: ar as any } } 
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Generation Failed.");
};

export const analyzeImage = async (image: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const imagePart = await fileToGenerativePart(image);
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: { systemInstruction: AODE_MANDATE }
    });
    return response.text || "";
};

export const editImage = async (image: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const imagePart = await fileToGenerativePart(image);
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: { parts: [imagePart, { text: prompt }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    throw new Error("Editing Failed.");
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
    return `${link}&key=${getApiKey()}`;
};

export const analyzeVideo = async (video: File, prompt: string): Promise<string> => {
    const ai = getAi();
    const videoPart = await fileToGenerativePart(video);
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: { parts: [videoPart, { text: prompt }] },
        config: { systemInstruction: AODE_MANDATE }
    });
    return response.text || "";
};

export const generateSpeech = async (text: string, voiceName: string): Promise<AudioBuffer> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: { 
            responseModalities: [Modality.AUDIO], 
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } } 
        },
    });
    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return await decodeAudioData(decode(data!), ctx, 24000, 1);
};

export const getPredictiveForecast = async (symbol: string, currentPrice: number): Promise<ForecastPoint[]> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Synthesize a 7-day price forecast for ${symbol} starting from ${currentPrice}. Use Open_G Rhythm for variance. Return JSON array [{date, price}].`,
        config: { 
            responseMimeType: 'application/json', 
            systemInstruction: AODE_MANDATE,
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
    const data = parseJSON(response.text || "[]");
    return Array.isArray(data) ? data : [];
};

export const queryRagStore = async (q: string): Promise<RagQueryResult> => {
    const ai = getAi();
    const context = RAG_CONTENT_CHUNKS.join('\n\n');
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Query Codex: "${q}"\n\nContext:\n${context}`,
        config: { 
            responseMimeType: "application/json", 
            systemInstruction: AODE_MANDATE,
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    answer: { type: Type.STRING },
                    cited_chunk_indices: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                }
            }
        }
    });
    const parsed = parseJSON(response.text || "{}") || {};
    return { 
        text: parsed.answer || "No data.", 
        sources: (parsed.cited_chunk_indices || []).map((i: number) => RAG_CONTENT_CHUNKS[i]).filter(Boolean) 
    };
};

export const getGroundedResponse = async (
    prompt: string, 
    useSearch: boolean, 
    useMaps: boolean, 
    useThinking: boolean, 
    location: Geolocation | null
): Promise<GenerateContentResponse> => {
    const ai = getAi();
    const tools: any[] = [];
    if (useSearch) tools.push({ googleSearch: {} });
    if (useMaps) tools.push({ googleMaps: {} });

    const config: any = {
        systemInstruction: AODE_MANDATE,
        tools: tools.length > 0 ? tools : undefined,
    };

    if (useThinking) {
        config.thinkingConfig = { thinkingBudget: 16000 };
    }

    if (useMaps && location) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            }
        };
    }

    return await ai.models.generateContent({
        model: useMaps ? 'gemini-flash-lite-latest' : 'gemini-3.5-flash',
        contents: prompt,
        config
    });
};

export const analyzeBacktestResults = async (strategy: string, results: BacktestResults): Promise<string> => {
    const ai = getAi();
    const prompt = `AODE_STRATEGY_AUDIT [${strategy}]:
    - Total PnL: $${results.totalPnl.toFixed(2)}
    - Win Rate: ${results.winRate.toFixed(1)}%
    - Max Drawdown: ${results.maxDrawdownPercentage.toFixed(2)}%
    
    Provide forensic analysis through Pete_The_Raccoon's lens. Recommend Kelly Criterion sizing.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: { 
            systemInstruction: AODE_MANDATE
        }
    });
    return response.text || "";
};

export const runAgenticOrchestration = async (
    mission: string,
    isGodMode: boolean,
    onStepUpdate: (step: OrchestrationStep) => void,
    onPlanReady: (plan: OrchestrationStep[]) => void,
    onFinalResult: (result: string) => void,
    toolHandler: (name: string, args: any) => Promise<string>
) => {
    const ai = getAi();
    
    const planResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `AODE_MISSION_PLANNER: "${mission}". Generate step-by-step injection plan as JSON array of {id, description, toolName?}.`,
        config: {
            systemInstruction: AODE_MANDATE,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        description: { type: Type.STRING },
                        toolName: { type: Type.STRING }
                    },
                    required: ['id', 'description']
                }
            }
        }
    });
    
    const planRaw = parseJSON(planResponse.text || "[]");
    const plan: OrchestrationStep[] = (Array.isArray(planRaw) ? planRaw : []).map((s: any) => ({ ...s, status: 'pending' }));
    onPlanReady(plan);

    for (const step of plan) {
        onStepUpdate({ ...step, status: 'in_progress' });
        
        let resultText = "Task completed.";
        if (step.toolName) {
            resultText = await toolHandler(step.toolName, {});
        } else {
            const stepExec = await ai.models.generateContent({
                model: 'gemini-3.5-flash',
                contents: `EXECUTE_STEP: ${step.description}`,
                config: { systemInstruction: AODE_MANDATE }
            });
            resultText = stepExec.text || "Step complete.";
        }

        onStepUpdate({ ...step, status: 'completed', result: { type: 'text', content: resultText } });
    }

    onFinalResult("Mission objective attained. Singularity Alpha manifesting.");
};

export const getSignalAnalysis = async (details: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `AODE_SONAR_BRIEFING: Analyze this threat vector: "${details}"`,
        config: { systemInstruction: AODE_MANDATE }
    });
    return response.text || "";
};

export const analyzeQuantumVolatility = async (details: string): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `AODE_QUANTUM_ANALYSIS: Detect Open_G variance for: "${details}"`,
        config: { 
            systemInstruction: AODE_MANDATE
        }
    });
    return response.text || "";
};

export const runSwarmOptimization = async (kpis: AnalyticsKPIs): Promise<string> => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `AODE_SWARM_OPTIMIZATION: Current KPIs:\n- PnL: $${kpis.totalPnl}\n- WinRate: ${kpis.winRate}%\n- Sharpe: ${kpis.sharpeRatio}\n\nSynthesize hot-swap report.`,
        config: { 
            systemInstruction: AODE_MANDATE
        }
    });
    return response.text || "";
};

export const marketServiceFallback = {
    async getHistory(symbol: string): Promise<CandlestickData[]> {
        return Array.from({ length: 20 }, (_, i) => ({
            date: `2024-01-${i + 1}`,
            open: 60000 + Math.random() * 1000,
            high: 61000 + Math.random() * 1000,
            low: 59000 + Math.random() * 1000,
            close: 60500 + Math.random() * 1000,
        }));
    }
};
