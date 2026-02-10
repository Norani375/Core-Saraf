
import { GoogleGenAI, Type } from "@google/genai";

// ایجاد نمونه به صورت محلی برای مدیریت بهتر خطاها
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const isQuotaError = (error: any) => {
  const msg = error?.message?.toLowerCase() || "";
  return msg.includes("quota") || msg.includes("429") || msg.includes("limit");
};

/**
 * Searches for recent regulatory news and circulars from DAB (Central Bank of Afghanistan).
 */
export async function searchRegulatoryNews() {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "آخرین اخبار و بخشنامه‌های نظارتی بانک مرکزی افغانستان (DAB) و قوانین مبارزه با پولشویی در افغانستان را جستجو و خلاصه کن.",
      config: { tools: [{ googleSearch: {} }] }
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
        .map((c: any) => c.web?.uri ? { title: c.web.title, uri: c.web.uri } : null)
        .filter((x: any) => x);

    return {
        text: response.text || "موردی یافت نشد.",
        sources: Array.from(new Set(sources.map((s: any) => s.uri))).map(uri => sources.find((s: any) => s.uri === uri)),
        status: 'success'
      };
  } catch (error) {
    return { text: "خطا در دریافت اخبار نظارتی.", sources: [], status: 'error' };
  }
}

/**
 * Performs a background search on a person or entity using Google Search grounding.
 */
export async function searchEntity(entityName: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `یک بررسی پیشینه کامل برای این شخص/نهاد انجام بده و هرگونه سابقه منفی، حضور در لیست‌های تحریم یا اخبار مرتبط با فعالیت‌های مالی مشکوک را گزارش کن: ${entityName}`,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
        .map((c: any) => c.web?.uri ? { title: c.web.title, uri: c.web.uri } : null)
        .filter((x: any) => x);

    return {
        text: response.text || "اطلاعاتی در دسترس نیست.",
        sources: Array.from(new Set(sources.map((s: any) => s.uri))).map(uri => sources.find((s: any) => s.uri === uri)),
        status: 'success'
      };
  } catch (error) {
    return { text: "خطا در استعلام هوشمند هویت.", sources: [], status: 'error' };
  }
}

export async function askRegulatoryQuestion(question: string) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `شما مشاور حقوقی و کارشناس انطباق (Compliance) بانک مرکزی افغانستان (DAB) هستید. سوال: ${question}`,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
        .map((c: any) => c.web?.uri ? { title: c.web.title, uri: c.web.uri } : null)
        .filter((x: any) => x);

    return {
        text: response.text || "پاسخی دریافت نشد.",
        sources: Array.from(new Set(sources.map((s: any) => s.uri))).map(uri => sources.find((s: any) => s.uri === uri)),
        status: 'success'
      };
  } catch (error) {
    if (isQuotaError(error)) {
      return { 
        text: "سهمیه روزانه هوش مصنوعی به پایان رسیده است. لطفاً از بخش 'قوانین آفلاین' در تنظیمات استفاده کنید یا فردا مراجعه نمایید.", 
        sources: [],
        status: 'quota_exceeded'
      };
    }
    return { text: "متأسفانه ارتباط با سرور نظارتی برقرار نشد.", sources: [], status: 'error' };
  }
}

export async function analyzeTransactionAML(transactionData: any) {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `تحلیل ریسک AML برای تراکنش: ${JSON.stringify(transactionData)}. خروجی JSON الزامی است.`,
      config: {
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
    const resultText = response.text || "{}";
    return { ...JSON.parse(resultText), ai_status: 'online' };
  } catch (error) {
    // مکانیزم جایگزین (Local Fallback AML)
    const amount = parseFloat(transactionData.amount || 0);
    const isHighRisk = amount > 10000;
    
    return { 
      is_suspicious: isHighRisk, 
      risk_score: isHighRisk ? 85 : 10, 
      reasoning: isQuotaError(error) 
        ? "تحلیل هوشمند به دلیل محدودیت API در دسترس نیست. سیستم به صورت خودکار بر اساس سقف مبالغ (۱۰ هزار دلار) تحلیل انجام داد." 
        : "خطای شبکه. تحلیل محلی جایگزین شد.",
      suggested_action: isHighRisk ? "درخواست اسناد منبع پول (Source of Funds)" : "تایید عادی",
      flagged_fields: isHighRisk ? [{ field: 'amount', reason: 'مبلغ بالاتر از سقف گزارش‌دهی DAB است', severity: 'HIGH' }] : [],
      ai_status: 'offline'
    };
  }
}
