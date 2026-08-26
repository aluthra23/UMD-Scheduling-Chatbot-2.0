import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenAI } from '@google/genai';

interface SearchResult {
  payload: {
    text: string;
  };
  score: number;
}

const googleApiKeyList = [process.env.GOOGLE_API_KEY || '']

export interface Point {
  id: string | number; // ID can be a string or a number
  payload?: {
    text: string;
  };
  vector?: number[];   // Optional, if you are working with vectors
}

export class QdrantManager {
  private client: QdrantClient;

  constructor(
    qdrantApiKey: string,
    host: string = 'localhost',
    port: number = 6333
  ) {
    this.client = new QdrantClient({
      url: host,
      port,
      apiKey: qdrantApiKey,
    });
  }

  async collectionExists(collectionName: string): Promise<boolean> {
    const { exists } = await this.client.collectionExists(collectionName);
    if (exists) {
      return true;
    } else {
      return false;
    }
  }

  async createCollection(
    collectionName: string,
    vectorSize: number = 384
  ): Promise<void> {
    try {
      const { exists } = await this.client.collectionExists(collectionName);
      if (exists) {
        console.log(`Collection '${collectionName}' already exists`);
        return;
      }
    } catch (e) {
      // Ignore deletion errors
      console.log(e);
    }

    await this.client.createCollection(collectionName, 
      {
      vectors: {
        size: vectorSize,
        distance: "Cosine"
      },
    });

    console.log(`Collection '${collectionName}' created successfully`);
  }

  async deleteCollection(collectionName: string): Promise<void> {
    const { exists } = await this.client.collectionExists(collectionName);
    if (!exists) {
      throw new Error(`Collection '${collectionName}' does not exist`);
    }

    await this.client.deleteCollection(collectionName);
  }

  async searchSimilar(
    collectionName: string,
    prompt: string,
    embedding: number[],
    limit: number = 30,
    similarityThreshold: number = 0.2
  ): Promise<SearchResult[]> {
    if (embedding.length !== 384) {
      throw new Error(`Expected a 384-dimensional MiniLM vector, received ${embedding.length}`);
    }

    const courseCodes = prompt.toUpperCase().match(/\b[A-Z]{4}\d{3}[A-Z]?\b/g);
    const searchResults = await this.client.query(collectionName, {
      query: embedding,
      limit,
      with_payload: true,
      score_threshold: similarityThreshold,
      filter: courseCodes?.length ? {
        must: courseCodes.map((courseCode) => ({
          key: 'course_number',
          match: { value: courseCode },
        })),
      } : undefined,
    });

    return searchResults.points
      .filter((result) => result.score >= similarityThreshold)
      .map((result) => ({
        payload: result.payload as SearchResult['payload'],
        score: result.score,
      }));
  }

  async chat(
    collectionName: string,
    prompt: string,
    embedding: number[],
    conversationHistory: string[] = []
  ): Promise<string> {
    // Check if collection exists
    const { exists } = await this.client.collectionExists(collectionName);
    if (!exists) {
      throw new Error(`Collection '${collectionName}' does not exist`);
    }

    // Search for similar context in the database
    const results = await this.searchSimilar(collectionName, prompt, embedding);

    // console.log("Results:", results);

    if (!results || results.length === 0) {
      return "No relevant context found. How can I help you?";
    }

    // Construct context with previous conversation history
    const historyContext = conversationHistory.slice(-6).join('\n');

    // Format the context from search results
    const combinedText = results
      .map((result) => {
        const payload = result.payload;        
        return `${payload.text}`;
      })
      .join(' ');

    // Prepare input for LLM
    const inputText = `
    Previous Conversation:
    ${historyContext}
    
    Context:
    ${combinedText}
    
    User: ${prompt}\n`;
    // console.log(`Input text: ${inputText}`);

    // Generate response using Google's Generative AI
    const genAI = new GoogleGenAI({ apiKey: googleApiKeyList[Math.floor(Math.random() * googleApiKeyList.length)] });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: inputText,
    });

    return response.text || 'No response generated.';
  }

}
