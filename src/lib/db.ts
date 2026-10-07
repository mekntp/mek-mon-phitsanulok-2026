// Offline photo storage. v2 supports many photos per mission.
const DB_NAME = 'phitsanulok_trip_db';
const DB_VERSION = 2;
const PHOTO_STORE = 'mission_photos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: 'missionId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePhotosToIndexedDB(
  missionId: number,
  dataUrls: string[]
): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      const store = tx.objectStore(PHOTO_STORE);
      store.put({
        missionId,
        dataUrls,
        savedAt: new Date().toISOString(),
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn('Failed to save photos to IndexedDB', err);
  }
}

// Kept for old backups/compatibility.
export async function savePhotoToIndexedDB(
  missionId: number,
  dataUrl: string
): Promise<void> {
  await savePhotosToIndexedDB(missionId, [dataUrl]);
}

export async function getAllPhotosFromIndexedDB(): Promise<Record<number, string[]>> {
  try {
    const db = await openDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(PHOTO_STORE, 'readonly');
      const store = tx.objectStore(PHOTO_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const results: Record<number, string[]> = {};
        for (const item of req.result || []) {
          // v1 records used dataUrl; v2 uses dataUrls.
          const urls = Array.isArray(item.dataUrls)
            ? item.dataUrls
            : item.dataUrl
              ? [item.dataUrl]
              : [];
          if (urls.length > 0) results[item.missionId] = urls;
        }
        resolve(results);
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

export async function getPhotoFromIndexedDB(
  missionId: number
): Promise<string | null> {
  const all = await getAllPhotosFromIndexedDB();
  return all[missionId]?.[0] || null;
}

export async function deletePhotoFromIndexedDB(missionId: number): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).delete(missionId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch (err) {
    console.warn('Failed to delete photos from IndexedDB', err);
  }
}

export async function clearAllPhotosFromIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    // Ignore error
  }
}
