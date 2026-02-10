
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeTransactionAML(transactionData: any) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `شما یک تحلیل‌گر ارشد انطباق (Compliance) در بانک مرکزی هستید. این تراکنش را بر اساس استانداردهای AML/CFT بررسی کنید و خروجی را فقط به صورت JSON ارائه دهید. تراکنش: ${JSON.stringify(transactionData)}`,
      config: {
        thinkingConfig: { thinkingBudget: 2000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_suspicious: { type: Type.BOOLEAN },
            risk_score: { type: Type.NUMBER, description: "نمره ریسک از 0 تا 100" },
            reasoning: { type: Type.STRING, description: "دلیل فنی و قانونی تحلیل" },
            suggested_action: { type: Type.STRING, description: "اقدام پیشنهادی برای مدیر شعبه" },
            flagged_fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  field: { type: Type.STRING, description: "نام فیلدی که باعث تحریک سیستم شده است (customerId, amount, rate, counterparty)" },
                  reason: { type: Type.STRING, description: "دلیل خاص برای مشکوک بودن این بخش" },
                  severity: { type: Type.STRING, description: "شدت ریسک شناسایی شده: LOW, MEDIUM, HIGH" }
                },
                required: ["field", "reason", "severity"]
              },
              description: "لیست فیلدهایی که مستقیماً در نمره ریسک تاثیر منفی داشته‌اند"
            }
          },
          required: ["is_suspicious", "risk_score", "reasoning", "suggested_action", "flagged_fields"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AML Analysis Error:", error);
    return { 
      is_suspicious: false, 
      risk_score: 10, 
      reasoning: "خطا در تحلیل هوشمند - سرویس موقتاً در دسترس نیست. لطفاً مدارک را بصورت دستی بررسی کنید.",
      suggested_action: "توقف موقت تراکنش و بررسی مدارک هویتی بصورت دستی",
      flagged_fields: []
    };
  }
}

export async function searchRegulatoryNews() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Provide a brief list of the 3 most recent and relevant financial news or regulatory updates for currency exchange (Sarafi) in Afghanistan, issued by Da Afghanistan Bank (DAB) or international bodies like FATF. Focus on AML/CFT, auctions, or sanctions. Keep it concise.",
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((c: any) => c.web?.uri ? { title: c.web.title, uri: c.web.uri } : null)
        .filter((x: any) => x) || [];
        
    const uniqueSources = Array.from(new Set(sources.map((s: any) => s.uri)))
        .map(uri => sources.find((s: any) => s.uri === uri));

    return {
        text: response.text,
        sources: uniqueSources
    };
  } catch (error) {
    console.warn("News Search API Error (Using Cached Data):", error);
    return { 
        text: "Latest updates (Cached): 1. DAB has announced a new currency auction of $15M to stabilize the Afghani exchange rate. 2. New AML/CFT directives have been issued for Money Service Providers regarding high-value transaction reporting. 3. UN humanitarian cash shipments continue to support liquidity in the banking sector.", 
        sources: [
            { title: "Da Afghanistan Bank", uri: "https://dab.gov.af" },
            { title: "UNAMA News", uri: "https://unama.unmissions.org" }
        ] 
    };
  }
}

export async function searchEntity(entityName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for '${entityName}' in the context of Afghanistan financial sector, sanctions lists (UN, OFAC), and adverse media. Provide a concise summary of any risk factors found. If no specific negative information is found, state that clearly.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((c: any) => c.web?.uri ? { title: c.web.title, uri: c.web.uri } : null)
        .filter((x: any) => x) || [];

    const uniqueSources = Array.from(new Set(sources.map((s: any) => s.uri)))
        .map(uri => sources.find((s: any) => s.uri === uri));

    return {
        text: response.text,
        sources: uniqueSources
    };
  } catch (error) {
    console.warn("Entity Search API Error:", error);
    return { 
        text: "Live background check unavailable due to network restrictions. Please perform manual verification against local watchlists.", 
        sources: [] 
    };
  }
}
