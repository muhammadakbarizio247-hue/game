
import { GoogleGenAI, Type } from "@google/genai";
import { Mission, AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMission = async (character: string, playerName: string, missionCount: number): Promise<Mission> => {
  const isClimax = missionCount >= 5;
  const prompt = isClimax 
    ? `Buat misi FINAL yang sangat dramatis untuk ${character} (nama pemain: ${playerName}). Misi ini adalah puncak kekacauan di sekolah untuk memancing kemarahan besar Pak Yono. Judul misi harus provokatif dan berisiko tinggi.`
    : `Buat sebuah misi jahil sekolah level ${missionCount + 1} untuk karakter ${character} (nama: ${playerName}). Misi harus kreatif, menggunakan bahasa Indonesia gaul, dan perlahan-lahan meningkatkan tensi dengan Pak Yono.`;

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

export const generateScenario = async (character: string, playerName: string, mission: Mission, missionCount: number): Promise<AIResponse> => {
  const isClimax = missionCount >= 5;
  const prompt = `Karakter ${character} (Pemain: ${playerName}) sedang menjalankan misi: "${mission.title}". 
    Tiba-tiba Pak Yono, guru paling galak, muncul dengan penggaris kayunya!
    Buat skenario dialog dalam bahasa Indonesia di mana Pak Yono menginterogasi pemain.
    ${isClimax ? "Ini adalah puncak cerita! Pak Yono sangat marah. Berikan pilihan yang bisa memicu perkelahian atau adu mulut hebat." : "Pak Yono curiga tapi belum meledak."}
    Berikan 3 pilihan tindakan. Setiap pilihan butuh nilai risiko (0-100), peluang berhasil (0-100), dan deskripsi hasil akhir yang dramatis.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
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
