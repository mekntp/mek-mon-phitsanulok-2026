import React from 'react';
import { MapPin, Camera, Trophy, Settings } from 'lucide-react';

interface HeaderProps {
  activeTab: 'places' | 'hunt';
  setActiveTab: (tab: 'places' | 'hunt') => void;
  totalStars: number;
  completedCount: number;
  onOpenVictory: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  totalStars,
  completedCount,
  onOpenVictory,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      <div className="max-w-md mx-auto px-4 pt-3 pb-2">
        {/* Title Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl drop-shadow-xs">🚂</span>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                <span>ทริปพ่อลูก พิษณุโลก</span>
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300/60">
                  2026
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Dad & Son Adventure • ตะลุยเมืองสองแคว</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenVictory}
              title="สรุปเหรียญรางวัล"
              className="relative p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <Trophy className="w-5 h-5 text-amber-500" />
              {completedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {completedCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenSettings}
              title="ตั้งค่า"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="grid grid-cols-2 gap-2 bg-amber-100/60 p-1 rounded-2xl border border-amber-200/50">
          <button
            onClick={() => setActiveTab('places')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'places'
                ? 'bg-white text-amber-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className={`w-4 h-4 ${activeTab === 'places' ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>🗺️ แผนการเดินทาง</span>
          </button>

          <button
            onClick={() => setActiveTab('hunt')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-medium text-sm transition-all cursor-pointer relative ${
              activeTab === 'hunt'
                ? 'bg-white text-orange-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className={`w-4 h-4 ${activeTab === 'hunt' ? 'text-orange-500' : 'text-slate-400'}`} />
            <span>📸 Photo Hunt</span>
            {totalStars > 0 && (
              <span className="ml-1 text-xs bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                {totalStars}★
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
