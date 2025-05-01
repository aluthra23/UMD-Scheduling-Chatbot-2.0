import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UMD Scheduling Chatbot",
  description: "Chat with UMD Scheduling Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-[#0e0e0e] to-black`}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-[var(--umd-darkest-red)] to-[var(--umd-dark-red)] text-white py-3 px-4 md:px-8 shadow-md flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              UMD Scheduling Chatbot
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://aravluthra.vercel.app/contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="umd-button bg-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.25)] text-white rounded-full py-1.5 px-4 transition-all duration-300 cursor-pointer hidden sm:flex items-center text-sm shadow-md border border-[rgba(255,255,255,0.1)]"
              aria-label="Give Feedback"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Have Feedback?
            </a>
            {/* Mobile version - icon only */}
            <a 
              href="https://aravluthra.vercel.app/contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="umd-button bg-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.25)] text-white rounded-full p-1.5 transition-all duration-300 cursor-pointer flex sm:hidden items-center justify-center shadow-md border border-[rgba(255,255,255,0.1)]"
              aria-label="Give Feedback"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </a>
            <a 
              href="https://github.com/aluthra23/UMD-Scheduling-Chatbot-2.0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200 transition-colors cursor-pointer"
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
          </div>
        </header>
        
        {children}
      </body>
    </html>
  );
}
