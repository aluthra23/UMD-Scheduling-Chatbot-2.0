import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenAI } from '@google/genai';

import type { Message } from './types';
import {
  buildHistory,
  buildPrompt,
  carriedCourseCodes,
  extractCourseCodes,
  mergeDocuments,
  systemInstruction,
  TERM_COLLECTION_PATTERN,
  type RetrievedDocument,
} from './retrieval';

const SYNC_STATUS_COLLECTION = 'sync_status';
const SEMANTIC_LIMIT = 30;
const SEMANTIC_SCORE_THRESHOLD = 0.2;
const DOCUMENTS_PER_COURSE = 120;
const CARRIED_DOCUMENTS_PER_COURSE = 40;
const GEMINI_MODEL = 'gemini-2.5-flash';

export class QdrantManager {
  private client: QdrantClient;
  private genAI?: GoogleGenAI;

  constructor(qdrantApiKey: string, host: string = 'localhost', port: number = 6333) {
    this.client = new QdrantClient({ url: host, port, apiKey: qdrantApiKey });
  }

  async listTermCollections(): Promise<string[]> {
    const collections = await this.client.getCollections();
    return collections.collections
      .map((collection) => collection.name)
      .filter((name) => TERM_COLLECTION_PATTERN.test(name))
      .sort((a, b) => b.localeCompare(a));
  }

  /** When the scraping pipeline last synced each term, as ISO timestamps. Terms it never synced are absent. */
  async lastSyncedByTerm(): Promise<Record<string, string>> {
    try {
      const { points } = await this.client.scroll(SYNC_STATUS_COLLECTION, { limit: 100, with_payload: true, with_vector: false });
      const result: Record<string, string> = {};
      for (const point of points) {
        const { collection, synced_at: syncedAt } = (point.payload ?? {}) as { collection?: unknown; synced_at?: unknown };
        if (typeof collection === 'string' && typeof syncedAt === 'string') result[collection] = syncedAt;
      }
      return result;
    } catch (error) {
      // 404 just means the pipeline hasn't recorded any sync yet.
      if ((error as { status?: number }).status !== 404) console.error('Unable to read sync status:', error);
      return {};
    }
  }

  private async semanticSearch(collectionName: string, embedding: number[]): Promise<RetrievedDocument[]> {
    const { points } = await this.client.query(collectionName, {
      query: embedding,
      limit: SEMANTIC_LIMIT,
      with_payload: true,
      score_threshold: SEMANTIC_SCORE_THRESHOLD,
    });
    return points.map((point) => ({ id: point.id, text: String(point.payload?.text ?? '') }));
  }

  /** Every document for each course, one query per code so a large course can't crowd out the others. */
  private async courseSearch(collectionName: string, embedding: number[], codes: string[], perCourse: number): Promise<RetrievedDocument[]> {
    const lists = await Promise.all(codes.map(async (code) => {
      const { points } = await this.client.query(collectionName, {
        query: embedding,
        limit: perCourse,
        with_payload: true,
        filter: { must: [{ key: 'course_number', match: { value: code } }] },
      });
      return points.map((point) => ({ id: point.id, text: String(point.payload?.text ?? '') }));
    }));
    return mergeDocuments(...lists);
  }

  async retrieve(collectionName: string, prompt: string, embedding: number[], previous: Message[]): Promise<RetrievedDocument[]> {
    const codes = extractCourseCodes(prompt);
    if (codes.length) {
      const byCourse = await this.courseSearch(collectionName, embedding, codes, DOCUMENTS_PER_COURSE);
      // Words like "with 300" look like course codes; fall back to meaning-based search when nothing matches.
      return byCourse.length ? byCourse : this.semanticSearch(collectionName, embedding);
    }

    const carried = carriedCourseCodes(previous, prompt);
    const [semantic, byCourse] = await Promise.all([
      this.semanticSearch(collectionName, embedding),
      carried.length ? this.courseSearch(collectionName, embedding, carried, CARRIED_DOCUMENTS_PER_COURSE) : Promise.resolve([]),
    ]);
    return mergeDocuments(byCourse, semantic);
  }

  async *chatStream(collectionName: string, messages: Message[], embedding: number[], availableTerms: string[]): AsyncGenerator<string> {
    const previous = messages.slice(0, -1);
    const question = messages[messages.length - 1].content;

    const documents = await this.retrieve(collectionName, question, embedding, previous);
    if (!documents.length) {
      yield "I couldn't find course information matching that question. Try including a course code like CMSC131, or rephrase it.";
      return;
    }

    this.genAI ??= new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || '' });
    const response = await this.genAI.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: [
        ...buildHistory(previous),
        { role: 'user', parts: [{ text: buildPrompt(collectionName, question, documents) }] },
      ],
      config: { systemInstruction: systemInstruction(collectionName, availableTerms) },
    });

    for await (const chunk of response) {
      if (chunk.text) yield chunk.text;
    }
  }
}
