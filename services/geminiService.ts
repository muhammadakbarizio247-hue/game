
import { GoogleGenAI, Type } from "@google/genai";
import { Mission, AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMission = async (character: string, playerName: string, missionCount: number): Promise<Mission> => {
  const isClimax = missionCount >= 5;
  const prompt = isClimax 
    ? `Buat misi FINAL untuk ${character} (${playerName}) yang ingin melakukan kekacauan terbesar di sekolah. Target utamanya adalah menjebak Pak Yono, guru terkiller. Judul harus dramatis.`
    : `Buat sebuah misi jahil sekolah untuk ${character} (${playerName}). Ini misi ke-${missionCount + 1}. Misi harus seru dan melibatkan guru lain sebelum menghadapi Pak Yono nantinya.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          reward: { type: Type.NUMBER },
          risk: { type: Type.NUMBER },
          type: { type: Type.STRING }
        },
        required: ["id", "title", "description", "difficulty", "reward", "risk", "type"]
      }
    }
  });

  return JSON.parse(response.text.trim()) as Mission;
};

export const generateScenario = async (character: string, playerName: string, mission: Mission, suspicion: number): Promise<AIResponse> => {
  const isHighSuspicion = suspicion > 70;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Karakter ${character} (nama asli: ${playerName}) sedang menjalankan misi: "${mission.title}". 
    ${isHighSuspicion ? "Tiba-tiba Pak Yono memergokinya dengan muka merah padam dan berteriak!" : "Pak Yono sedang berpatroli dengan penggaris kayunya."}
    Buat skenario di mana Pak Yono bertanya atau menuduh sesuatu dalam bahasa Indonesia yang galak. 
    Berikan 3 pilihan jawaban. Jika ini misi final, salah satu pilihan harus memicu konfrontasi/berantem yang berisiko dikeluarkan dari sekolah.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenario: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                risk: { type: Type.NUMBER },
                successChance: { type: Type.NUMBER },
                outcome: { type: Type.STRING }
              },
              required: ["text", "risk", "successChance", "outcome"]
            }
          }
        },
        required: ["scenario", "options"]
      }
    }
  });

  return JSON.parse(response.text.trim()) as AIResponse;
};
