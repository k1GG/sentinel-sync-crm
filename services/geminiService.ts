
import { GoogleGenAI, Type } from "@google/genai";
import { SentimentAnalysis, LogEntry, RiskLevel } from "../types";

/**
 * Enhanced Utility to handle API calls with aggressive exponential backoff.
 */
const callWithRetry = async <T>(apiCall: () => Promise<T>, retries = 5, delay = 3000): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isRateLimit = errorMsg.includes('429') || error?.status === 429;
    
    if (retries > 0 && isRateLimit) {
      console.warn(`[SENTINEL-RETRY] Rate limit hit. Waiting ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(apiCall, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const analyzeSentiment = async (logs: LogEntry[], companyName?: string): Promise<SentimentAnalysis> => {
  const logContext = logs.map(l => `[${l.timestamp}] ${l.sender}: ${l.message}`).join('\n');
  
  const fn = async () => {
    // ALWAYS initialize the client inside the function to capture the latest process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `Analyze logs for client "${companyName || 'the client'}".
      Linguistic: Hinglish/Velocity/Sentiment.
      Grounding: Check news for "${companyName}" or industry in India (last 30 days).
      
      LOGS:
      ${logContext}
      
      Output strict JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.NUMBER },
            riskClassification: { type: Type.STRING },
            silentSignal: { type: Type.STRING },
            recoveryPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            engagementDraft: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            industryContextSummary: { type: Type.STRING },
            marketSignals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  url: { type: Type.STRING },
                  source: { type: Type.STRING },
                  impact: { type: Type.STRING }
                }
              }
            }
          },
          required: ["healthScore", "riskClassification", "silentSignal", "recoveryPlan", "engagementDraft", "executiveSummary", "industryContextSummary"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  };

  try {
    return await callWithRetry(fn);
  } catch (e: any) {
    console.error("Sentiment analysis failure:", e);
    return {
      healthScore: 50,
      riskClassification: RiskLevel.STABLE,
      silentSignal: "Clearance restricted. Check Secure Link status.",
      recoveryPlan: ["Immediate manual review recommended"],
      engagementDraft: "Checking in to ensure everything is running smoothly.",
      executiveSummary: "Forensic scan failed. Please re-authorize the API engine in Settings.",
      industryContextSummary: "Standard Indian market volatility detected."
    };
  }
};

export const analyzeExternalShocks = async (industry: string): Promise<any> => {
  const fn = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `Search for new Indian government policies released in the last 60 days affecting the "${industry}" sector in India.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            shocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  source: { type: Type.STRING },
                  impactScore: { type: Type.NUMBER },
                  summary: { type: Type.STRING },
                  complianceDeadline: { type: Type.STRING },
                  actionableTip: { type: Type.STRING }
                },
                required: ["title", "source", "impactScore", "summary", "actionableTip"]
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{"shocks": []}');
  };

  try {
    return await callWithRetry(fn);
  } catch (e) {
    return { shocks: [] };
  }
};

export const generateBattlePlan = async (clientName: string, company: string, riskLevel: string): Promise<any> => {
  const fn = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Tactical War-Plan for high-risk account. CLIENT: ${clientName} (${company}) Status: ${riskLevel}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            psychologicalEdge: { type: Type.STRING },
            defensivePivot: { type: Type.STRING },
            expansionHook: { type: Type.STRING },
            nuclearOption: { type: Type.STRING },
            stakeholderIntel: { type: Type.STRING },
            revenueSwapOffer: { type: Type.STRING }
          },
          required: ["psychologicalEdge", "defensivePivot", "expansionHook", "nuclearOption", "stakeholderIntel", "revenueSwapOffer"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  };
  return await callWithRetry(fn);
};

export const generateRolePlayResponse = async (clientContext: string, userMessage: string): Promise<string> => {
  const fn = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Digital twin persona: ${clientContext}\nUSER: ${userMessage}`,
      config: { temperature: 0.9 }
    });
    return response.text || "No output.";
  };
  return await callWithRetry(fn);
};

export const generateSupportResponse = async (history: { role: 'user' | 'model', text: string }[], userMessage: string, context?: string): Promise<string> => {
  const fn = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction: "Sentinel-Sync Assistant. Focus Context: " + context },
    });
    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "Communication error.";
  };
  return await callWithRetry(fn);
};
