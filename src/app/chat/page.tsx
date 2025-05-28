'use client';

import { useState, useRef, useEffect } from 'react';
import { chat, Message } from '../actions';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Components } from 'react-markdown';

// Define more specific types for markdown components
type MarkdownComponentProps = {
  children?: React.ReactNode;
  className?: string;
};

// Type for code component which has special props
type CodeProps = MarkdownComponentProps & {
  inline?: boolean;
};

export default function ChatPage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 11),
      content: input,
      role: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat([...messages, userMessage]);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 11),
          content: 'Sorry, I encountered an error. Please try again.',
          role: 'assistant',
          timestamp: Date.now()
        }
      ]);
    } finally {
      setIsLoading(false);
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
          {isLoading && (
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
        <div className="flex space-x-4">
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
            disabled={isLoading || input.trim() === ''}
            className="umd-button-primary px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm h-12 flex items-center justify-center min-w-[48px]"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 