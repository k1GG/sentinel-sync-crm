import { GoogleGenAI, Type } from "@google/genai";
import { SentimentAnalysis, LogEntry, RiskLevel } from "../types";

const callWithRetry = async <T>(apiCall: () => Promise<T>, retries = 5, delay = 3000): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isRateLimit = errorMsg.includes('429') || error?.status === 429;
    if (retries > 0 && isRateLimit) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(apiCall, retries - 1, delay * 2);
    }
    throw error;
  }
};

const getAIClient = () => {
  const apiKey = process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

export const analyzeSentiment = async (logs: LogEntry[], companyName?: string): Promise<SentimentAnalysis> => {
  const logContext = logs.map(l => `[${l.timestamp}] ${l.sender}: ${l.message}`).join('\n');
  const fn = async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `Analyze logs for client "${companyName || 'the client'}". Focus on Hinglish sentiment velocity. LOGS: ${logContext}`,
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
            industryContextSummary: { type: Type.STRING }
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
    return {
      healthScore: 50,
      riskClassification: RiskLevel.STABLE,
      silentSignal: "Clearance restricted. Check Secure Link status.",
      recoveryPlan: ["Immediate manual review recommended"],
      engagementDraft: "Checking in to ensure everything is running smoothly.",
      executiveSummary: "Forensic scan failed.",
      industryContextSummary: "Market volatility detected."
    };
  }
};

export const analyzeExternalShocks = async (industry: string): Promise<any> => {
  const fn = async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `Search for Indian policy updates affecting ${industry}.`,
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
                  actionableTip: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{"shocks": []}');
  };
  try { return await callWithRetry(fn); } catch { return { shocks: [] }; }
};

export const generateBattlePlan = async (clientName: string, company: string, riskLevel: string): Promise<any> => {
  const fn = async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Tactical War-Plan for ${clientName} (${company}). Status: ${riskLevel}.`,
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
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  };
  return await callWithRetry(fn);
};

export const generateRolePlayResponse = async (clientContext: string, userMessage: string): Promise<string> => {
  const fn = async () => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Persona: ${clientContext}\nUser: ${userMessage}`,
      config: { temperature: 0.9 }
    });
    return response.text || "No output.";
  };
  return await callWithRetry(fn);
};

export const generateSupportResponse = async (history: any[], userMessage: string, context?: string): Promise<string> => {
  const fn = async () => {
    const ai = getAIClient();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction: "Sentinel Support. Context: " + context },
    });
    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "Communication failure.";
  };
  return await callWithRetry(fn);
};
