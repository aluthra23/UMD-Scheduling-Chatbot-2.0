import type { Message } from './types';
import { EMBEDDING_DIMENSIONS, TERM_COLLECTION_PATTERN } from './retrieval.ts';

export const MAX_MESSAGES = 40;
export const MAX_USER_MESSAGE_CHARS = 4000;
// Assistant replies come back as history and can be long (e.g. section tables); this only bounds the payload.
const MAX_ASSISTANT_MESSAGE_CHARS = 100_000;

export interface ChatRequest {
  messages: Message[];
  embedding: number[];
  collection: string;
}

export type ParseResult = { ok: true; request: ChatRequest } | { ok: false; error: string };

function isMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null) return false;
  const message = value as Record<string, unknown>;
  if (typeof message.content !== 'string') return false;
  if (message.role === 'user') return message.content.length <= MAX_USER_MESSAGE_CHARS;
  return message.role === 'assistant' && message.content.length <= MAX_ASSISTANT_MESSAGE_CHARS;
}

export function parseChatRequest(body: unknown): ParseResult {
  if (typeof body !== 'object' || body === null) return { ok: false, error: 'A JSON object body is required.' };
  const { messages, embedding, collection } = body as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return { ok: false, error: `Between 1 and ${MAX_MESSAGES} messages are required.` };
  }
  if (!messages.every(isMessage)) {
    const tooLong = messages.some((message) => message?.role === 'user'
      && typeof message.content === 'string' && message.content.length > MAX_USER_MESSAGE_CHARS);
    return {
      ok: false,
      error: tooLong
        ? `Please keep messages under ${MAX_USER_MESSAGE_CHARS.toLocaleString('en-US')} characters.`
        : 'Each message needs a user or assistant role and text content.',
    };
  }
  if (messages[messages.length - 1].role !== 'user' || !messages[messages.length - 1].content.trim()) {
    return { ok: false, error: 'The last message must be a non-empty user message.' };
  }
  if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSIONS
    || !embedding.every((value) => typeof value === 'number' && Number.isFinite(value))) {
    return { ok: false, error: `A ${EMBEDDING_DIMENSIONS}-dimensional MiniLM embedding is required.` };
  }
  if (typeof collection !== 'string' || !TERM_COLLECTION_PATTERN.test(collection)) {
    return { ok: false, error: 'A valid term collection is required.' };
  }
  return { ok: true, request: { messages, embedding, collection } };
}

/**
 * Sliding-window limit per client. State lives in this server instance's memory, so it is a
 * best-effort guard against casual abuse of the Gemini quota, not a global limit.
 */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  private limit: number;
  private windowMs: number;
  private now: () => number;

  constructor(limit: number, windowMs: number, now: () => number = Date.now) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
  }

  allow(key: string): boolean {
    const now = this.now();
    const recent = (this.hits.get(key) ?? []).filter((time) => now - time < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    if (this.hits.size > 10_000) this.prune(now);
    return true;
  }

  private prune(now: number) {
    for (const [key, times] of this.hits) {
      if (times.every((time) => now - time >= this.windowMs)) this.hits.delete(key);
    }
  }
}

export function clientKey(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown';
}
