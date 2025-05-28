'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Your Personal{' '}
              <span className="text-[var(--umd-red)]">UMD</span>{' '}
              Scheduling Assistant
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
              Find courses, plan your schedule, and get answers to all your University of Maryland registration questions
            </p>
            <Link 
              href="/chat" 
              className="umd-button-primary py-4 px-8 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 inline-block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Can Help You</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get instant, accurate answers to all your UMD scheduling questions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card bg-white p-8 rounded-xl shadow-sm">
              <div className="feature-icon w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Course Information</h3>
              <p className="text-gray-600 leading-relaxed">Get detailed information about courses, prerequisites, credit hours, and instructors all in one place.</p>
            </div>
            
            <div className="feature-card bg-white p-8 rounded-xl shadow-sm">
              <div className="feature-icon w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Schedule Planning</h3>
              <p className="text-gray-600 leading-relaxed">Get help planning your schedule, finding open sections, and balancing your course load effectively.</p>
            </div>
            
            <div className="feature-card bg-white p-8 rounded-xl shadow-sm">
              <div className="feature-icon w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Registration Help</h3>
              <p className="text-gray-600 leading-relaxed">Get answers to common registration questions, deadlines, and procedures with instant support.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Technologies Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built with Modern Technology</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by cutting-edge AI and web technologies for the best user experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="feature-icon w-14 h-14 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 13 4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Next.js</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Built with React and Next.js for a smooth, responsive user experience.</p>
            </div>
            
            <div className="feature-card bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="feature-icon w-14 h-14 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Qdrant</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Vector database for semantic search and efficient information retrieval.</p>
            </div>
            
            <div className="feature-card bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="feature-icon w-14 h-14 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v8.4a7.48 7.48 0 0 1-3 6V22h6v-5.6a7.48 7.48 0 0 1-3-6V2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Gemini AI</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Powered by Google&apos;s Gemini AI models to generate accurate, helpful responses.</p>
            </div>
            
            <div className="feature-card bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="feature-icon w-14 h-14 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Web Scraping</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Advanced data collection techniques to gather up-to-date UMD course information.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Ask questions about courses, check prerequisites, plan your schedule, and more with the UMD Scheduling Chatbot.
            </p>
            <Link 
              href="/chat"
              className="umd-button-primary py-4 px-8 rounded-xl text-lg font-semibold shadow-lg transition-all duration-200 inline-block"
            >
              Launch Chatbot
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} UMD Scheduling Chatbot | Created by Arav Luthra
            </p>
            <div className="mt-4">
              <a 
                href="https://aravluthra.vercel.app/contact" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-[var(--umd-red)] hover:text-[var(--umd-red-dark)] font-medium transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Have feedback? Contact Arav
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}