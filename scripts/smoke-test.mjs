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
  }),
});

console.log('embedding dimensions:', embedding.length);
console.log('status:', response.status);
console.log('response:', await response.text());
