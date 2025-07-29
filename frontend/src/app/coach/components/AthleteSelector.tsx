import React, { useState } from 'react';
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

interface AthleteSelectorProps {
  athletes: Athlete[];
  selectedAthlete: Athlete | null;
  onSelectAthlete: (athlete: Athlete | null) => void;
  isLoading: boolean;
}

export default function AthleteSelector({
  athletes,
  selectedAthlete,
  onSelectAthlete,
  isLoading
}: AthleteSelectorProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filter athletes based on search term
  const filteredAthletes = athletes.filter(athlete =>
    `${athlete.firstName} ${athlete.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    athlete.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAthleteSelect = (athlete: Athlete) => {
    onSelectAthlete(athlete);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const getFitnessLevelColor = (level?: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-orange-500/20 text-orange-400';
      case 'pro': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getDisplayName = (athlete: Athlete) => {
    if (athlete.firstName && athlete.lastName) {
      return `${athlete.firstName} ${athlete.lastName}`;
    }
    return athlete.username;
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 rounded-xl border border-[#314d68] p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 rounded-xl border border-[#314d68] p-6">
      <h3 className="text-white text-lg font-semibold mb-4">
        {t('coach.selectAthlete')}
      </h3>

      {/* Selected Athlete Display */}
      {selectedAthlete && (
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getDisplayName(selectedAthlete).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">
                  {getDisplayName(selectedAthlete)}
                </p>
                <p className="text-[#94a3b8] text-sm">
                  {selectedAthlete.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectAthlete(null)}
              className="text-[#94a3b8] hover:text-white transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Search and Selection */}
      <div className="relative">
        <input
          type="text"
          placeholder={t('coach.athleteSearch')}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-[#314d68] rounded-lg text-white placeholder-[#94a3b8] focus:outline-none focus:border-blue-500 transition-colors duration-200"
        />

        {/* Search Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#94a3b8]">
          🔍
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (searchTerm || !selectedAthlete) && (
          <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-[#314d68] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredAthletes.length > 0 ? (
              filteredAthletes.map((athlete) => (
                <button
                  key={athlete.id}
                  onClick={() => handleAthleteSelect(athlete)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-700/50 transition-colors duration-200 border-b border-slate-700/50 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getDisplayName(athlete).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium">
                          {getDisplayName(athlete)}
                        </p>
                        {athlete.fitnessLevel && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFitnessLevelColor(athlete.fitnessLevel)}`}>
                            {athlete.fitnessLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-[#94a3b8] text-sm">
                        {athlete.email}
                      </p>
                      {athlete.ftp && (
                        <p className="text-[#94a3b8] text-xs">
                          FTP: {athlete.ftp}W
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-[#94a3b8] text-center">
                No athletes found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
