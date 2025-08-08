'use client';

import { useState, useEffect } from 'react';

export default function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if app is installed
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    checkInstallation();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isInstalled) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div className="flex items-center space-x-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs">
          <span>📱</span>
          <span>App Installed</span>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div className="flex items-center space-x-2 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs">
          <span>📶</span>
          <span>Offline Mode</span>
        </div>
      </div>
    );
  }

  return null;
}
