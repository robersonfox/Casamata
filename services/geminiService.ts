
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getShootingTips = async (offsetCm: number, distance: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `O atirador está a ${distance} metros e teve um desvio médio de ${offsetCm} cm. 
      Dê 3 dicas curtas e práticas de fundamentos de tiro (postura, respiração, acionamento do gatilho) para iniciantes melhorarem o agrupamento. 
      Responda em Português do Brasil de forma encorajadora e técnica simples.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Mantenha a calma, controle sua respiração e pressione o gatilho suavemente.";
  }
};
