'use client';

import { ReactNode } from 'react';
import BottomNavigation from './BottomNavigation';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showBottomNav?: boolean;
}

export default function PageLayout({ children, title, showBottomNav = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
      {title && (
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🦈 <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
          </div>
        </header>
      )}
      
      <main className={`${showBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}
