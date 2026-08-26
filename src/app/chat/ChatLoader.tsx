'use client';

import dynamic from 'next/dynamic';

const ChatClient = dynamic(() => import('./ChatClient'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-65px)] items-center justify-center bg-gray-50 text-gray-600">
      Loading scheduling assistant…
    </div>
  ),
});

export default function ChatLoader() {
  return <ChatClient />;
}
