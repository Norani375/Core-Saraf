
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
      reasoning: "خطا در تحلیل هوشمند - بررسی دستی الزامی است.",
      suggested_action: "توقف موقت تراکنش و بررسی مدارک هویتی",
      flagged_fields: []
    };
  }
}
