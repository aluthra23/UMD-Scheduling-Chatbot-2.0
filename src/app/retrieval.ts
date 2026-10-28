import type { Message } from './types';

export const TERM_COLLECTION_PATTERN = /^20\d{2}(01|08)$/;
export const EMBEDDING_DIMENSIONS = 384;
export const MAX_COURSE_CODES = 4;

const COURSE_CODE_PATTERN = /\b([A-Z]{4})\s?(\d{3}[A-Z]?)\b/g;
const CARRY_CODES_FROM_LAST_USER_MESSAGES = 2;
const MAX_HISTORY_TURNS = 6;
export const MAX_HISTORY_CHARS = 4000;

export interface Turn {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface RetrievedDocument {
  id: string | number;
  text: string;
}

export function formatTerm(termId: string): string {
  return `${termId.slice(4) === '01' ? 'Spring' : 'Fall'} ${termId.slice(0, 4)}`;
}

/** Course codes like "CMSC131" or "cmsc 131", uppercased, deduplicated, in order of appearance. */
export function extractCourseCodes(text: string): string[] {
  const codes = new Set<string>();
  for (const match of text.toUpperCase().matchAll(COURSE_CODE_PATTERN)) {
    codes.add(match[1] + match[2]);
  }
  return [...codes].slice(0, MAX_COURSE_CODES);
}

/** For follow-ups like "who teaches it?": course codes from the student's last couple of messages. */
export function carriedCourseCodes(previous: Message[], current: string): string[] {
  if (extractCourseCodes(current).length) return [];
  const recentUserText = previous
    .filter((message) => message.role === 'user')
    .slice(-CARRY_CODES_FROM_LAST_USER_MESSAGES)
    .reverse()
    .map((message) => message.content)
    .join(' ');
  return extractCourseCodes(recentUserText);
}

/** Merge result lists, keeping the first occurrence of each document. */
export function mergeDocuments(...lists: RetrievedDocument[][]): RetrievedDocument[] {
  const seen = new Set<string | number>();
  return lists.flat().filter((document) => {
    if (seen.has(document.id)) return false;
    seen.add(document.id);
    return true;
  });
}

/**
 * Earlier conversation as Gemini turns: skips error replies and the opening greeting, merges
 * consecutive same-role messages, and always starts with a user turn and ends with a model turn.
 */
export function buildHistory(previous: Message[]): Turn[] {
  const turns: Turn[] = [];
  for (const message of previous) {
    const text = message.content.trim().slice(0, MAX_HISTORY_CHARS);
    if (message.isError || !text) continue;
    const role = message.role === 'user' ? 'user' : 'model';
    if (!turns.length && role === 'model') continue;
    const last = turns[turns.length - 1];
    if (last?.role === role) {
      last.parts[0].text += `\n\n${text}`;
    } else {
      turns.push({ role, parts: [{ text }] });
    }
  }

  while (turns.length && turns[turns.length - 1].role !== 'model') turns.pop();
  let recent = turns.slice(-MAX_HISTORY_TURNS);
  while (recent.length && recent[0].role !== 'user') recent = recent.slice(1);
  return recent;
}

export function systemInstruction(termId: string, availableTerms: string[] = []): string {
  const term = formatTerm(termId);
  const otherTerms = availableTerms.filter((id) => id !== termId).map(formatTerm);
  return [
    'You are the UMD Scheduling Assistant. You help University of Maryland students with courses, sections,',
    'instructors, meeting times, seats, prerequisites, and general education (gen ed) requirements.',
    `The student has selected the ${term} term; every course and section you are given is from ${term}.`,
    otherTerms.length
      ? `This app also has data for ${otherTerms.join(', ')}. If the student asks about one of those terms, tell them to`
        + ' switch terms with the course-term dropdown next to the message box; do not say that data is unavailable.'
        + ' If they ask about any other term, say it is not available in this app yet.'
      : 'No other terms are available in this app.',
    'Answer only from the course information in the latest message and the earlier conversation.',
    'If that information does not answer the question, say so and suggest checking Testudo',
    '(https://app.testudo.umd.edu/soc/). Never invent course numbers, sections, times, rooms, instructors, or seat counts.',
    'Seat and waitlist numbers are from the last data sync, not live.',
    'Format answers in Markdown, and use a table when comparing several sections or courses.',
  ].join(' ');
}

export function buildPrompt(termId: string, question: string, documents: RetrievedDocument[]): string {
  const context = documents.map((document) => document.text).join('\n\n---\n\n');
  return `Course information for ${formatTerm(termId)}:\n\n${context}\n\nStudent question: ${question}`;
}
