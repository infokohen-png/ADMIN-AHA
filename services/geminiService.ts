
import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly when initializing the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const draftCreatorMessage = async (creatorName: string, storeName: string, product: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a professional and friendly message to an influencer/creator named ${creatorName} on behalf of ${storeName}. We want to invite them to collaborate and review our product: ${product}. Keep it concise and enthusiastic. Provide the output in Indonesian.`,
    });
    // .text is a property, not a method.
    return response.text || "Gagal membuat draf pesan.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi AI.";
  }
};
