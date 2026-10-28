import { NextRequest, NextResponse } from 'next/server';

import { clientKey, parseChatRequest, RateLimiter } from '../../chat-request';
import { QdrantManager } from '../../QdrantManager';

const manager = new QdrantManager(
  process.env.QDRANT_API_KEY || '',
  process.env.QDRANT_LINK || 'http://localhost',
);
const rateLimiter = new RateLimiter(20, 60_000);

export async function POST(request: NextRequest) {
  if (!rateLimiter.allow(clientKey(request.headers))) {
    return NextResponse.json({ error: 'Too many messages. Please wait a minute and try again.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'The request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = parseChatRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { messages, embedding, collection } = parsed.request;

  try {
    if (!await manager.collectionExists(collection)) {
      return NextResponse.json({ error: 'The selected term is not available.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error checking Qdrant collection:', error);
    return NextResponse.json({ error: 'Course data is temporarily unavailable.' }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of manager.chatStream(collection, messages, embedding)) {
          if (request.signal.aborted) break;
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        console.error(`Error streaming chat from collection '${collection}':`, error);
        const status = typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number }).status
          : undefined;
        const message = status === 429
          ? 'The assistant has reached its Gemini request limit. Please try again in a few minutes.'
          : 'Sorry, the assistant is temporarily unavailable. Please try again.';
        if (!request.signal.aborted) {
          controller.enqueue(encoder.encode(message));
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
