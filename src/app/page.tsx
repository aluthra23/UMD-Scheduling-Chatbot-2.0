'use client';

import { useState, useRef, useEffect } from 'react';
import { chat, Message } from './actions';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Components } from 'react-markdown';

export default function Home() {
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

  // Custom markdown components
  const markdownComponents: Components = {
    table: ({node, ...props}) => (
      <div className="overflow-x-auto my-1">
        <table className="border-collapse border border-gray-700" {...props} />
      </div>
    ),
    th: ({node, ...props}) => <th className="border border-gray-700 bg-gray-800 px-3 py-1 text-sm" {...props} />,
    td: ({node, ...props}) => <td className="border border-gray-700 px-3 py-1 text-sm" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-1" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-6 my-1" {...props} />,
    li: ({node, ...props}) => <li className="my-0.5 display-list-item" {...props} />,
    p: ({node, ...props}) => <p className="my-1" {...props} />,
    h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-3 mb-1" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-1" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-base font-bold mt-2 mb-1" {...props} />,
    pre: ({node, ...props}) => <pre className="bg-gray-800 p-2 rounded my-2 overflow-x-auto" {...props} />,
    code: ({node, className, children, ...props}: any) => {
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
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#0e0e0e] to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-[var(--umd-darkest-red)] to-[var(--umd-dark-red)] text-white py-3 px-4 shadow-md flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">UMD Scheduling Chatbot</h1>
        </div>
        <a 
          href="https://github.com/aluthra23/UMD-Scheduling-Chatbot-2.0" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="GitHub Repository"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      </header>

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
                    {message.content}
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
            className="flex-1 resize-none px-4 py-2 bg-[var(--input-bg)] text-white text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--umd-darker-red)] min-h-[40px] max-h-[200px] border border-gray-800"
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || input.trim() === ''}
            className="bg-gradient-to-r from-[var(--umd-darkest-red)] to-[var(--umd-dark-red)] hover:from-[var(--umd-dark-red)] hover:to-[var(--umd-darkest-red)] text-white px-3 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-md h-10 w-10 flex items-center justify-center"
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