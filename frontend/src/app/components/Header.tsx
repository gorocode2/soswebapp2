'use client';

import React from 'react';
import { User } from '@/models/types';
import { GearIcon } from './icons'; // Assuming GearIcon is in a separate icons file

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="flex items-center bg-[#101a23] p-4 pb-2 justify-between">
      <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
        School of Sharks
      </h1>
      <div className="flex items-center gap-4">
        <h1 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
          Hi, {user?.firstName || user?.username}
        </h1>
        <button
          onClick={onLogout}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0"
        >
          <div className="text-white">
            <GearIcon />
          </div>
        </button>
      </div>
    </header>
  );
}
