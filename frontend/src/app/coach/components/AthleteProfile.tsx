import React from 'react';
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

interface AthleteProfileProps {
  athlete: Athlete | null;
}

export default function AthleteProfile({ athlete }: AthleteProfileProps) {
  const { t } = useLanguage();

  if (!athlete) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-[#314d68] p-6">
        <h3 className="text-white text-lg font-semibold mb-4">{t('coach.selectAthlete')}</h3>
        <p className="text-gray-400">{t('coach.selectAthleteDescription')}</p>
      </div>
    );
  }

  const getDisplayName = (athlete: Athlete) => {
    if (athlete.firstName && athlete.lastName) {
      return `${athlete.firstName} ${athlete.lastName}`;
    }
    return athlete.username;
  };

  const getFitnessLevelColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'pro': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLastActivityColor = (lastActivity?: string) => {
    if (!lastActivity) return 'text-gray-400';
    
    const lastDate = new Date(lastActivity);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) return 'text-green-400';
    if (daysDiff <= 3) return 'text-yellow-400';
    if (daysDiff <= 7) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-[#314d68] p-6">
      <h3 className="text-white text-lg font-semibold mb-6">
        {t('coach.athlete.profile')}
      </h3>

      {/* Athlete Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {getDisplayName(athlete).charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="text-white text-xl font-semibold">
            {getDisplayName(athlete)}
          </h4>
          <p className="text-[#94a3b8] text-sm">
            @{athlete.username}
          </p>
          {athlete.fitnessLevel && (
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getFitnessLevelColor(athlete.fitnessLevel)}`}>
              {athlete.fitnessLevel}
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="mb-6">
        <h5 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
          {t('coach.athlete.personalInfo')}
        </h5>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#94a3b8] text-sm">{t('coach.athlete.joinedDate')}</span>
            <span className="text-white text-sm">{formatDate(athlete.joinedDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94a3b8] text-sm">{t('coach.athlete.lastActivity')}</span>
            <span className={`text-sm ${getLastActivityColor(athlete.lastActivity)}`}>
              {athlete.lastActivity ? formatDate(athlete.lastActivity) : 'N/A'}
            </span>
          </div>
          {athlete.weight && (
            <div className="flex justify-between">
              <span className="text-[#94a3b8] text-sm">{t('coach.athlete.weight')}</span>
              <span className="text-white text-sm">{athlete.weight} kg</span>
            </div>
          )}
          {athlete.height && (
            <div className="flex justify-between">
              <span className="text-[#94a3b8] text-sm">{t('coach.athlete.height')}</span>
              <span className="text-white text-sm">{athlete.height} cm</span>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-6">
        <h5 className="text-white text-sm font-semibold mb-3 uppercase tracking-wide">
          {t('coach.athlete.performance')}
        </h5>
        <div className="space-y-3">
          {athlete.ftp && (
            <div className="flex justify-between">
              <span className="text-[#94a3b8] text-sm">{t('coach.athlete.ftp')}</span>
              <span className="text-white text-sm font-semibold">{athlete.ftp}W</span>
            </div>
          )}
          {athlete.maxHeartRate && (
            <div className="flex justify-between">
              <span className="text-[#94a3b8] text-sm">{t('coach.athlete.maxHeartRate')}</span>
              <span className="text-white text-sm">{athlete.maxHeartRate} bpm</span>
            </div>
          )}
          {athlete.restHeartRate && (
            <div className="flex justify-between">
              <span className="text-[#94a3b8] text-sm">{t('coach.athlete.restHeartRate')}</span>
              <span className="text-white text-sm">{athlete.restHeartRate} bpm</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200">
          {t('coach.actions.assignWorkout')}
        </button>
        <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors duration-200">
          {t('coach.actions.viewProgress')}
        </button>
        <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors duration-200">
          {t('coach.actions.sendMessage')}
        </button>
      </div>
    </div>
  );
}
