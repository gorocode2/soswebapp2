'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n';

interface BottomNavItem {
  href: string;
  icon: string;
  translationKey: string;
  requiresCoach?: boolean; // New property to mark coach-only items
}

const navItems: BottomNavItem[] = [
  { href: '/dashboard', icon: '📊', translationKey: 'nav.dashboard' },
  { href: '/workout', icon: '💪', translationKey: 'nav.workout' },
  { href: '/coach', icon: '🦈', translationKey: 'nav.coach', requiresCoach: true },
  { href: '/videos', icon: '🎥', translationKey: 'nav.videos' },
  { href: '/profile', icon: '👤', translationKey: 'nav.profile' },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(item => {
    if (item.requiresCoach) {
      return user?.is_coach === true;
    }
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/20 backdrop-blur-md border-t border-slate-800 z-50">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {visibleNavItems.map((item) => {
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
              <span className="text-xs font-medium">{t(item.translationKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}