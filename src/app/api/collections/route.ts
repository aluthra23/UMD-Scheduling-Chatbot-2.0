import { NextResponse } from 'next/server';

import { QdrantManager } from '../../QdrantManager';

const manager = new QdrantManager(
  process.env.QDRANT_API_KEY || '',
  process.env.QDRANT_LINK || 'http://localhost',
);

export async function GET() {
  try {
    return NextResponse.json({ collections: await manager.listTermCollections() });
  } catch (error) {
    console.error('Error listing Qdrant term collections:', error);
    return NextResponse.json(
      { error: 'Unable to load available terms.' },
      { status: 503 },
    );
  }
}
