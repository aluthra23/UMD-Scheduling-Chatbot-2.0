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

  // Custom markdown components
  const markdownComponents: Components = {
    table: (props: MarkdownComponentProps) => (
      <div className="overflow-x-auto my-1">
        <table className="border-collapse border border-gray-700" {...props} />
      </div>
    ),
    th: (props: MarkdownComponentProps) => <th className="border border-gray-700 bg-gray-800 px-3 py-1 text-sm" {...props} />,
    td: (props: MarkdownComponentProps) => <td className="border border-gray-700 px-3 py-1 text-sm" {...props} />,
    ol: (props: MarkdownComponentProps) => <ol className="list-decimal pl-6 my-1" {...props} />,
    ul: (props: MarkdownComponentProps) => <ul className="list-disc pl-6 my-1" {...props} />,
    li: (props: MarkdownComponentProps) => <li className="my-0.5 display-list-item" {...props} />,
    p: (props: MarkdownComponentProps) => <p className="my-1" {...props} />,
    h1: (props: MarkdownComponentProps) => <h1 className="text-xl font-bold mt-3 mb-1" {...props} />,
    h2: (props: MarkdownComponentProps) => <h2 className="text-lg font-bold mt-3 mb-1" {...props} />,
    h3: (props: MarkdownComponentProps) => <h3 className="text-base font-bold mt-2 mb-1" {...props} />,
    pre: (props: MarkdownComponentProps) => <pre className="bg-gray-800 p-2 rounded my-2 overflow-x-auto" {...props} />,
    code: ({ className, children, ...props }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match && !className;
      return isInline ? (
        <code className="bg-gray-800 px-1 py-0.5 rounded text-xs" {...props}>
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
      <strong className="font-bold" {...props}>{children}</strong>
    ),
    em: ({ children, ...props }: MarkdownComponentProps) => (
      <em className="italic" {...props}>{children}</em>
    )
  };

  return (
    <div className="flex flex-col h-[calc(100vh-58px)]">
      {/* Back to Home Link */}
      {/* <div className="bg-gray-900 px-4 py-2">
        <Link 
          href="/"
          className="text-gray-300 hover:text-white transition-colors cursor-pointer inline-flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </Link>
      </div> */}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          >
            <div 
              className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-md ${
                message.role === 'assistant' 
                  ? 'bg-[var(--chat-bot-bg)] text-white border-l-2 border-[var(--umd-gold)] rounded-tl-sm' 
                  : 'bg-gradient-to-r from-[var(--umd-darker-red)] to-[var(--umd-dark-red)] text-white rounded-tr-sm'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-invert text-base prose-p:my-1 prose-headings:mt-3 prose-headings:mb-1 prose-ul:list-disc prose-ol:list-decimal">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
                    components={markdownComponents}
                  >
                    {preprocessMarkdown(message.content)}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-base">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-[var(--chat-bot-bg)] text-white px-4 py-3 border-l-2 border-[var(--umd-gold)] rounded-tl-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleSubmit}
        className="bg-[var(--footer-bg)] border-t border-gray-900 p-4"
      >
        <div className="flex space-x-2">
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
            placeholder="Type your message..."
            className="flex-1 resize-none px-4 py-2 bg-[var(--input-bg)] text-white text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--umd-darker-red)] min-h-[40px] max-h-[200px] border border-gray-800 cursor-text"
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || input.trim() === ''}
            className="umd-button bg-gradient-to-r from-[var(--umd-darkest-red)] to-[var(--umd-dark-red)] hover:from-[var(--umd-dark-red)] hover:to-[var(--umd-darkest-red)] text-white px-3 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-md h-10 w-10 flex items-center justify-center cursor-pointer"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
} 