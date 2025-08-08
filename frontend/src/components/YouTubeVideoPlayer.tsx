'use client';

import React, { useState } from 'react';

interface YouTubeVideoPlayerProps {
  videoId: string;
  title: string;
  description?: string;
  category?: string;
  isShort?: boolean;
  className?: string;
}

export default function YouTubeVideoPlayer({
  videoId,
  title,
  description,
  category,
  isShort = false,
  className = ''
}: YouTubeVideoPlayerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract video ID from various YouTube URL formats
  const extractVideoId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/shorts\/|youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return url; // If no pattern matches, assume it's already a video ID
  };

  const cleanVideoId = extractVideoId(videoId);

  const handleThumbnailClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* 1x1 Thumbnail */}
      <div className={`bg-gray-900 rounded-lg overflow-hidden cursor-pointer ${className}`}>
        <div 
          className="w-full aspect-square bg-center bg-no-repeat bg-cover relative"
          style={{
            backgroundImage: `url(https://img.youtube.com/vi/${cleanVideoId}/maxresdefault.jpg)`
          }}
          onClick={handleThumbnailClick}
        >
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-full p-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          
          {/* Shorts indicator */}
          {isShort && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
              SHORTS
            </div>
          )}
        </div>
        
        <div className="p-3">
          <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{title}</h3>
          {description && (
            <p className="text-gray-300 text-xs mb-2 line-clamp-2">{description}</p>
          )}
          {category && (
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                {category}
              </span>
              {isShort && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                  Shorts
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full-size Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl mx-4">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 z-10"
            >
              ✕
            </button>
            
            {/* Video container */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${cleanVideoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0${isShort ? '&loop=1' : ''}`}
                className="w-full h-full"
                allowFullScreen
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            
            {/* Video info below */}
            <div className="bg-gray-900 p-4 rounded-b-lg">
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              {description && (
                <p className="text-gray-300 text-sm mb-3">{description}</p>
              )}
              {category && (
                <div className="flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                    {category}
                  </span>
                  {isShort && (
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                      Shorts
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
