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
  savePhotoToIndexedDB,
  getAllPhotosFromIndexedDB,
  deletePhotoFromIndexedDB,
  clearAllPhotosFromIndexedDB,
} from './lib/db';
import {
  uploadPhotoToSupabase,
  syncMissionToSupabase,
  getSupabaseClient,
} from './lib/supabase';

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

  // Modal states
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load offline photos from IndexedDB on initial mount
  useEffect(() => {
    async function loadStoredPhotos() {
      const photos = await getAllPhotosFromIndexedDB();
      if (Object.keys(photos).length > 0) {
        setMissionStates((prev) => {
          const next = { ...prev };
          let changed = false;
          for (const [mId, dataUrl] of Object.entries(photos)) {
            const id = Number(mId);
            if (!next[id]?.photoDataUrl) {
              next[id] = {
                ...(next[id] || { missionId: id, completed: true, stars: 2 }),
                photoDataUrl: dataUrl,
              };
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }
    }
    loadStoredPhotos();
  }, []);

  // Sync visited places to localStorage
  useEffect(() => {
    localStorage.setItem('phitsanulok_visited_places', JSON.stringify(visitedPlaces));
  }, [visitedPlaces]);

  // Sync mission states (metadata only) to localStorage
  useEffect(() => {
    const metaOnly: Record<number, Omit<MissionState, 'photoDataUrl'>> = {};
    for (const [id, state] of Object.entries(missionStates)) {
      const { photoDataUrl, ...rest } = state;
      metaOnly[Number(id)] = rest;
    }
    localStorage.setItem('phitsanulok_mission_states', JSON.stringify(metaOnly));
  }, [missionStates]);

  // Calculate total stars and completed count
  const totalStars = Object.values(missionStates).reduce(
    (sum, state) => sum + (state.stars || 0),
    0
  );

  const completedCount = Object.values(missionStates).filter(
    (state) => (state.stars || 0) > 0 || state.completed
  ).length;

  // Toggle visited places on itinerary
  const handleToggleVisited = (placeId: number) => {
    setVisitedPlaces((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  // Update a mission's state
  const handleUpdateMission = async (
    missionId: number,
    update: Partial<MissionState>
  ) => {
    // If photo is updated, save to IndexedDB
    if (update.photoDataUrl) {
      await savePhotoToIndexedDB(missionId, update.photoDataUrl);
    } else if (update.photoDataUrl === undefined && update.photoUrl === undefined) {
      // Photo was removed
      await deletePhotoFromIndexedDB(missionId);
    }

    setMissionStates((prev) => {
      const current = prev[missionId] || {
        missionId,
        completed: false,
        stars: 0,
      };
      return {
        ...prev,
        [missionId]: {
          ...current,
          ...update,
        },
      };
    });

    // Background sync to Supabase if configured
    const client = getSupabaseClient();
    if (client) {
      (async () => {
        let publicUrl = update.photoUrl;
        if (update.photoDataUrl) {
          publicUrl = (await uploadPhotoToSupabase(missionId, update.photoDataUrl)) || undefined;
        }
        await syncMissionToSupabase(
          missionId,
          update.stars ?? 0,
          publicUrl,
          update.completed
        );
      })();
    }
  };

  // Sync all data to Supabase
  const handleSyncToSupabase = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('กรุณากรอก Supabase Anon Key ก่อนเริ่มซิงค์ครับ');
      return;
    }

    setIsSyncing(true);
    let successCount = 0;
    try {
      for (const [idStr, state] of Object.entries(missionStates)) {
        const missionId = Number(idStr);
        let cloudUrl = state.photoUrl;

        if (state.photoDataUrl && !cloudUrl) {
          cloudUrl = (await uploadPhotoToSupabase(missionId, state.photoDataUrl)) || undefined;
          if (cloudUrl) {
            setMissionStates((prev) => ({
              ...prev,
              [missionId]: { ...prev[missionId], photoUrl: cloudUrl },
            }));
          }
        }

        const ok = await syncMissionToSupabase(
          missionId,
          state.stars || 0,
          cloudUrl,
          state.completed
        );
        if (ok) successCount++;
      }

      alert(`ซิงค์ข้อมูลสำเร็จ ${successCount} รายการ ขึ้น Supabase Cloud เรียบร้อยครับ!`);
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการซิงค์: ' + (err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const data = {
      visitedPlaces,
      missionStates,
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

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.visitedPlaces) setVisitedPlaces(parsed.visitedPlaces);
        if (parsed.missionStates) {
          setMissionStates(parsed.missionStates);
          for (const [mId, s] of Object.entries(parsed.missionStates as Record<string, MissionState>)) {
            if (s.photoDataUrl) {
              await savePhotoToIndexedDB(Number(mId), s.photoDataUrl);
            }
          }
        }
        alert('นำเข้าข้อมูลสำเร็จแล้วครับ!');
      } catch {
        alert('ไฟล์สำรองไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset all progress
  const handleResetAllData = async () => {
    if (
      window.confirm(
        'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทริปทั้งหมด? รูปถ่ายและดาวที่สะสมจะถูกลบ'
      )
    ) {
      await clearAllPhotosFromIndexedDB();
      localStorage.removeItem('phitsanulok_visited_places');
      localStorage.removeItem('phitsanulok_mission_states');
      setVisitedPlaces([]);
      setMissionStates({});
      setIsSettingsOpen(false);
      alert('รีเซ็ตข้อมูลทริปเรียบร้อยแล้ว พร้อมเริ่มการผจญภัยใหม่!');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 pb-16">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalStars={totalStars}
        completedCount={completedCount}
        onOpenVictory={() => setIsVictoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-3">
        {/* Progress Score Bar */}
        <ProgressBar
          totalStars={totalStars}
          completedCount={completedCount}
          totalMissions={PHOTO_MISSIONS.length}
          onOpenVictory={() => setIsVictoryOpen(true)}
        />

        {/* Tab 1: Itinerary Route */}
        {activeTab === 'places' && (
          <PlacesTab
            places={PLACES_DATA}
            visitedPlaces={visitedPlaces}
            onToggleVisited={handleToggleVisited}
            onJumpToPhotoHunt={() => setActiveTab('hunt')}
          />
        )}

        {/* Tab 2: Photo Scavenger Hunt */}
        {activeTab === 'hunt' && (
          <PhotoHuntTab
            missions={PHOTO_MISSIONS}
            missionStates={missionStates}
            onUpdateMission={handleUpdateMission}
            onOpenPhotoPreview={(url, title) => setPreviewPhoto({ url, title })}
          />
        )}
      </main>

      {/* Fullscreen Photo Viewer */}
      <PhotoModal
        isOpen={!!previewPhoto}
        photoUrl={previewPhoto?.url || null}
        title={previewPhoto?.title || ''}
        onClose={() => setPreviewPhoto(null)}
      />

      {/* Victory & Certificate Modal */}
      <VictoryModal
        isOpen={isVictoryOpen}
        onClose={() => setIsVictoryOpen(false)}
        totalStars={totalStars}
        missionStates={missionStates}
        missions={PHOTO_MISSIONS}
        onOpenPhotoPreview={(url, title) => setPreviewPhoto({ url, title })}
      />

      {/* Settings & Supabase Cloud Modal */}
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
