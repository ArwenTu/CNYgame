
import { GoogleGenAI, Type } from "@google/genai";

export async function getRandomIdiom(excludedIdioms: string[] = []) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const excludeStr = excludedIdioms.length > 0 ? ` 請不要選擇以下成語：${excludedIdioms.join('、')}。` : '';
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `請隨機提供一個常見的四字成語，並解釋其意義。輸出格式為 JSON。${excludeStr}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            idiom: { type: Type.STRING },
            meaning: { type: Type.STRING }
          },
          required: ["idiom", "meaning"]
        }
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    const fallbacks = [
      { idiom: "一馬當先", meaning: "形容領先、帶頭。" },
      { idiom: "大吉大利", meaning: "非常吉祥順利。" },
      { idiom: "恭喜發財", meaning: "祝賀人發財。" },
      { idiom: "萬事如意", meaning: "所有的事都符合心意。" },
      { idiom: "龍馬精神", meaning: "比喻精神飽滿、活力十足。" },
      { idiom: "招財進寶", meaning: "招引財氣，進納寶物。" },
      { idiom: "金玉滿堂", meaning: "形容極其富有，或學識豐富。" },
      { idiom: "心想事成", meaning: "心裡想的事情都能成功。" }
    ];
    
    // Filter out used fallbacks if possible
    const available = fallbacks.filter(f => !excludedIdioms.includes(f.idiom));
    const pool = available.length > 0 ? available : fallbacks;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
