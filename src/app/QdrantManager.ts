import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    vectorSize: number = 768
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
    limit: number = 30,
    similarityThreshold: number = 0.2
  ): Promise<SearchResult[]> {
    const genAI = new GoogleGenerativeAI(googleApiKeyList[Math.floor(Math.random() * googleApiKeyList.length)]);
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(prompt);
    const embedding = result.embedding.values;

    const searchResults = await this.client.query(collectionName, {
      query: embedding,
      limit,
      with_payload: true,
      score_threshold: similarityThreshold,
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
    conversationHistory: string[] = []
  ): Promise<string> {
    // Check if collection exists
    const { exists } = await this.client.collectionExists(collectionName);
    if (!exists) {
      throw new Error(`Collection '${collectionName}' does not exist`);
    }

    // Search for similar context in the database
    const results = await this.searchSimilar(collectionName, prompt);

    console.log("Results:", results);

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
    You are a chatbot that answers questions about University of Maryland courses and schedules.
    Previous Conversation:
    ${historyContext}
    
    Context:
    ${combinedText}
    
    User: ${prompt}\n`;
    console.log(`Input text: ${inputText}`);

    // Generate response using Google's Generative AI
    const genAI = new GoogleGenerativeAI(googleApiKeyList[Math.floor(Math.random() * googleApiKeyList.length)]);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });
    const result = await model.generateContent(inputText);
    const response = await result.response;
    
    return response.text();
  }

} 