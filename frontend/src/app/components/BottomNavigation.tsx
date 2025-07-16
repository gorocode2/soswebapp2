'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BottomNavItem {
  href: string;
  icon: string;
  label: string;
}

const navItems: BottomNavItem[] = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/workout', icon: '💪', label: 'Workout' },
  { href: '/videos', icon: '🎥', label: 'Videos' },
  { href: '/profile', icon: '👤', label: 'Profile' },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-blue-400 bg-blue-500/10 scale-105'
                  : 'text-slate-400 hover:text-blue-300 hover:bg-slate-800/50'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}