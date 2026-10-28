export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  isError?: boolean;
}

export interface TermsResponse {
  collections: string[];
  lastSynced: Record<string, string>;
}
