'use client';

import { useState, useRef, useEffect } from 'react';
import type { Message } from '../actions';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Components } from 'react-markdown';
import { embedText } from '../embeddings';

// Define more specific types for markdown components
type MarkdownComponentProps = {
  children?: React.ReactNode;
  className?: string;
};

// Type for code component which has special props
type CodeProps = MarkdownComponentProps & {
  inline?: boolean;
};

const formatTerm = (termId: string) => {
  const year = termId.slice(0, 4);
  return `${termId.slice(4) === '01' ? 'Spring' : 'Fall'} ${year}`;
};

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I am the UMD Scheduling Assistant. How can I help you today?',
      role: 'assistant',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedResponse, setHasStartedResponse] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isLoadingTerms, setIsLoadingTerms] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const response = await fetch('/api/collections');
        if (!response.ok) throw new Error(`Term request failed with status ${response.status}`);
        const data = await response.json() as { collections: string[] };
        setCollections(data.collections);
        setSelectedCollection(current => current || data.collections[0] || '');
      } catch (error) {
        console.error('Error loading available terms:', error);
      } finally {
        setIsLoadingTerms(false);
      }
    };

    void loadCollections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading || !selectedCollection) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      content: input,
      role: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setHasStartedResponse(false);

    const assistantId = Math.random().toString(36).substring(2, 11);
    let assistantAdded = false;
    try {
      const embedding = await embedText(userMessage.content);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          embedding,
          collection: selectedCollection,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }
      if (!response.body) {
        throw new Error('The chat response did not include a readable stream.');
      }

      setMessages(prev => [
        ...prev,
        {
          id: assistantId,
          content: '',
          role: 'assistant',
          timestamp: Date.now(),
        },
      ]);
      assistantAdded = true;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        setHasStartedResponse(true);
        setMessages(prev => prev.map(message =>
          message.id === assistantId
            ? { ...message, content: message.content + chunk }
            : message
        ));
      }

      const finalChunk = decoder.decode();
      if (finalChunk) {
        setHasStartedResponse(true);
        setMessages(prev => prev.map(message =>
          message.id === assistantId
            ? { ...message, content: message.content + finalChunk }
            : message
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => assistantAdded
        ? prev.map(message => message.id === assistantId
          ? {
              ...message,
              content: message.content || 'Sorry, I encountered an error. Please try again.',
            }
          : message)
        : [
            ...prev,
            {
              id: assistantId,
              content: 'Sorry, I encountered an error. Please try again.',
              role: 'assistant',
              timestamp: Date.now()
            }
          ]
      );
    } finally {
      setIsLoading(false);
      setHasStartedResponse(false);
    }
  };

  // Preprocess markdown content to handle complex formatting
  const preprocessMarkdown = (content: string) => {
    // Handle cases where multiple asterisks are used in a row
    // This pattern looks for text wrapped in 3 or more asterisks and normalizes them to 2 asterisks
    let processedContent = content.replace(/\*{3,}([^*]+)\*{3,}/g, '**$1**');
    
    // Fix combinations of bold+italic that might break markdown
    processedContent = processedContent.replace(/\*{2,}_+\*{2,}([^*_]+)\*{2,}_+\*{2,}/g, '***$1***');
    
    // Fix arrows with spaces that might break markdown
    processedContent = processedContent.replace(/-->\s+/g, '--> ');
    
    return processedContent;
  };

  // Custom markdown components for light theme
  const markdownComponents: Components = {
    table: (props: MarkdownComponentProps) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden" {...props} />
      </div>
    ),
    th: (props: MarkdownComponentProps) => <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-900" {...props} />,
    td: (props: MarkdownComponentProps) => <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />,
    ol: (props: MarkdownComponentProps) => <ol className="list-decimal pl-6 my-3 space-y-1" {...props} />,
    ul: (props: MarkdownComponentProps) => <ul className="list-disc pl-6 my-3 space-y-1" {...props} />,
    li: (props: MarkdownComponentProps) => <li className="text-gray-700 leading-relaxed" {...props} />,
    p: (props: MarkdownComponentProps) => <p className="my-3 text-gray-700 leading-relaxed" {...props} />,
    h1: (props: MarkdownComponentProps) => <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900" {...props} />,
    h2: (props: MarkdownComponentProps) => <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900" {...props} />,
    h3: (props: MarkdownComponentProps) => <h3 className="text-lg font-bold mt-4 mb-2 text-gray-900" {...props} />,
    pre: (props: MarkdownComponentProps) => <pre className="bg-gray-100 border border-gray-300 p-4 rounded-lg my-4 overflow-x-auto text-sm" {...props} />,
    code: ({ className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match && !className;
      return isInline ? (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-[var(--umd-red-dark)]" {...props}>
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // Handle strong and emphasis specifically for nested cases
    strong: ({ children, ...props }: MarkdownComponentProps) => (
      <strong className="font-bold text-gray-900" {...props}>{children}</strong>
    ),
    em: ({ children, ...props }: MarkdownComponentProps) => (
      <em className="italic text-gray-700" {...props}>{children}</em>
    ),
    blockquote: (props: MarkdownComponentProps) => (
      <blockquote className="border-l-4 border-[var(--umd-red)] pl-4 my-4 italic text-gray-600" {...props} />
    )
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-gray-50">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`rounded-2xl px-6 py-4 max-w-[80%] shadow-sm ${
                  message.role === 'assistant' 
                    ? 'bg-white border border-gray-200 rounded-bl-sm' 
                    : 'bg-[var(--umd-red)] text-white rounded-br-sm'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-gray max-w-none text-base">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                      components={markdownComponents}
                    >
                      {preprocessMarkdown(message.content)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && !hasStartedResponse && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white border border-gray-200 px-6 py-4 rounded-bl-sm shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[var(--umd-red)] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[var(--umd-red)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-[var(--umd-red)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <label className="sr-only" htmlFor="term-selector">Course term</label>
          <select
            id="term-selector"
            value={selectedCollection}
            onChange={(event) => setSelectedCollection(event.target.value)}
            disabled={isLoading || isLoadingTerms || collections.length === 0}
            className="h-12 shrink-0 rounded-xl border border-gray-300 bg-white px-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--umd-red)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Course term"
          >
            {isLoadingTerms && <option>Loading terms…</option>}
            {!isLoadingTerms && collections.length === 0 && <option>No terms available</option>}
            {collections.map((collection) => (
              <option key={collection} value={collection}>{formatTerm(collection)}</option>
            ))}
          </select>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message here..."
            className="flex-1 resize-none px-4 py-3 bg-white text-gray-900 text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--umd-red)] min-h-[48px] max-h-[200px] border border-gray-300 placeholder-gray-500"
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || input.trim() === '' || !selectedCollection}
            className="umd-button-primary px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm h-12 flex items-center justify-center min-w-[48px] cursor-pointer"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
} 
