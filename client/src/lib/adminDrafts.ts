export type DraftEnvelope<T> = { savedAt: number; editingId: number | null; value: T };

export const PROJECT_DRAFT_KEY = "emadalddine:admin:project-draft:v1";
export const POST_DRAFT_KEY = "emadalddine:admin:post-draft:v1";
export const ADMIN_ACTIVITY_KEY = "emadalddine:admin:last-activity:v1";

function getStorage(): Storage | null {
  try { return globalThis.localStorage; } catch { return null; }
}

export function readDraft<T>(key: string): DraftEnvelope<T> | null {
  try {
    const storage = getStorage();
    const raw = storage?.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftEnvelope<T>;
    return parsed?.value ? parsed : null;
  } catch {
    return null;
  }
}

export function writeDraft<T>(key: string, value: T, editingId: number | null) {
  try {
    getStorage()?.setItem(key, JSON.stringify({ savedAt: Date.now(), editingId, value } satisfies DraftEnvelope<T>));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(key: string) {
  try { getStorage()?.removeItem(key); } catch { /* storage may be unavailable */ }
}

export function readAdminActivity() {
  try { return Number(getStorage()?.getItem(ADMIN_ACTIVITY_KEY)) || Date.now(); } catch { return Date.now(); }
}

export function writeAdminActivity(timestamp: number) {
  try { getStorage()?.setItem(ADMIN_ACTIVITY_KEY, String(timestamp)); } catch { /* storage may be unavailable */ }
}

export function clearAdminActivity() {
  try { getStorage()?.removeItem(ADMIN_ACTIVITY_KEY); } catch { /* storage may be unavailable */ }
}

export function hasProjectDraft(value: any) {
  return Boolean(value?.title || value?.description || value?.imageUrl || value?.clientName || value?.sourceUrl || value?.slides?.some((slide: any) => slide.title || slide.description || slide.imageUrl));
}

export function hasPostDraft(value: any) {
  return Boolean(value?.title || value?.slug || value?.summary || value?.content || value?.imageUrl);
}
