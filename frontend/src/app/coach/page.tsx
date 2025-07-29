'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '../../i18n';
import Header from '../components/Header';
import BottomNavigation from '../components/BottomNavigation';
import AthleteSelector from './components/AthleteSelector';
import WorkoutCalendar from './components/WorkoutCalendar';
import AthleteProfile from './components/AthleteProfile';
import CoachStats from './components/CoachStats';
import WorkoutLibrary from './components/WorkoutLibrary';

// Types for athlete and workout data
interface Athlete {
  id: number;
  uuid: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  ftp?: number;
  maxHeartRate?: number;
  restHeartRate?: number;
  weight?: number;
  height?: number;
  lastActivity?: string;
  joinedDate: string;
}

interface WorkoutSession {
  id: number;
  date: string;
  name: string;
  type: 'threshold' | 'vo2max' | 'endurance' | 'sprint' | 'recovery';
  status: 'planned' | 'in_progress' | 'completed' | 'missed' | 'skipped';
  duration?: number; // in minutes
  targetPower?: number;
  actualPower?: number;
  targetHeartRate?: number;
  actualHeartRate?: number;
  notes?: string;
  coachNotes?: string;
}

export default function CoachPage() {
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoadingAthletes, setIsLoadingAthletes] = useState(true);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [isWorkoutLibraryOpen, setIsWorkoutLibraryOpen] = useState(false);

  // Check authentication and coach permissions
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth?redirect=/coach');
    }
    // TODO: Add coach role verification here
  }, [isLoading, isLoggedIn, router]);

    // Load athletes list
  useEffect(() => {
    const loadAthletes = async () => {
      try {
        setIsLoadingAthletes(true);
        const response = await fetch('/api/coach/athletes');
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Loaded athletes from database:', result.data);
          setAthletes(result.data);
        } else {
          console.error('❌ Failed to load athletes:', result.message);
          setAthletes([]); // No fallback to mock data
        }
      } catch (error) {
        console.error('❌ Error loading athletes:', error);
        setAthletes([]); // No fallback to mock data
      } finally {
        setIsLoadingAthletes(false);
      }
    };

    loadAthletes();
  }, []);

  // Load workouts for selected athlete
  useEffect(() => {
    const loadWorkouts = async (athleteId: number) => {
      try {
        setIsLoadingWorkouts(true);
        const response = await fetch(`/api/coach/athletes/${athleteId}/workouts`);
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Loaded workouts from database:', result.data);
          setWorkouts(result.data);
        } else {
          console.error('❌ Failed to load workouts:', result.message);
          setWorkouts([]); // No fallback to mock data
        }
      } catch (error) {
        console.error('❌ Error loading workouts:', error);
        setWorkouts([]); // No fallback to mock data
      } finally {
        setIsLoadingWorkouts(false);
      }
    };

    if (selectedAthlete) {
      loadWorkouts(selectedAthlete.id);
    } else {
      setWorkouts([]);
    }
  }, [selectedAthlete]);

  // Loading states
  if (isLoading) {
    return (
      <div className="flex size-full min-h-screen flex-col bg-[#101a23] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <p className="text-white mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#101a23] dark justify-between group/design-root overflow-x-hidden">
      {/* Header */}
      <Header user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="flex-grow px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-white text-[32px] font-bold leading-tight tracking-[-0.015em] mb-2">
            {t('coach.title')}
          </h1>
          <p className="text-[#94a3b8] text-base leading-normal">
            {t('coach.subtitle')}
          </p>
        </div>

        {/* Coach Stats */}
        <CoachStats athletes={athletes} workouts={workouts} />

        {/* Athlete Selection */}
        <div className="mb-6">
          <AthleteSelector
            athletes={athletes}
            selectedAthlete={selectedAthlete}
            onSelectAthlete={setSelectedAthlete}
            isLoading={isLoadingAthletes}
          />
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => setIsWorkoutLibraryOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-lg">📚</span>
            Workout Library
          </button>
        </div>

        {/* Main Content Area */}
        {selectedAthlete ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Athlete Profile */}
            <div className="lg:col-span-1">
              <AthleteProfile athlete={selectedAthlete} />
            </div>

            {/* Workout Calendar */}
            <div className="lg:col-span-2">
              <WorkoutCalendar
                workouts={workouts}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isLoading={isLoadingWorkouts}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="text-6xl mb-4">🦈</div>
            <h3 className="text-white text-xl font-semibold mb-2">
              {t('coach.selectAthlete')}
            </h3>
            <p className="text-[#94a3b8] text-base">
              {t('coach.noAthleteSelected')}
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Workout Library Modal */}
      <WorkoutLibrary
        isOpen={isWorkoutLibraryOpen}
        onClose={() => setIsWorkoutLibraryOpen(false)}
      />
    </div>
  );
}
