import { pipeline } from '@huggingface/transformers';

const extractor = await pipeline(
  'feature-extraction',
  'sentence-transformers/all-MiniLM-L6-v2',
  { dtype: 'fp32' },
);
const output = await extractor('What is CMSC131 and when are its sections?', {
  pooling: 'mean',
  normalize: true,
});
const embedding = Array.from(output.data);

const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    messages: [{
      id: 'smoke-test',
      content: 'What is CMSC131 and when are its sections?',
      role: 'user',
      timestamp: 0,
    }],
    embedding,
    collection: process.env.QDRANT_COLLECTION || '202608',
  }),
});

console.log('embedding dimensions:', embedding.length);
console.log('status:', response.status);

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

console.log('stream chunks:', chunks);
console.log('response:', text);
