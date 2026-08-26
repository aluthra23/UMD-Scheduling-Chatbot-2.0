'use client';

import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';

const MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
let extractorPromise: Promise<FeatureExtractionPipeline> | undefined;

export async function embedText(text: string): Promise<number[]> {
  extractorPromise ??= pipeline('feature-extraction', MODEL, { dtype: 'fp32' });
  const extractor = await extractorPromise;
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}
