import { GoogleGenAI } from "@google/genai";

// Inicializa o cliente Gemini
// A chave deve vir de process.env.API_KEY conforme instruções
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingMessage = async (
  topic: string,
  tone: string,
  includeEmoji: boolean
): Promise<string> => {
  try {
    const prompt = `
      Crie uma mensagem curta, direta e atrativa para enviar via WhatsApp.
      Tópico/Produto: ${topic}
      Tom de voz: ${tone}
      Uso de Emojis: ${includeEmoji ? 'Use emojis moderadamente' : 'Sem emojis'}
      
      A mensagem deve ser formatada para leitura rápida no celular.
      Não use aspas no início ou fim.
      Seja persuasivo.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        maxOutputTokens: 300,
        temperature: 0.8,
      }
    });

    return response.text || "Não foi possível gerar a mensagem. Tente novamente.";
  } catch (error) {
    console.error("Erro ao gerar mensagem:", error);
    return "Ocorreu um erro ao conectar com a IA. Verifique sua chave de API.";
  }
};
