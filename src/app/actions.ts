"use server"

import { QdrantManager } from './QdrantManager';

const qdrantApiKey = process.env.QDRANT_API_KEY || '';

const host = process.env.QDRANT_LINK || 'http://localhost';
const manager = new QdrantManager(qdrantApiKey, host);
const collectionName="Fall-2025-Courses"

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
}

export async function chat(messages: Message[]): Promise<Message> {
  let response = "";
  try {
    response = await manager.chat(collectionName, messages[messages.length - 1].content, messages.slice(1, -1).map(m => m.content));
    console.log('Chat response:', response);
  } catch (error) {
    response = "The lecture is not available at this time. Please try again later.";
    console.error(`Error chatting with collection '${collectionName}':`, error);
  }
  
  // For now, just return a hardcoded response
  return {
    id: Math.random().toString(36).substring(2, 11),
    content: response,
    role: 'assistant',
    timestamp: Date.now()
  };
} 