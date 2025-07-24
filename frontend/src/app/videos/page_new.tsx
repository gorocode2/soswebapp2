'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/app/components/Header';
import BottomNavigation from '@/app/components/BottomNavigation';

// SVG Icon Components
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path>
  </svg>
);

const MagnifyingGlassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
  </svg>
);

// Video data
const featuredVideos = [
  {
    id: 1,
    title: 'Mastering Hill Climbs',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYHIkRZUk4LiVdgaDpF6-ncExpGKkESrOBoqDbEAO-DDah_kOrhdnkKzUDsgyBBYRBY_NzSVpApy6gCMJftIOMZVpX0KHG49j4i6GDECxWWsPvnaLkF5lrPuQEy3KjNhNdTVDh50PftA-FygW0SzjbeiOqfJrHsTe313njkNUujYPt10Xylr0rl3d55tayIdNc8zydnWhBXLivHyMl6M3v6VoLdNBouEVQPssOqDJlLAKHuKZtsijC21CH2-M7AKAi4iv4gzTqAQ'
  },
  {
    id: 2,
    title: 'Optimizing Flat Road Efficiency',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm-yYyUKMI6rDScPkAubMkS4WsV5X9KCO0NHQy9Ul62OI8_lPKGf69NId-TjMaLe8kdMWl4kuGwRllWAIEEpTN_WeB6J7uO2aY_iGRNEw6NAfZAPyfG_IGGj0a_m4KBr88fRfISI68ChY4ZQgu7LUGwD5cSq1INWuSb2OHER9pFSB49MxZGXj0vbJBtD8r4LURpWkB7ENd94hv54NJO1fdlTtFktfWzg-e5LzL4RAwnoM4yw7GFk2mKVemFC2O1zdgQtTCz3WhTA'
  },
  {
    id: 3,
    title: 'Group Riding Tactics',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7K0Nhs2c_7GxzwDSQ1D2iIIcTs31BqQIS3Ys2YQZTj4BRvSJO7xOg991J7W1awvh152ceUkLEfconSfO7s3Yndm__xy0jy9x6Dxik7ENyzspFwEg6kIfkJ5azjRDEz8YqojJtFqIhFOvu6ey6QiFOp1K60xY4237iMDY4smsAQtFw3lVrc8zoQuVFMJhESyf19GW9ac_XpZrdO1fY_FWaT6rs87MD1QDh0zBxeRhd9JFT9NMoVywJueaEvx-0_KHEuPJ57CaePw'
  }
];

const techniqueVideos = [
  {
    id: 4,
    title: 'Perfecting Your Pedal Stroke',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9z-FO-2vekHDyjb_Qj3sr3-GPkGqc8SiXNTTXLE6l5nmXwCOD9B7AqvIx8dYQWBjlP3txw7mrzGtj4eMkGAPIQGAJ1FsbpZvNS4hckgc9NYWnf_wRhwjDEWg-v5smkjiWGyZb7lLpaxt8TgJWG05xk6GpMci1KP9M7dXiJn6xpcAUEyileUFeWEu-A_jFxOarOWNeO1ZvlTPHq1gcTpSKmAXTyVmYK13srJ-df_-vEYRgX7t4r7qlBPGKnnPAVtdzyYlxbuPYAA'
  },
  {
    id: 5,
    title: 'Efficient Gear Shifting',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd05k1Eb04cPMsleK7_J2OmfYyw8YQaKcOVHvFuSraWao0hN8BUjCh38GM46hFkcqdLy2gAeoIG4mHXjBb0n-jO_jGG5WDIJ_LMiJ7f8a5wxOqeujqCAaC46DxLgIqlWx7Yqoio4QLPpdTDxrXk22uBVPssnUZGrb_2ujkscFz4sz4hujIPBDQqTDZGsFBrQi_TmQ3-VNoadjvUBiHUuPXGpyTtnK9WcvhSemYqKUibgvhsOG4tRe4e-4fzIkITtY7JGF8dZ2fmw'
  },
  {
    id: 6,
    title: 'Maintaining Balance at Low Speeds',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0_NQeatIYqRpsGbmrongquOTCUBPsx5t_Q9CAcOjSJoiaD9QITNVEOc7VaNTVwX7d3J1N1OXI1vKwRM60quhkzxRYi9o0Q1rcsIOmy9AqJs7ZCQSChA71RICL4AakjRJ36FddeEDNNgIBN1ch126IxFFOQ1Bln-JksSqEZZmFqGf8zW_gZiO76lHD9Xdtb7YyNBpQcHdPHgKFTwSmGCzKtsQwsr801GMNc5Xq5o_9jirU-jy-a1SREoqg30OlfWzqODwLMNxwAg'
  }
];

