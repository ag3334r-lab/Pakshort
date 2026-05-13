import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeVideoContent(caption: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Given this video caption: "${caption}", generate 5 relevant hashtags and 3 internal category tags for a recommendation system. Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            categories: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["hashtags", "categories"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to analyze video content", error);
    return { hashtags: [], categories: [] };
  }
}

export async function getPersonalizedFeed(interests: string[]) {
  // Simple rules-based recommendation logic enhanced by Gemini
  // In a real app, this would be a backend function
  // We'll simulate it by generating "ideal" categories to query
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user is interested in: ${interests.join(', ')}. Provide a list of 5 search terms or categories to help find relevant short videos. Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.ARRAY,
           items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return interests;
  }
}
