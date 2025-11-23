import { GoogleGenAI } from "@google/genai";
import { FetchNewsResponse, NewsItem, NewsSource } from "../types";

// Initialize the client. 
// Note: In a real environment, ensure process.env.API_KEY is set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';

export const fetchNews = async (topic: string): Promise<FetchNewsResponse> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing");
    // Return mock data if no key for UI demonstration purposes
    return getMockData(topic);
  }

  try {
    const prompt = `
      You are a professional news editor for a high-end news aggregator.
      Find the top 5 latest news headlines and summaries for the topic: "${topic}".
      
      Requirements:
      1. Use the Google Search tool to find real, up-to-date information.
      2. Return the data in a strict text format that I can parse.
      3. For each story, use this exact separator: "|||"
      4. Format each story exactly like this:
         HEADLINE: [The Headline]
         SUMMARY: [A concise, one-sentence summary]
         SOURCE_NAME: [The name of the publisher, e.g., CNN, The Verge]
      
      Do not add numbering or markdown bolding (**). Just plain text fields.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType cannot be JSON when using googleSearch in some contexts, 
        // so we use text parsing for maximum reliability with grounding.
      },
    });

    // 1. Extract Text content
    const textData = response.text || "";
    
    // 2. Extract Grounding Metadata (Sources)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: NewsSource[] = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri,
      }));

    // 3. Parse the text response into objects
    const articles: NewsItem[] = parseNewsResponse(textData, topic);

    // 4. Map sources to articles
    // Since the text generation is a list of top stories and grounding chunks are the sources found,
    // we attempt to map available source URIs to the articles.
    // If there are more articles than sources, some might not get a direct link (handled in UI via fallback).
    articles.forEach((article, index) => {
      if (sources[index]) {
        article.sourceUrl = sources[index].uri;
      }
    });
    
    return {
      articles,
      sources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return getMockData(topic);
  }
};

// Helper to parse the custom delimiter format
const parseNewsResponse = (text: string, topic: string): NewsItem[] => {
  const items = text.split('|||').map(s => s.trim()).filter(s => s.length > 10);
  
  return items.map((item, index) => {
    const headlineMatch = item.match(/HEADLINE:\s*(.+)/);
    const summaryMatch = item.match(/SUMMARY:\s*(.+)/);
    const sourceMatch = item.match(/SOURCE_NAME:\s*(.+)/);

    return {
      id: `${topic}-${index}-${Date.now()}`,
      headline: headlineMatch ? headlineMatch[1].trim() : "News Update",
      summary: summaryMatch ? summaryMatch[1].trim() : "Summary unavailable.",
      sourceName: sourceMatch ? sourceMatch[1].trim() : "News Wire",
      // Deterministic image based on index for the demo
      imageUrl: `https://picsum.photos/800/600?random=${index + (topic.length)}` 
    };
  }).slice(0, 5); // Ensure exactly 5 max
};

// Fallback data in case API key is missing or fails
const getMockData = (topic: string): FetchNewsResponse => {
  return {
    articles: Array.from({ length: 5 }).map((_, i) => ({
      id: `mock-${i}`,
      headline: `Latest Major Update in ${topic} Industry Reaches New Heights`,
      summary: `This is a simulated summary for ${topic} demonstrating the visual layout of the card system while the API is configured.`,
      sourceName: "Nexus Wire",
      imageUrl: `https://picsum.photos/800/600?random=${i + 10}`,
      sourceUrl: `https://www.google.com/search?q=${topic}+news` // Mock URL
    })),
    sources: [
      { title: "Example Source News", uri: "#" },
      { title: "Global Tech Daily", uri: "#" }
    ]
  };
};