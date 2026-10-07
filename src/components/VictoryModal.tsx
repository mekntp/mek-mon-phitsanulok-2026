import React, { useEffect } from 'react';
import { Star, X, Share2, Award, Camera } from 'lucide-react';
import type { PhotoMission, MissionState } from '../types';
import { getRank } from '../data/missions';
import confetti from 'canvas-confetti';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalStars: number;
  missionStates: Record<number, MissionState>;
  missions: PhotoMission[];
  dailyNote: string;
  onOpenPhotoPreview: (dataUrl: string, title: string) => void;
}

const getPhotos = (state?: MissionState): string[] => {
  if (!state) return [];
  if (Array.isArray(state.photos)) return state.photos;
  if (state.photoDataUrl) return [state.photoDataUrl];
  return [];
};

const getPhotoUrls = (state?: MissionState): string[] => {
  if (!state) return [];
  if (Array.isArray(state.photoUrls)) return state.photoUrls;
  if (state.photoUrl) return [state.photoUrl];
  return [];
};

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  totalStars,
  missionStates,
  missions,
  dailyNote,
  onOpenPhotoPreview,
}) => {
  const currentRank = getRank(totalStars);

  const photoItems = missions.flatMap((mission) => {
    const state = missionStates[mission.id];
    const photos = getPhotos(state);
    const urls = getPhotoUrls(state);

    return photos
      .map((photo, index) => ({
        mission,
        url: photo || urls[index],
        index,
      }))
      .filter((item) => !!item.url);
  });

  const completedMissions = missions.filter(
    (m) => (missionStates[m.id]?.stars || 0) > 0
  );

  useEffect(() => {
    if (!isOpen) return;

    const end = Date.now() + 1.2 * 1000;
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#fbbf24'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = async () => {
    const text = `🎉 เราได้ ${totalStars}/31 ดาว และเก็บรูป ${photoItems.length} รูป!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ทริปพ่อลูก พิษณุโลก 2026',
          text,
          url: window.location.href,
        });
      } catch {
        // Share cancelled
      }
    } else {
      alert(text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-amber-200">
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-6 text-white text-center rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 text-white p-1.5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-5xl mb-2">{currentRank.badge}</div>

          <h2 className="text-xl font-black">
            {totalStars >= 31 ? '🎉 ครบแล้ว!' : '🎉 จบทริปแล้ว!'}
          </h2>

          <p className="text-amber-100 text-xs mt-1">
            ทริปพ่อลูก • พิษณุโลก 2026
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 bg-white/15 rounded-2xl p-3">
            <div>
              <div className="text-[10px]">ดาว</div>
              <div className="text-base font-black flex justify-center gap-1">
                <Star className="w-4 h-4 fill-yellow-300" />
                {totalStars}/31
              </div>
            </div>
            <div>
              <div className="text-[10px]">ทำแล้ว</div>
              <div className="text-base font-black">
                {completedMissions.length}/{missions.length}
              </div>
            </div>
            <div>
              <div className="text-[10px]">รูป</div>
              <div className="text-base font-black flex justify-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                {photoItems.length}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 text-center">
            <div className="inline-flex items-center gap-1.5 bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-2">
              <Award className="w-3.5 h-3.5" />
              เก่งมาก!
            </div>
            <h3 className="text-lg font-black text-slate-800">
              {currentRank.badge} {currentRank.title}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {currentRank.description}
            </p>
          </div>

          {dailyNote.trim() && (
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5">
              <div className="text-xs font-bold text-sky-900 mb-1">💛 ความทรงจำวันนี้</div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{dailyNote}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2">
              📸 รูปที่เก็บไว้ ({photoItems.length})
            </h4>

            {photoItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photoItems.map((item) => (
                  <div
                    key={`${item.mission.id}-${item.index}`}
                    onClick={() =>
                      onOpenPhotoPreview(item.url, item.mission.title)
                    }
                    className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer"
                  >
                    <img
                      src={item.url}
                      alt={item.mission.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-white">
                      <div className="text-[9px] font-bold truncate">
                        {item.mission.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center text-xs text-slate-500">
                ยังไม่มีรูป
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              แชร์
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
