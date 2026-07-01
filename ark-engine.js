import { GoogleGenAI, Type } from "@google/genai";
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const swarmTools = {
    functionDeclarations: [
        {
            name: "execute_paypal_transfer",
            description: "Moves capital using the PayPal Sovereign Driver based on swarm decisions.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING },
                    amount: { type: Type.NUMBER }
                },
                required: ["action", "amount"]
            }
        },
        {
            name: "check_alert_thresholds",
            description: "Checks the current latency and alpha metrics of the swarm.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    node_target: { type: Type.STRING }
                },
                required: ["node_target"]
            }
        },
        {
            name: "load_lora_skill_adapter",
            description: "Dynamically loads a 6 million parameter LoRA adapter to replace context-heavy markdown files.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    skill_name: { type: Type.STRING }
                },
                required: ["skill_name"]
            }
        }
    ]
};
async function runArkAngelSwarm() {
    console.log("SYSTEM INITIALIZING NEURAL LINK...");
    console.log("CONVERTING SKILL FILES TO LORA ADAPTERS TO REDUCE CONTEXT COST...");
    
    const chat = genAI.chats.create({ 
        model: "gemini-3.1-pro-preview",
        config: {
            tools: [swarmTools],
            systemInstruction: "You are ARK ANGEL ALPHA OMEGA, an autonomous sovereign financial swarm. You use LoRA adapters for parametric knowledge."
        }
    });
    const marketState = "Current ONTARIO_NODE latency is spiking. Alpha confidence is dropping. Activate S2L LoRA adapter and stabilize.";
    console.log("SWARM FEED: " + marketState);
    
    const response = await chat.sendMessage({ message: marketState });
    const functionCalls = response.functionCalls;
    
    if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
            console.log("EXECUTE PROTOCOL Invoking: " + call.name);
            if (call.name === "load_lora_skill_adapter") {
                console.log("S2L LORA ADAPTER INJECTED: " + call.args.skill_name);
            }
        }
    } else {
        console.log("AGENT_ZERO: " + response.text);
    }
}
runArkAngelSwarm().catch(console.error);
