import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Gmail Outreach Agent',
  description: 'Automated Gmail outreach with AI personalization',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-6xl p-6">
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Gmail Outreach Agent</h1>
            <a className="text-sm text-blue-600 underline" href="https://agentic-f96e1c23.vercel.app">Production</a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
