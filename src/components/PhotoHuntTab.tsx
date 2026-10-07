import React, { useRef, useState } from 'react';
import type { PhotoMission, MissionState } from '../types';
import {
  Camera,
  Check,
  Star,
  Sparkles,
  Trash2,
  Maximize2,
  AlertCircle,
  ImagePlus,
  Save,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PhotoHuntTabProps {
  missions: PhotoMission[];
  missionStates: Record<number, MissionState>;
  onUpdateMission: (missionId: number, update: Partial<MissionState>) => void;
  onOpenPhotoPreview: (dataUrl: string, title: string) => void;
  dailyNote: string;
  onDailyNoteChange: (note: string) => void;
  onSaveDailyNote: () => Promise<void>;
  isSavingJournal: boolean;
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const getPhotos = (state: MissionState): string[] => {
  if (Array.isArray(state.photos)) return state.photos;
  if (state.photoDataUrl) return [state.photoDataUrl];
  return [];
};

const getPhotoUrls = (state: MissionState): string[] => {
  if (Array.isArray(state.photoUrls)) return state.photoUrls;
  if (state.photoUrl) return [state.photoUrl];
  return [];
};

export const PhotoHuntTab: React.FC<PhotoHuntTabProps> = ({
  missions,
  missionStates,
  onUpdateMission,
  onOpenPhotoPreview,
  dailyNote,
  onDailyNoteChange,
  onSaveDailyNote,
  isSavingJournal,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const cameraInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const galleryInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const addFiles = async (missionId: number, files: FileList | null) => {
    if (!files?.length) return;

    const current = missionStates[missionId] || {
      missionId,
      completed: false,
      stars: 0,
    };

    const oldPhotos = getPhotos(current);
    const oldUrls = getPhotoUrls(current);
    const newPhotos = await Promise.all(Array.from(files).map(readFileAsDataUrl));
    const nextPhotos = [...oldPhotos, ...newPhotos];
    const nextPhotoUrls = [
      ...oldUrls,
      ...Array.from({ length: newPhotos.length }, () => ''),
    ];

    const newStars = current.stars >= 2 ? current.stars : 2;

    onUpdateMission(missionId, {
      photos: nextPhotos,
      photoUrls: nextPhotoUrls,
      photoDataUrl: undefined,
      photoUrl: undefined,
      stars: newStars,
      completed: true,
      timestamp: new Date().toISOString(),
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  const handleCameraChange = async (
    missionId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    await addFiles(missionId, e.target.files);
    e.target.value = '';
  };

  const handleGalleryChange = async (
    missionId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    await addFiles(missionId, e.target.files);
    e.target.value = '';
  };

  const handleStarSelect = (missionId: number, stars: number) => {
    const current = missionStates[missionId] || {
      missionId,
      completed: false,
      stars: 0,
    };

    onUpdateMission(missionId, {
      stars,
      completed: stars > 0,
      timestamp: new Date().toISOString(),
    });

    if (stars === 3 || (current.stars === 0 && stars > 0)) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    }
  };

  const handleRemovePhoto = (missionId: number, index: number) => {
    const current = missionStates[missionId];
    if (!current) return;

    const photos = getPhotos(current);
    const photoUrls = getPhotoUrls(current);

    const nextPhotos = photos.filter((_, i) => i !== index);
    const nextPhotoUrls = photoUrls.filter((_, i) => i !== index);

    onUpdateMission(missionId, {
      photos: nextPhotos,
      photoUrls: nextPhotoUrls,
      photoDataUrl: undefined,
      photoUrl: nextPhotoUrls[0],
      stars: nextPhotos.length === 0 && current.stars > 1 ? 1 : current.stars,
      completed: current.stars > 0 || nextPhotos.length > 0,
      timestamp: new Date().toISOString(),
    });
  };

  const handleNoteChange = (missionId: number, notes: string) => {
    onUpdateMission(missionId, {
      notes,
      timestamp: new Date().toISOString(),
    });
  };

  const filteredMissions = missions.filter((m) => {
    const state = missionStates[m.id];
    const isCompleted = !!state?.completed || (state?.stars || 0) > 0;
    if (filter === 'completed') return isCompleted;
    if (filter === 'pending') return !isCompleted;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>⭐ กติกา</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
            <div className="font-bold">⭐ 1</div>
            <div className="text-[11px]">หาเจอ</div>
          </div>
          <div className="bg-white/80 p-2 rounded-xl border border-amber-200">
            <div className="font-bold">⭐⭐ 2</div>
            <div className="text-[11px]">ถ่ายรูป</div>
          </div>
          <div className="bg-amber-100 p-2 rounded-xl border border-amber-300">
            <div className="font-bold">⭐⭐⭐ 3</div>
            <div className="text-[11px]">ลูกถ่ายเอง</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-3.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <div className="font-bold text-sm text-slate-800">💛 วันนี้เป็นยังไง?</div>
            <div className="text-[11px] text-slate-500">เขียนสั้น ๆ ไว้ดูทีหลัง</div>
          </div>
          <button
            onClick={onSaveDailyNote}
            disabled={isSavingJournal}
            className="px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            {isSavingJournal ? 'กำลังบันทึก' : 'บันทึก'}
          </button>
        </div>

        <textarea
          value={dailyNote}
          onChange={(e) => onDailyNoteChange(e.target.value)}
          placeholder="วันนี้ชอบอะไรที่สุด?"
          rows={3}
          className="w-full resize-none bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="flex items-center justify-between gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-2 rounded-xl ${
            filter === 'all' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600'
          }`}
        >
          ทั้งหมด ({missions.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-1.5 px-2 rounded-xl ${
            filter === 'pending' ? 'bg-amber-500 text-white font-bold' : 'text-slate-600'
          }`}
        >
          ยังไม่ทำ ({missions.filter((m) => !(missionStates[m.id]?.stars > 0)).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1.5 px-2 rounded-xl ${
            filter === 'completed' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
          }`}
        >
          ทำแล้ว ({missions.filter((m) => missionStates[m.id]?.stars > 0).length})
        </button>
      </div>

      <div className="space-y-3.5">
        {filteredMissions.map((mission) => {
          const state = missionStates[mission.id] || {
            missionId: mission.id,
            completed: false,
            stars: 0,
          };

          const photos = getPhotos(state);
          const photoUrls = getPhotoUrls(state);
          const isCompleted = state.stars > 0 || state.completed;

          return (
            <div
              key={mission.id}
              className={`rounded-2xl border overflow-hidden ${
                isCompleted
                  ? 'bg-white border-emerald-300'
                  : 'bg-white border-amber-200'
              }`}
            >
              <div
                className={`p-3.5 flex items-center justify-between border-b ${
                  isCompleted
                    ? 'bg-emerald-50/60 border-emerald-100'
                    : 'bg-amber-50/50 border-amber-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl">{mission.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-500">
                      {mission.isBonus ? '🏆 Bonus' : `#${mission.id}`}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{mission.title}</h3>
                  </div>
                </div>

                {isCompleted && (
                  <div className="shrink-0 inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" />
                    <span>ทำแล้ว</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-start gap-2 text-xs text-amber-950">
                  <span>🔎</span>
                  <div>
                    <span className="font-bold">หา: </span>
                    <span>{mission.hint}</span>
                  </div>
                </div>

                {photos.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-2 gap-2">
                      {photos.map((photo, index) => {
                        const displayUrl = photo || photoUrls[index];
                        if (!displayUrl) return null;

                        return (
                          <div
                            key={`${mission.id}-${index}`}
                            className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-200"
                          >
                            <img
                              src={displayUrl}
                              alt={`${mission.title} ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => onOpenPhotoPreview(displayUrl, mission.title)}
                            />

                            <div className="absolute left-1.5 right-1.5 bottom-1.5 flex justify-between gap-1">
                              <button
                                onClick={() => onOpenPhotoPreview(displayUrl, mission.title)}
                                className="bg-black/60 text-white p-1.5 rounded-lg"
                                aria-label="ดูรูป"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleRemovePhoto(mission.id, index)}
                                className="bg-rose-500 text-white p-1.5 rounded-lg"
                                aria-label="ลบรูป"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-2">
                      {photos.length} รูป • แตะรูปเพื่อดูใหญ่
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                    ยังไม่มีรูป
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => cameraInputRefs.current[mission.id]?.click()}
                    className="py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    ถ่ายรูป
                  </button>

                  <button
                    onClick={() => galleryInputRefs.current[mission.id]?.click()}
                    className="py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <ImagePlus className="w-4 h-4" />
                    เลือกรูป
                  </button>
                </div>

                <input
                  ref={(el) => {
                    cameraInputRefs.current[mission.id] = el;
                  }}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => void handleCameraChange(mission.id, e)}
                />

                <input
                  ref={(el) => {
                    galleryInputRefs.current[mission.id] = el;
                  }}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void handleGalleryChange(mission.id, e)}
                />

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">⭐ ดาว</span>
                    <span className="text-xs font-bold text-amber-600">
                      {state.stars === 3
                        ? '⭐⭐⭐ ลูกถ่ายเอง'
                        : state.stars === 2
                          ? '⭐⭐ ถ่ายรูป'
                          : state.stars === 1
                            ? '⭐ หาเจอ'
                            : 'ยังไม่เลือก'}
                    </span>
                  </div>

                  {mission.isBonus ? (
                    <button
                      onClick={() => handleStarSelect(mission.id, state.stars === 1 ? 0 : 1)}
                      className={`w-full py-2 rounded-xl text-xs font-bold border ${
                        state.stars === 1
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {state.stars === 1 ? '🏆 ได้ Bonus แล้ว' : '🏆 รับ Bonus +1'}
                    </button>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((starNum) => {
                        const isSelected = state.stars === starNum;

                        return (
                          <button
                            key={starNum}
                            onClick={() =>
                              handleStarSelect(mission.id, isSelected ? 0 : starNum)
                            }
                            className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-0.5 ${
                              isSelected
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <div className="flex">
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
                              {starNum === 1 ? 'หาเจอ' : starNum === 2 ? 'ถ่ายรูป' : 'ลูกถ่ายเอง'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    📝 โน้ต
                  </label>
                  <textarea
                    value={state.notes || ''}
                    onChange={(e) => handleNoteChange(mission.id, e.target.value)}
                    placeholder="ชอบอะไร? สนุกไหม?"
                    rows={2}
                    className="w-full resize-none bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {filteredMissions.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">ไม่เจอ</p>
          </div>
        )}
      </div>
    </div>
  );
};
