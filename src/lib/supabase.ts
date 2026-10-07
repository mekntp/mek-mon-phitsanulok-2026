import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://xjqpfmcgxvvsnvyjxrac.supabase.co';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL
  ) as string | undefined;

  const envKey = (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) as string | undefined;

  const localUrl = localStorage.getItem('supabase_url');
  const localKey = localStorage.getItem('supabase_anon_key');

  return {
    url: localUrl || envUrl || DEFAULT_SUPABASE_URL,
    anonKey: localKey || envKey || '',
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  if (config.url) localStorage.setItem('supabase_url', config.url);
  if (config.anonKey) localStorage.setItem('supabase_anon_key', config.anonKey);
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }

  try {
    if (!cachedClient) {
      cachedClient = createClient(url, anonKey);
    }
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function resetSupabaseClient() {
  cachedClient = null;
}

/**
 * Upload a photo to Supabase Storage bucket 'trip-photos'
 */
export async function uploadPhotoToSupabase(
  missionId: number,
  dataUrl: string
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // Convert dataUrl to blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const ext = blob.type.includes('png') ? 'png' : 'jpg';
    const filePath = `missions/mission_${missionId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('trip-photos')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Supabase storage upload error:', uploadError);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from('trip-photos')
      .getPublicUrl(filePath);

    return publicData?.publicUrl || null;
  } catch (err) {
    console.warn('Failed to upload photo to Supabase:', err);
    return null;
  }
}

/**
 * Sync mission progress record to Supabase table 'photo_missions'
 */
export async function syncMissionToSupabase(
  missionId: number,
  stars: number,
  photoUrl?: string,
  completed?: boolean
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('photo_missions').upsert(
      {
        mission_id: missionId,
        stars,
        photo_url: photoUrl,
        completed: completed ?? stars > 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'mission_id' }
    );

    if (error) {
      console.warn('Supabase DB sync error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to sync mission to Supabase table:', err);
    return false;
  }
}
