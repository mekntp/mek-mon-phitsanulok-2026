import React, { useState, useEffect } from 'react';
import { PLACES_DATA } from './data/places';
import { PHOTO_MISSIONS } from './data/missions';
import type { MissionState } from './types';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { PlacesTab } from './components/PlacesTab';
import { PhotoHuntTab } from './components/PhotoHuntTab';
import { VictoryModal } from './components/VictoryModal';
import { PhotoModal } from './components/PhotoModal';
import { SettingsModal } from './components/SettingsModal';
import {
  savePhotosToIndexedDB,
  getAllPhotosFromIndexedDB,
  clearAllPhotosFromIndexedDB,
} from './lib/db';
import {
  uploadPhotoToSupabase,
  syncMissionToSupabase,
  syncTripJournalToSupabase,
  getSupabaseClient,
} from './lib/supabase';

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

export function App() {
  const [activeTab, setActiveTab] = useState<'places' | 'hunt'>('places');

  const [visitedPlaces, setVisitedPlaces] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('phitsanulok_visited_places');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [missionStates, setMissionStates] = useState<Record<number, MissionState>>(() => {
    try {
      const saved = localStorage.getItem('phitsanulok_mission_states');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [dailyNote, setDailyNote] = useState(
    () => localStorage.getItem('phitsanulok_daily_note') || ''
  );

  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingJournal, setIsSavingJournal] = useState(false);

  useEffect(() => {
    async function loadStoredPhotos() {
      const photos = await getAllPhotosFromIndexedDB();
      if (Object.keys(photos).length === 0) return;

      setMissionStates((prev) => {
        const next = { ...prev };
        let changed = false;

        for (const [mId, dataUrls] of Object.entries(photos)) {
          const id = Number(mId);
          const current = next[id] || {
            missionId: id,
            completed: true,
            stars: 2,
          };

          if (getPhotos(current).length === 0) {
            next[id] = {
              ...current,
              photos: dataUrls,
              photoDataUrl: undefined,
              completed: true,
              stars: current.stars || 2,
            };
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    }

    loadStoredPhotos();
  }, []);

  useEffect(() => {
    localStorage.setItem('phitsanulok_visited_places', JSON.stringify(visitedPlaces));
  }, [visitedPlaces]);

  useEffect(() => {
    const metaOnly: Record<number, Omit<MissionState, 'photos' | 'photoDataUrl'>> = {};

    for (const [id, state] of Object.entries(missionStates)) {
      const { photos, photoDataUrl, ...rest } = state;
      metaOnly[Number(id)] = rest;
    }

    localStorage.setItem('phitsanulok_mission_states', JSON.stringify(metaOnly));
  }, [missionStates]);

  useEffect(() => {
    localStorage.setItem('phitsanulok_daily_note', dailyNote);
  }, [dailyNote]);

  const totalStars = Object.values(missionStates).reduce(
    (sum, state) => sum + (state.stars || 0),
    0
  );

  const completedCount = Object.values(missionStates).filter(
    (state) => (state.stars || 0) > 0 || state.completed
  ).length;

  const handleToggleVisited = (placeId: number) => {
    setVisitedPlaces((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId]
    );
  };

  const syncMissionState = async (missionId: number, state: MissionState) => {
    const client = getSupabaseClient();
    if (!client) return;

    const photos = getPhotos(state);
    let photoUrls = getPhotoUrls(state);

    if (photoUrls.length < photos.length) {
      photoUrls = [...photoUrls, ...Array(photos.length - photoUrls.length).fill('')];
    }

    for (let i = 0; i < photos.length; i += 1) {
      if (!photoUrls[i]) {
        const uploaded = await uploadPhotoToSupabase(missionId, photos[i], i);
        if (uploaded) photoUrls[i] = uploaded;
      }
    }

    const cleanUrls = photoUrls.filter(Boolean);

    setMissionStates((prev) => ({
      ...prev,
      [missionId]: {
        ...prev[missionId],
        photoUrls: photoUrls,
        photoUrl: cleanUrls[0],
      },
    }));

    await syncMissionToSupabase(
      missionId,
      state.stars || 0,
      cleanUrls,
      state.completed,
      state.notes || ''
    );
  };

  const handleUpdateMission = async (
    missionId: number,
    update: Partial<MissionState>
  ) => {
    const current = missionStates[missionId] || {
      missionId,
      completed: false,
      stars: 0,
    };

    const nextState: MissionState = {
      ...current,
      ...update,
    };

    if (update.photos !== undefined) {
      await savePhotosToIndexedDB(missionId, update.photos);
    }

    setMissionStates((prev) => ({
      ...prev,
      [missionId]: nextState,
    }));

    if (getSupabaseClient()) {
      void syncMissionState(missionId, nextState);
    }
  };

  const handleSaveDailyNote = async () => {
    localStorage.setItem('phitsanulok_daily_note', dailyNote);

    if (!getSupabaseClient()) {
      alert('บันทึกในเครื่องแล้ว');
      return;
    }

    setIsSavingJournal(true);
    const ok = await syncTripJournalToSupabase(dailyNote);
    setIsSavingJournal(false);
    alert(ok ? 'บันทึกความทรงจำแล้ว' : 'บันทึกในเครื่องแล้ว แต่ Cloud ยังไม่พร้อม');
  };

  const handleSyncToSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('ใส่ Supabase Anon Key ก่อน');
      return;
    }

    setIsSyncing(true);

    try {
      let successCount = 0;

      for (const [idStr, state] of Object.entries(missionStates)) {
        const missionId = Number(idStr);
        await syncMissionState(missionId, state);
        successCount += 1;
      }

      await syncTripJournalToSupabase(dailyNote);

      alert(`ซิงค์แล้ว ${successCount} ภารกิจ`);
    } catch (err) {
      alert('ซิงค์ไม่สำเร็จ: ' + (err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportBackup = () => {
    const data = {
      visitedPlaces,
      missionStates,
      dailyNote,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phitsanulok_trip_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);

        if (parsed.visitedPlaces) {
          setVisitedPlaces(parsed.visitedPlaces);
        }

        if (parsed.dailyNote !== undefined) {
          setDailyNote(parsed.dailyNote);
        }

        if (parsed.missionStates) {
          const imported = parsed.missionStates as Record<string, MissionState>;
          setMissionStates(imported);

          for (const [mId, state] of Object.entries(imported)) {
            const photos = getPhotos(state);
            if (photos.length > 0) {
              await savePhotosToIndexedDB(Number(mId), photos);
            }
          }
        }

        alert('นำเข้าข้อมูลแล้ว');
      } catch {
        alert('ไฟล์ไม่ถูกต้อง');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetAllData = async () => {
    if (!window.confirm('ลบข้อมูลทริปทั้งหมดไหม?')) return;

    await clearAllPhotosFromIndexedDB();
    localStorage.removeItem('phitsanulok_visited_places');
    localStorage.removeItem('phitsanulok_mission_states');
    localStorage.removeItem('phitsanulok_daily_note');

    setVisitedPlaces([]);
    setMissionStates({});
    setDailyNote('');
    setIsSettingsOpen(false);

    alert('ลบข้อมูลแล้ว');
  };

  return (
    <div className="min-h-screen bg-amber-50/40 pb-16">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalStars={totalStars}
        completedCount={completedCount}
        onOpenVictory={() => setIsVictoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="max-w-md mx-auto px-4 pt-3">
        <ProgressBar
          totalStars={totalStars}
          completedCount={completedCount}
          totalMissions={PHOTO_MISSIONS.length}
          onOpenVictory={() => setIsVictoryOpen(true)}
        />

        {activeTab === 'places' && (
          <PlacesTab
            places={PLACES_DATA}
            visitedPlaces={visitedPlaces}
            onToggleVisited={handleToggleVisited}
            onJumpToPhotoHunt={() => setActiveTab('hunt')}
          />
        )}

        {activeTab === 'hunt' && (
          <PhotoHuntTab
            missions={PHOTO_MISSIONS}
            missionStates={missionStates}
            onUpdateMission={handleUpdateMission}
            onOpenPhotoPreview={(url, title) => setPreviewPhoto({ url, title })}
            dailyNote={dailyNote}
            onDailyNoteChange={setDailyNote}
            onSaveDailyNote={handleSaveDailyNote}
            isSavingJournal={isSavingJournal}
          />
        )}
      </main>

      <PhotoModal
        isOpen={!!previewPhoto}
        photoUrl={previewPhoto?.url || null}
        title={previewPhoto?.title || ''}
        onClose={() => setPreviewPhoto(null)}
      />

      <VictoryModal
        isOpen={isVictoryOpen}
        onClose={() => setIsVictoryOpen(false)}
        totalStars={totalStars}
        missionStates={missionStates}
        missions={PHOTO_MISSIONS}
        dailyNote={dailyNote}
        onOpenPhotoPreview={(url, title) => setPreviewPhoto({ url, title })}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetAllData={handleResetAllData}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onSyncToSupabase={handleSyncToSupabase}
        isSyncing={isSyncing}
      />
    </div>
  );
}

export default App;