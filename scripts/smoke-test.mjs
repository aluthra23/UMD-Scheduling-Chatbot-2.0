// End-to-end check against a running app (npm run dev or npm start): embeds questions with the
// same MiniLM model the browser uses, then streams answers from /api/chat.
import { pipeline } from '@huggingface/transformers';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const QUESTIONS = [
  'What is CMSC131 and when are its sections?',
  'Compare CMSC131 and CMSC132.',
];

const terms = await (await fetch(`${BASE_URL}/api/collections`)).json();
const collection = process.env.QDRANT_COLLECTION || terms.collections[0];
console.log('terms:', terms.collections.join(', '), '| using:', collection, '| last synced:', terms.lastSynced[collection] ?? 'not tracked');

const extractor = await pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2', { dtype: 'fp32' });

for (const question of QUESTIONS) {
  const output = await extractor(question, { pooling: 'mean', normalize: true });
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      messages: [{ id: 'smoke-test', content: question, role: 'user', timestamp: 0 }],
      embedding: Array.from(output.data),
      collection,
    }),
  });
  if (!response.body) throw new Error('Response body was not streamed.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let chunks = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks += 1;
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  console.log(`\n${question}\nstatus ${response.status}, ${chunks} chunks:\n${text}`);
}
