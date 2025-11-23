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
      Find the top 12 latest news headlines and summaries for the topic: "${topic}".
      
      Requirements:
      1. Use the Google Search tool to find real, up-to-date information.
      2. Return the data in a strict text format that I can parse.
      3. Separate each story strictly with the delimiter "|||".
      4. Format each story block exactly like this:
         HEADLINE: [The Headline]
         SUMMARY: [A concise, one-sentence summary]
         SOURCE_NAME: [The name of the publisher, e.g., CNN, The Verge]
      
      Do not add numbering, bullet points, or markdown bolding (**). Just plain text fields.
      Ensure you provide exactly 12 distinct stories.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // 1. Extract Text content
    const textData = response.text || "";
    
    // 2. Extract Grounding Metadata (Sources)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Filter and map valid sources. We allow chunks that at least have a URI.
    const sources: NewsSource[] = groundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => {
        let title = chunk.web.title;
        // Fallback to domain name if title is missing
        if (!title && chunk.web.uri) {
           try {
             title = new URL(chunk.web.uri).hostname.replace('www.', '');
           } catch (e) {
             title = "Source";
           }
        }
        return {
          title: title || "News Source",
          uri: chunk.web.uri,
        };
      });

    // 3. Parse the text response into objects
    const articles: NewsItem[] = parseNewsResponse(textData, topic);

    // 4. Map sources to articles
    // Map available source URIs to the articles to ensure clicking works.
    articles.forEach((article, index) => {
      // Try to match the article to a source. 
      // Since generation and grounding chunks might not align 1:1 perfectly by index,
      // we do a best effort mapping by index, or default to a search link.
      
      if (sources[index]) {
        article.sourceUrl = sources[index].uri;
        
        // If the AI didn't provide a specific source name in the text, 
        // use the title from the grounding metadata which is often more accurate.
        if (article.sourceName === "News Wire" && sources[index].title) {
          article.sourceName = sources[index].title;
        }
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
  // Split by delimiter and filter out empty strings
  const items = text.split('|||').map(s => s.trim()).filter(s => s.length > 20);
  
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
      imageUrl: `https://picsum.photos/800/600?random=${index + (topic.length * 2)}` 
    };
  }).slice(0, 12); // Limit to 12 items
};

// Fallback data in case API key is missing or fails
const getMockData = (topic: string): FetchNewsResponse => {
  return {
    articles: Array.from({ length: 12 }).map((_, i) => ({
      id: `mock-${i}`,
      headline: `Latest Major Update in ${topic} Industry Reaches New Heights (${i + 1})`,
      summary: `This is a simulated summary for ${topic} demonstrating the visual layout of the card system while the API is configured.`,
      sourceName: "Nexus Wire",
      imageUrl: `https://picsum.photos/800/600?random=${i + 10}`,
      sourceUrl: `https://www.google.com/search?q=${topic}+news` // Mock URL
    })),
    sources: [
      { title: "Example Source News", uri: "https://news.google.com" },
      { title: "Global Tech Daily", uri: "https://news.google.com" }
    ]
  };
};