'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="text-white">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--umd-red)] to-[var(--umd-gold)]">
            Your Personal UMD Scheduling Assistant
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10">
            Find courses, plan your schedule, and get answers to all your University of Maryland registration questions
          </p>
          <Link 
            href="/chat" 
            className="umd-button bg-gradient-to-r from-[var(--umd-dark-red)] to-[var(--umd-red)] hover:from-[var(--umd-red)] hover:to-[var(--umd-dark-red)] text-white py-3 px-8 rounded-full text-lg font-medium shadow-lg transition-all duration-300 inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">How It Can Help You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="feature-card bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl shadow-lg border border-gray-800">
            <div className="feature-icon bg-[var(--umd-red)] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Course Information</h3>
            <p className="text-gray-400">Get detailed information about courses, prerequisites, credit hours, and instructors.</p>
          </div>
          <div className="feature-card bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl shadow-lg border border-gray-800">
            <div className="feature-icon bg-[var(--umd-red)] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Schedule Planning</h3>
            <p className="text-gray-400">Get help planning your schedule, finding open sections, and balancing your course load.</p>
          </div>
          <div className="feature-card bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl shadow-lg border border-gray-800">
            <div className="feature-icon bg-[var(--umd-red)] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Registration Help</h3>
            <p className="text-gray-400">Get answers to common registration questions, deadlines, and procedures.</p>
          </div>
        </div>
      </div>

      {/* Technologies Section */}
      <div className="py-16 px-6 bg-gradient-to-br from-gray-950 to-black">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Technologies Used</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="feature-card bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl shadow-lg border border-gray-800 hover:border-[var(--umd-gold)]">
            <div className="feature-icon bg-[var(--umd-red)] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 13 4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Next.js</h3>
            <p className="text-gray-400">Built with React and Next.js for a smooth, responsive user experience.</p>
          </div>
          <div className="feature-card bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl shadow-lg border border-gray-800 hover:border-[var(--umd-gold)]">
            <div className="feature-icon bg-[var(--umd-red)] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Qdrant</h3>
            <p className="text-gray-400">Vector database for semantic search and efficient information retrieval.</p>
          </div>
          <div className="feature-card bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl shadow-lg border border-gray-800 hover:border-[var(--umd-gold)]">
            <div className="feature-icon bg-[var(--umd-red)] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v8.4a7.48 7.48 0 0 1-3 6V22h6v-5.6a7.48 7.48 0 0 1-3-6V2"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Gemini</h3>
            <p className="text-gray-400">Powered by Google&apos;s Gemini AI models to generate accurate, helpful responses.</p>
          </div>
          <div className="feature-card bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl shadow-lg border border-gray-800 hover:border-[var(--umd-gold)]">
            <div className="feature-icon bg-[var(--umd-red)] w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Web Scraping</h3>
            <p className="text-gray-400">Advanced data collection techniques to gather up-to-date UMD course information.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Get Started?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Ask questions about courses, check prerequisites, plan your schedule, and more with the UMD Scheduling Chatbot.
          </p>
          <Link 
            href="/chat"
            className="umd-button bg-gradient-to-r from-[var(--umd-dark-red)] to-[var(--umd-red)] hover:from-[var(--umd-red)] hover:to-[var(--umd-dark-red)] text-white py-3 px-8 rounded-full text-lg font-medium shadow-lg transition-all duration-300 inline-block"
          >
            Launch Chatbot
          </Link>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="py-8 px-6 bg-gradient-to-r from-gray-900 to-black">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-4 text-white">Have Feedback?</h3>
          <p className="text-gray-300 mb-6">
            Your feedback helps us improve the UMD Scheduling Chatbot experience.
          </p>
          <a 
            href="https://aravluthra.vercel.app/contact" 
            target="_blank"
            rel="noopener noreferrer"
            className="umd-button bg-gradient-to-r from-[var(--umd-darkest-red)] to-[var(--umd-dark-red)] hover:from-[var(--umd-dark-red)] hover:to-[var(--umd-darkest-red)] text-white py-2 px-6 rounded-full font-medium transition-all duration-300 inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Contact Arav
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} UMD Scheduling Chatbot | Created by Arav Luthra</p>
        </div>
      </footer>
    </div>
  );
}