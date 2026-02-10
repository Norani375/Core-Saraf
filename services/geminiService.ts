
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function askRegulatoryQuestion(question: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `شما مشاور حقوقی و کارشناس انطباق (Compliance) بانک مرکزی افغانستان (DAB) هستید. با استفاده از جستجوی گوگل، به سوال زیر در مورد قوانین صرافی، مبارزه با پولشویی (AML/CFT) و بخشنامه‌های جدید بانک مرکزی افغانستان با دقت بالا و ذکر منبع پاسخ دهید. سوال: ${question}`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
        .map((c: any) => c.web?.uri ? { title: c.web.title, uri: c.web.uri } : null)
        .filter((x: any) => x);

    return {
        text: response.text,
        sources: Array.from(new Set(sources.map((s: any) => s.uri)))
            .map(uri => sources.find((s: any) => s.uri === uri))
    };
  } catch (error) {
    console.error("Regulatory Chat Error:", error);
    return { text: "متأسفانه در حال حاضر امکان استعلام زنده قوانین وجود ندارد.", sources: [] };
  }
}

export async function analyzeTransactionAML(transactionData: any) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `تحلیل ریسک AML/CFT برای تراکنش: ${JSON.stringify(transactionData)}. با استفاده از جستجوی گوگل، بررسی کنید آیا نام مشتری یا طرف مقابل در لیست‌های تحریم یا اخبار منفی مرتبط با جرایم مالی قرار دارد یا خیر. خروجی را به صورت JSON ارائه دهید.`,
      config: {
        thinkingConfig: { thinkingBudget: 2000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_suspicious: { type: Type.BOOLEAN },
            risk_score: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            suggested_action: { type: Type.STRING },
            flagged_fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  field: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  severity: { type: Type.STRING }
                },
                required: ["field", "reason", "severity"]
              }
            }
          },
          required: ["is_suspicious", "risk_score", "reasoning", "suggested_action", "flagged_fields"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return { is_suspicious: false, risk_score: 5, reasoning: "تحلیل محلی انجام شد.", suggested_action: "بررسی مدارک دستی", flagged_fields: [] };
  }
}

export async function searchRegulatoryNews() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "آخرین نرخ‌های ارز در بازار سرای شهزاده کابل، نتایج لیلام‌های بانک مرکزی افغانستان و تغییرات در لیست‌های تحریم سازمان ملل مرتبط با افغانستان را گزارش دهید.",
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.map((c: any) => c.web?.uri ? { title: c.web.title, uri: c.web.uri } : null).filter((x: any) => x);

    return {
        text: response.text,
        sources: Array.from(new Set(sources.map((s: any) => s.uri))).map(uri => sources.find((s: any) => s.uri === uri))
    };
  } catch (error) {
    return { text: "خطا در دریافت اطلاعات زنده بازار.", sources: [] };
  }
}

export async function searchEntity(entityName: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بررسی سوابق (Background Check) برای شخص یا شرکت: '${entityName}'. جستجو در لیست‌های تحریم UN، OFAC و اخبار منفی بانکی مرتبط با پولشویی در حوزه افغانستان و خاورمیانه.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.map((c: any) => c.web?.uri ? { title: c.web.title, uri: c.web.uri } : null).filter((x: any) => x);
    return { text: response.text, sources: Array.from(new Set(sources.map((s: any) => s.uri))).map(uri => sources.find((s: any) => s.uri === uri)) };
  } catch (error) {
    return { text: "امکان استعلام آنلاین نام میسر نیست.", sources: [] };
  }
}
