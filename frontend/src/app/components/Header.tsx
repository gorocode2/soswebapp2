'use client';

import React from 'react';
import Image from 'next/image';
import { User } from '@/models/types';
import { GearIcon } from './icons';


interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="grid grid-cols-3 items-center bg-[#101a23] p-4 pb-2">
      {/* Left: Greeting */}
      <div className="flex justify-start">
        <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] whitespace-nowrap">
          School of Sharks
        </h1>
      </div>

      {/* Center: Logo */}
      <div className="flex justify-center">
        <Image
          src="/images/soslogosmall.png"
          alt="School of Sharks Logo"
          width={40} // Corresponds to roughly h-10
          height={40}
          className="h-10 w-auto" // Sized to fit well with the text
        />
      </div>

      {/* Right: Language & Settings */}
      <div className="flex justify-end items-center gap-3">
       <button
          onClick={onLogout}
          className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0"
        >
        <span className="text-white text-lg font-bold">Hi, {user?.firstName || user?.username}</span>
       
        </button>
      </div>
    </header>
  );
}
