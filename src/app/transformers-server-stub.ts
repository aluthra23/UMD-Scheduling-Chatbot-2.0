export async function pipeline(): Promise<never> {
  throw new Error('Browser embeddings cannot run during server rendering.');
}

export type FeatureExtractionPipeline = never;
