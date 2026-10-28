import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildHistory,
  buildPrompt,
  carriedCourseCodes,
  extractCourseCodes,
  formatTerm,
  mergeDocuments,
  systemInstruction,
} from '../src/app/retrieval.ts';
import { parseChatRequest, RateLimiter } from '../src/app/chat-request.ts';

const user = (content, extra = {}) => ({ id: content, role: 'user', content, timestamp: 0, ...extra });
const bot = (content, extra = {}) => ({ id: content, role: 'assistant', content, timestamp: 0, ...extra });

test('extracts every course code, with or without a space', () => {
  assert.deepEqual(extractCourseCodes('Compare CMSC131 and cmsc 132, then CMSC131 again'), ['CMSC131', 'CMSC132']);
  assert.deepEqual(extractCourseCodes('Is ENGL101X open?'), ['ENGL101X']);
  assert.deepEqual(extractCourseCodes('easy music gen eds'), []);
});

test('limits the number of course codes', () => {
  assert.equal(extractCourseCodes('CMSC131 CMSC132 CMSC216 CMSC250 CMSC330 CMSC351').length, 4);
});

test('follow-ups carry course codes from recent user messages only', () => {
  const previous = [user('Tell me about MATH140'), bot('MATH140 is Calculus I...'), user('And CMSC131?'), bot('...')];
  assert.deepEqual(carriedCourseCodes(previous, 'who teaches it?'), ['CMSC131', 'MATH140']);
  assert.deepEqual(carriedCourseCodes(previous, 'what about CMSC132?'), []);
  const older = [user('MATH140?'), bot('...'), user('thanks'), bot('...'), user('something else'), bot('...')];
  assert.deepEqual(carriedCourseCodes(older, 'who teaches it?'), []);
});

test('mergeDocuments keeps the first copy of each id', () => {
  const merged = mergeDocuments([{ id: 1, text: 'a' }, { id: 2, text: 'b' }], [{ id: 2, text: 'b2' }, { id: 3, text: 'c' }]);
  assert.deepEqual(merged.map((d) => d.text), ['a', 'b', 'c']);
});

test('history skips the greeting and error replies, and alternates roles', () => {
  const history = buildHistory([
    bot('Hello! I am the UMD Scheduling Assistant.'),
    user('Tell me about CMSC131'),
    bot('Sorry, I encountered an error.', { isError: true }),
    user('Tell me about CMSC131 please'),
    bot('CMSC131 is Object-Oriented Programming I.'),
  ]);
  assert.deepEqual(history.map((turn) => turn.role), ['user', 'model']);
  assert.equal(history[0].parts[0].text, 'Tell me about CMSC131\n\nTell me about CMSC131 please');
});

test('history drops a trailing unanswered user turn and keeps only recent turns', () => {
  const many = [];
  for (let i = 0; i < 10; i++) many.push(user(`q${i}`), bot(`a${i}`));
  many.push(user('unanswered'));
  const history = buildHistory(many);
  assert.equal(history.length, 6);
  assert.equal(history[0].parts[0].text, 'q7');
  assert.equal(history.at(-1).role, 'model');
});

test('prompt and system instruction name the selected term', () => {
  assert.equal(formatTerm('202701'), 'Spring 2027');
  assert.equal(formatTerm('202608'), 'Fall 2026');
  assert.match(systemInstruction('202701'), /Spring 2027/);
  const prompt = buildPrompt('202701', 'Is it open?', [{ id: 1, text: 'doc one' }, { id: 2, text: 'doc two' }]);
  assert.match(prompt, /^Course information for Spring 2027/);
  assert.match(prompt, /doc one\n\n---\n\ndoc two/);
  assert.match(prompt, /Student question: Is it open\?$/);
});

const validBody = () => ({
  messages: [bot('Hello!'), user('Tell me about CMSC131')],
  embedding: new Array(384).fill(0.01),
  collection: '202701',
});

test('accepts a valid chat request', () => {
  assert.equal(parseChatRequest(validBody()).ok, true);
});

test('accepts a long assistant reply in history (a big comparison table)', () => {
  const body = { ...validBody(), messages: [user('Compare CMSC131 and CMSC132'), bot('x'.repeat(12_000)), user('who teaches it?')] };
  assert.equal(parseChatRequest(body).ok, true);
});

test('rejects an over-long student message with a readable error', () => {
  const result = parseChatRequest({ ...validBody(), messages: [user('x'.repeat(4001))] });
  assert.equal(result.ok, false);
  assert.match(result.error, /under 4,000 characters/);
});

test('system instruction points to other terms in the dropdown', () => {
  const instruction = systemInstruction('202701', ['202701', '202608', '202601']);
  assert.match(instruction, /also has data for Fall 2026, Spring 2026/);
  assert.match(instruction, /dropdown/);
  assert.doesNotMatch(instruction, /also has data for Spring 2027/);
  assert.match(systemInstruction('202701', ['202701']), /No other terms are available/);
});

test('rejects malformed chat requests', () => {
  const cases = {
    'not an object': null,
    'no messages': { ...validBody(), messages: [] },
    'too many messages': { ...validBody(), messages: Array.from({ length: 41 }, (_, i) => user(`q${i}`)) },
    'oversized message': { ...validBody(), messages: [user('x'.repeat(4001))] },
    'bad role': { ...validBody(), messages: [{ role: 'system', content: 'hi' }] },
    'last message from assistant': { ...validBody(), messages: [user('hi'), bot('hello')] },
    'short embedding': { ...validBody(), embedding: [0.1, 0.2] },
    'non-numeric embedding': { ...validBody(), embedding: new Array(384).fill('x') },
    'bad collection': { ...validBody(), collection: 'sync_status' },
  };
  for (const [name, body] of Object.entries(cases)) {
    assert.equal(parseChatRequest(body).ok, false, name);
  }
});

test('rate limiter blocks after the limit and recovers after the window', () => {
  let now = 0;
  const limiter = new RateLimiter(2, 1000, () => now);
  assert.equal(limiter.allow('a'), true);
  assert.equal(limiter.allow('a'), true);
  assert.equal(limiter.allow('a'), false);
  assert.equal(limiter.allow('b'), true);
  now = 1000;
  assert.equal(limiter.allow('a'), true);
});