const tipsVideos = [
  {
    id: 7,
    title: 'Nutrition for Endurance',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_FCmkWKiSzCxCdomqGEqxPXvTlDnkAIFEgRlrqv2zQ2kf3RBRlzoAiboEgOQM8bO6Tsf4MW7PS3vfglp_mgTFXi09xNX2Uw0JT9_Cqs3c6yRZ_6XYkGLWBUdzN4eHwy8ZvUgaOcZzRpjS2Bag3GsGskXGnk-9BR3OyIEDJpN27U3wZXHmxbWKZizII9Rvje9O9m7CKRYCgVSBltk4-PxubhoFxO90lZXTEYAjU9JjMINF1OER9M9pW9xXRTMHorkO74h8i5p84g'
  },
  {
    id: 8,
    title: 'Hydration Strategies',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjZsiDhWsbOfkVJU7-TYJ-6ZozPzxOlet0t1VMTr3e1Tm9mY008n9-fCL5rwO8bXyN_wW7fm1ceI7iXMeadKItTMRdwR8aUAubpjqSQEBLdnnbjklGcrfNludcrhgZpbu_NSXroj_CDJ8BeINAB7yOUlw7awTO5GI7utq7kPUR6jzcNLHFq2skRqE9NybuSl7xCqc-fH8Tj4nd12srefqz08f23gyaxBu2byQdAnz6UTChFDAQHNscTIMh3QryRJAaWBZhescF9A'
  },
  {
    id: 9,
    title: 'Bike Maintenance Basics',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZE6vl_WSBexmkGYf_FVlAU8GTnRHB24nixurmMry0oimvODRVse5ZBx_UeAQn27v4_UJ78LnEOrkjkiT5PGbxUWuDy6t3eWrLYKYmRKmXMY4VI6JZMpYrxkS2ya6ELPN8Y2lhtyDFALPfdIcx-mNGCMMGtGLi3vIHxajafsPnkixV4SMMkj00rawW8pFjc_9nErSZtGstL7DPRv4luP5WrRemKFB8XcNaOS-dhEM-hz6Q6vNk_SSuA2DRRFIeIobwKdFarSdvVQ'
  }
];

const workoutVideos = [
  {
    id: 10,
    title: 'Interval Training for Speed',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsHErZX4oT7j1esH-_7q53EXbmXaYW2uSXpamYya88-l0VazwNMwbrbPNtYMJJhJEmQIBDkNHiTmgFEXJax7TiZLlCjWUO4u1esEMclSO5of2ewHi4szZ1Bqdsl_MLrdPYxWFqoib49g2CziIRp1tKHW1bRwQtTdo8Q5QGqPHf2VDNouuXDBF0Bmq51Nn1tnwbYvwPY8qf2y929o7Y_to9wavjqidGdtmvGUnB4pTnfgALEfX7SNsVzPt3BCg0UomyeOkFsug8nQ'
  },
  {
    id: 11,
    title: 'Endurance Building Rides',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH7IORg6otCDxC6FJC0RhcMvB2jvhpOwl1jRUGX3sVcLii0dbQxwLNuDtgI9CHsMnS5B4AGjCvDXRcf1nxvCjvzIdct2RHYEe0SCfNCWtWNE6rrHhhZaqt66y9BBiOl0GBQmH9h0WUo9acSI_Nvn5deU87cGEtisB2jWmo3zhcf2T9T1hvFT524tKZfo1Ig1mTKOiMITWzBzDOdhlH_HIk3_fuDaEkfIhVKaXRnS6LxLunNJG8-buJVSiggeGHOaFKeNaLBy5A3A'
  },
  {
    id: 12,
    title: 'Recovery Ride Techniques',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnl19F3o3OUU8gb44ShDICcSoVyIr-LQUHBM7nbWep4h5PEyXl-H-YCFP8p6Bi6oz3oO1hSoAhjL0J7xjrGWIH50Y0_Sl16rvZNczjaCBGnT-q9lz6NkSx06CjJ4Pml2BqAMgr1m79-JwtmYNtleukwpW9ScUhaUjQ280pOOHOjxL9eUbGTXzJTgSxCTjfizxfiGQS5U6LgbEP4OOCf_dH_NIT24qQw6z1-PpUVfBBXGq9IT_PlPZiChAZnrCO_zX7Okyrf2FAdQ'
  }
];

export default function VideosPage() {
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#101a23] group/design-root overflow-x-hidden">
      <Header user={user} onLogout={logout} />
      <main className="flex-grow pb-24">
        <div className="flex items-center bg-[#101a23] p-4 pb-2 justify-between">
          <button className="text-white flex size-12 shrink-0 items-center">
            <ArrowLeftIcon />
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Video Library</h2>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 py-3">
          <label className="flex flex-col min-w-40 h-12 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#90adcb] flex border-none bg-[#223649] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <MagnifyingGlassIcon />
              </div>
              <input
                placeholder="Search"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#223649] focus:border-none h-full placeholder:text-[#90adcb] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Featured Section */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Featured</h3>
        <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-stretch p-4 gap-3">
            {featuredVideos.map((video) => (
              <div key={video.id} className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex flex-col"
                  style={{ backgroundImage: `url("${video.thumbnail}")` }}
                />
                <p className="text-white text-base font-medium leading-normal">{video.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Technique Section */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Technique</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {techniqueVideos.map((video) => (
            <div key={video.id} className="flex flex-col gap-3 pb-3">
              <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                style={{ backgroundImage: `url("${video.thumbnail}")` }}
              />
              <p className="text-white text-base font-medium leading-normal">{video.title}</p>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Tips</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {tipsVideos.map((video) => (
            <div key={video.id} className="flex flex-col gap-3 pb-3">
              <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                style={{ backgroundImage: `url("${video.thumbnail}")` }}
              />
              <p className="text-white text-base font-medium leading-normal">{video.title}</p>
            </div>
          ))}
        </div>

        {/* Workouts Section */}
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Workouts</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
          {workoutVideos.map((video) => (
            <div key={video.id} className="flex flex-col gap-3 pb-3">
              <div
                className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                style={{ backgroundImage: `url("${video.thumbnail}")` }}
              />
              <p className="text-white text-base font-medium leading-normal">{video.title}</p>
            </div>
          ))}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}
