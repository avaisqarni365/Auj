// On-device store for the pilgrim's personal voice recordings (reflections / pronunciation practice).
// Audio blobs live in IndexedDB on THIS device only — never uploaded or shared by default. Client-only.

export type Visibility = 'private' | 'family';

export interface RecordingMeta {
  id: string;
  stepKey: string;
  name: string;
  lang: string;
  visibility: Visibility;
  durationSec: number;
  createdAt: number;
  mime: string;
}

export interface RecordingRecord extends RecordingMeta {
  blob: Blob;
}

const DB_NAME = 'auj-ritual';
const STORE = 'recordings';
const VERSION = 1;

export function recordingsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof indexedDB !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  );
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: 'id' });
        os.createIndex('stepKey', 'stepKey', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addRecording(rec: RecordingRecord): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listByStep(stepKey: string): Promise<RecordingRecord[]> {
  const db = await openDb();
  const out = await new Promise<RecordingRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).index('stepKey').getAll(stepKey);
    req.onsuccess = () => resolve((req.result as RecordingRecord[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

export async function listAllRecordings(): Promise<RecordingRecord[]> {
  const db = await openDb();
  const out = await new Promise<RecordingRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as RecordingRecord[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function updateRecording(
  id: string,
  patch: Partial<Pick<RecordingMeta, 'name' | 'visibility'>>,
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const existing = getReq.result as RecordingRecord | undefined;
      if (existing) store.put({ ...existing, ...patch });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
