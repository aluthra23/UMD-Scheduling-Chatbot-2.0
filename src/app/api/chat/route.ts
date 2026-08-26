import { NextRequest, NextResponse } from 'next/server';

import type { Message } from '../../actions';
import { QdrantManager } from '../../QdrantManager';

const manager = new QdrantManager(
  process.env.QDRANT_API_KEY || '',
  process.env.QDRANT_LINK || 'http://localhost',
);
const TERM_COLLECTION_PATTERN = /^20\d{2}(01|08)$/;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const messages = body.messages as Message[] | undefined;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'A non-empty messages array is required.' },
      { status: 400 },
    );
  }

  const embedding = body.embedding as number[] | undefined;
  if (!Array.isArray(embedding) || embedding.length !== 384) {
    return NextResponse.json(
      { error: 'A 384-dimensional MiniLM embedding is required.' },
      { status: 400 },
    );
  }

  const collectionName = body.collection as string | undefined;
  if (!collectionName || !TERM_COLLECTION_PATTERN.test(collectionName)) {
    return NextResponse.json(
      { error: 'A valid term collection is required.' },
      { status: 400 },
    );
  }
  if (!await manager.collectionExists(collectionName)) {
    return NextResponse.json(
      { error: 'The selected term is not available.' },
      { status: 404 },
    );
  }

  const lastMessage = messages[messages.length - 1];
  const conversationHistory = messages.slice(1, -1).map((message) => message.content);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of manager.chatStream(
          collectionName,
          lastMessage.content,
          embedding,
          conversationHistory,
        )) {
          if (request.signal.aborted) break;
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        console.error(`Error streaming chat from collection '${collectionName}':`, error);
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
