import { NextResponse } from 'next/server';

import { QdrantManager } from '../../QdrantManager';
import type { TermsResponse } from '../../types';

const manager = new QdrantManager(
  process.env.QDRANT_API_KEY || '',
  process.env.QDRANT_LINK || 'http://localhost',
);

export async function GET() {
  try {
    const [collections, lastSynced] = await Promise.all([
      manager.listTermCollections(),
      manager.lastSyncedByTerm(),
    ]);
    return NextResponse.json({ collections, lastSynced } satisfies TermsResponse);
  } catch (error) {
    console.error('Error listing Qdrant term collections:', error);
    return NextResponse.json(
      { error: 'Unable to load available terms.' },
      { status: 503 },
    );
  }
}
