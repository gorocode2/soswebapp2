import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../../i18n';

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
  duration?: number;
  targetPower?: number;
  actualPower?: number;
  targetHeartRate?: number;
  actualHeartRate?: number;
  notes?: string;
  coachNotes?: string;
}

interface CoachStatsProps {
  athletes: Athlete[];
  workouts: WorkoutSession[];
}

interface CoachStatsData {
  totalAthletes: number;
  activeWorkouts: number;
  completedThisWeek: number;
}

export default function CoachStats({ athletes, workouts }: CoachStatsProps) {
  const { t } = useLanguage();
  const [statsData, setStatsData] = useState<CoachStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stats from API
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/coach/stats');
        const result = await response.json();
        
        if (result.success) {
          setStatsData(result.data);
        } else {
          // Fallback to calculated stats from props
          const totalAthletes = athletes.length;
          const activeWorkouts = workouts.filter(w => w.status === 'in_progress').length;
          const completedThisWeek = workouts.filter(w => {
            const workoutDate = new Date(w.date);
            const now = new Date();
            const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            return w.status === 'completed' && workoutDate >= weekStart;
          }).length;
          
          setStatsData({
            totalAthletes,
            activeWorkouts,
            completedThisWeek
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback to calculated stats from props
        const totalAthletes = athletes.length;
        const activeWorkouts = workouts.filter(w => w.status === 'in_progress').length;
        const completedThisWeek = workouts.filter(w => {
          const workoutDate = new Date(w.date);
          const now = new Date();
          const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
          return w.status === 'completed' && workoutDate >= weekStart;
        }).length;
        
        setStatsData({
          totalAthletes,
          activeWorkouts,
          completedThisWeek
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [athletes, workouts]);

  if (isLoading || !statsData) {
    return (
      <div className="mb-8">
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-1 pb-3">
          {t('coach.athleteStats')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse bg-slate-800/50 rounded-xl border border-[#314d68] p-6">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: t('coach.totalAthletes'),
      value: statsData.totalAthletes,
      icon: '👥',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      label: t('coach.activeWorkouts'),
      value: statsData.activeWorkouts,
      icon: '🏋️‍♂️',
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: t('coach.completedThisWeek'),
      value: statsData.completedThisWeek,
      icon: '✅',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-1 pb-3">
        {t('coach.athleteStats')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl border border-[#314d68] bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-300 group"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
            
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">{stat.icon}</div>
                <div className="text-white text-2xl font-bold">
                  {stat.value}
                </div>
              </div>
              <p className="text-[#94a3b8] text-sm font-medium">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
