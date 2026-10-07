import React, { useRef, useState } from 'react';
import type { PhotoMission, MissionState } from '../types';
import { Camera, Check, Star, Sparkles, Trash2, Maximize2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PhotoHuntTabProps {
  missions: PhotoMission[];
  missionStates: Record<number, MissionState>;
  onUpdateMission: (missionId: number, update: Partial<MissionState>) => void;
  onOpenPhotoPreview: (dataUrl: string, title: string) => void;
}

export const PhotoHuntTab: React.FC<PhotoHuntTabProps> = ({
  missions,
  missionStates,
  onUpdateMission,
  onOpenPhotoPreview,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleFileChange = (missionId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const current = missionStates[missionId] || { missionId, completed: false, stars: 0 };
      
      // Auto upgrade stars to at least 2 when photo is captured, or 3 if user previously picked 3
      const newStars = current.stars >= 2 ? current.stars : 2;

      onUpdateMission(missionId, {
        photoDataUrl: result,
        stars: newStars,
        completed: true,
        timestamp: new Date().toISOString(),
      });

      // Fire celebratory confetti!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6'],
      });
    };
    reader.readAsDataURL(file);
    // Reset file input so same file could be selected again if desired
    e.target.value = '';
  };

  const handleStarSelect = (missionId: number, stars: number) => {
    const current = missionStates[missionId] || { missionId, completed: false, stars: 0 };
    const isNowCompleted = stars > 0;
    
    onUpdateMission(missionId, {
      stars,
      completed: isNowCompleted,
    });

    if (stars === 3 || (current.stars === 0 && stars > 0)) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    }
  };

  const handleRemovePhoto = (missionId: number) => {
    const current = missionStates[missionId];
    if (!current) return;
    onUpdateMission(missionId, {
      photoDataUrl: undefined,
      photoUrl: undefined,
      stars: current.stars > 1 ? 1 : current.stars, // Downgrade to 1 star if still marked found
    });
  };

  // Filter missions
  const filteredMissions = missions.filter((m) => {
    const state = missionStates[m.id];
    const isCompleted = state?.completed || (state?.stars && state.stars > 0);
    if (filter === 'completed') return isCompleted;
    if (filter === 'pending') return !isCompleted;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Star Scoring Rule Explainer Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>กติกาการให้ดาว (เข้าใจง่ายสำหรับลูก 6 ขวบ):</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white/80 p-2 rounded-xl border border-amber-200/50">
            <div className="text-amber-500 font-bold flex justify-center mb-0.5">⭐ 1 ดาว</div>
            <div className="text-slate-600 text-[11px] leading-tight">หาเจอภารกิจ</div>
          </div>
          <div className="bg-white/80 p-2 rounded-xl border border-amber-200/50">
            <div className="text-amber-500 font-bold flex justify-center mb-0.5">⭐⭐ 2 ดาว</div>
            <div className="text-slate-600 text-[11px] leading-tight">หาเจอ + ถ่ายรูป</div>
          </div>
          <div className="bg-amber-100/80 p-2 rounded-xl border border-amber-300">
            <div className="text-orange-600 font-bold flex justify-center mb-0.5">⭐⭐⭐ 3 ดาว</div>
            <div className="text-orange-950 font-semibold text-[11px] leading-tight">ลูกถ่ายรูปเอง!</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-medium transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-amber-500 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ทั้งหมด ({missions.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-medium transition-all cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-500 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ยังไม่ทำ ({missions.filter((m) => !(missionStates[m.id]?.stars > 0)).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-medium transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          สำเร็จแล้ว ({missions.filter((m) => missionStates[m.id]?.stars > 0).length})
        </button>
      </div>

      {/* Missions List */}
      <div className="space-y-3.5">
        {filteredMissions.map((mission) => {
          const state = missionStates[mission.id] || { missionId: mission.id, completed: false, stars: 0 };
          const isCompleted = state.stars > 0 || state.completed;
          const photoUrl = state.photoDataUrl || state.photoUrl;

          return (
            <div
              key={mission.id}
              className={`rounded-2xl transition-all duration-200 border overflow-hidden ${
                isCompleted
                  ? 'bg-white border-emerald-300 shadow-sm'
                  : 'bg-white border-amber-200/70 shadow-xs'
              }`}
            >
              {/* Mission Card Header */}
              <div
                className={`p-3.5 flex items-center justify-between border-b ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-100'
                    : 'bg-amber-50/50 border-amber-100/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl drop-shadow-xs">{mission.icon}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-500">
                        {mission.isBonus ? '🏆 ภารกิจพิเศษ' : `⭐ #${mission.id}`}
                      </span>
                      {mission.isBonus && (
                        <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                          +1 Bonus Star
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{mission.title}</h3>
                  </div>
                </div>

                {isCompleted && (
                  <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                    <Check className="w-3.5 h-3.5" />
                    <span>สำเร็จ</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                {/* 🔎 Hint Box */}
                <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-950">
                  <span className="text-base shrink-0 mt-[-2px]">🔎</span>
                  <div className="leading-relaxed">
                    <span className="font-bold text-amber-900">คำใบ้: </span>
                    <span>{mission.hint}</span>
                  </div>
                </div>

                {/* Uploaded Photo Preview (if present) */}
                {photoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                    <img
                      src={photoUrl}
                      alt={mission.title}
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => onOpenPhotoPreview(photoUrl, mission.title)}
                    />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
                      <button
                        onClick={() => onOpenPhotoPreview(photoUrl, mission.title)}
                        className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" /> ดูรูปใหญ่
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => fileInputRefs.current[mission.id]?.click()}
                          className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Camera className="w-3 h-3" /> ถ่ายใหม่
                        </button>
                        <button
                          onClick={() => handleRemovePhoto(mission.id)}
                          className="bg-rose-500/90 hover:bg-rose-600 text-white text-xs p-1.5 rounded-lg flex items-center justify-center cursor-pointer"
                          title="ลบรูป"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Photo capture action button */
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRefs.current[mission.id]?.click()}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>ถ่ายรูป / อัปโหลด</span>
                    </button>
                  </div>
                )}

                {/* Hidden File Input with camera capture option */}
                <input
                  ref={(el) => {
                    fileInputRefs.current[mission.id] = el;
                  }}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFileChange(mission.id, e)}
                />

                {/* ⭐ Star Rating Selector */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">
                      ระดับดาวที่ได้รับ:
                    </span>
                    <span className="text-xs font-bold text-amber-600">
                      {state.stars === 3
                        ? '⭐⭐⭐ 3 ดาว (ลูกถ่ายเอง!)'
                        : state.stars === 2
                        ? '⭐⭐ 2 ดาว (ถ่ายรูปสำเร็จ)'
                        : state.stars === 1
                        ? '⭐ 1 ดาว (หาเจอภารกิจ)'
                        : 'ยังไม่ได้เลือกดาว'}
                    </span>
                  </div>

                  {mission.isBonus ? (
                    /* Bonus Star toggle */
                    <button
                      onClick={() => handleStarSelect(mission.id, state.stars === 1 ? 0 : 1)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        state.stars === 1
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${state.stars === 1 ? 'fill-yellow-200 text-yellow-200' : ''}`} />
                      <span>{state.stars === 1 ? '🏆 ได้รับ Bonus (+1 ดาว) แล้ว' : 'กดรับ Bonus (+1 ดาว)'}</span>
                    </button>
                  ) : (
                    /* 1 / 2 / 3 Star Buttons */
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((starNum) => {
                        const isSelected = state.stars === starNum;
                        return (
                          <button
                            key={starNum}
                            onClick={() => handleStarSelect(mission.id, isSelected ? 0 : starNum)}
                            className={`py-2 px-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border flex flex-col items-center gap-0.5 ${
                              isSelected
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-bold'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-200'
                            }`}
                          >
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: starNum }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    isSelected
                                      ? 'fill-yellow-200 text-yellow-200'
                                      : 'fill-amber-400 text-amber-400'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px]">
                              {starNum === 1 ? 'หาเจอ' : starNum === 2 ? 'ถ่ายรูปได้' : 'ลูกถ่ายเอง!'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredMissions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">ไม่พบภารกิจในหมวดนี้</p>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนตัวกรองเป็น "ทั้งหมด"</p>
          </div>
        )}
      </div>
    </div>
  );
};
