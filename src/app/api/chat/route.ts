import { NextRequest, NextResponse } from 'next/server';

import { chat, Message } from '../../actions';

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

  return NextResponse.json(await chat(messages, embedding));
}
