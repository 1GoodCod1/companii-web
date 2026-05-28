/**
 * Thin Promise-based wrapper around IndexedDB used by the estimate offline
 * cache (M-01). Intentionally minimal — no external `idb` dependency.
 *
 * Stores used by the wizard:
 *  - `estimate_drafts`        keyPath `id` (projectId)
 *  - `estimate_mutation_queue` keyPath `id` (mutationId, monotonic)
 *  - `estimate_meta`          key-value (projectId → { lastSyncedAt, lastSavedAt })
 */

export const ESTIMATE_DB_NAME = 'companii-estimates';
export const ESTIMATE_DB_VERSION = 1;
export const STORE_DRAFTS = 'estimate_drafts';
export const STORE_QUEUE = 'estimate_mutation_queue';
export const STORE_META = 'estimate_meta';

export type EstimateStore = typeof STORE_DRAFTS | typeof STORE_QUEUE | typeof STORE_META;

let dbPromise: Promise<IDBDatabase> | null = null;

function isIdbAvailable(): boolean {
  return typeof globalThis !== 'undefined' && typeof globalThis.indexedDB !== 'undefined';
}

export function openEstimateDb(): Promise<IDBDatabase> {
  if (!isIdbAvailable()) {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = globalThis.indexedDB.open(ESTIMATE_DB_NAME, ESTIMATE_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const store = db.createObjectStore(STORE_QUEUE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    req.onblocked = () => reject(new Error('IndexedDB open blocked'));
  });

  return dbPromise;
}

function txReq<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
  });
}

export async function idbGet<T>(store: EstimateStore, key: IDBValidKey): Promise<T | undefined> {
  const db = await openEstimateDb();
  return new Promise<T | undefined>((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error ?? new Error(`IDB get(${store}, ${String(key)}) failed`));
  });
}

export async function idbPut<T>(store: EstimateStore, value: T, key?: IDBValidKey): Promise<void> {
  const db = await openEstimateDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = key === undefined ? tx.objectStore(store).put(value) : tx.objectStore(store).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error(`IDB put(${store}) failed`));
  });
}

export async function idbDelete(store: EstimateStore, key: IDBValidKey): Promise<void> {
  const db = await openEstimateDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error(`IDB delete(${store}) failed`));
  });
}

export async function idbGetAll<T>(
  store: EstimateStore,
  indexName?: string,
  query?: IDBValidKey | IDBKeyRange,
): Promise<T[]> {
  const db = await openEstimateDb();
  return new Promise<T[]>((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const target = indexName ? tx.objectStore(store).index(indexName) : tx.objectStore(store);
    const req = target.getAll(query);
    req.onsuccess = () => resolve((req.result as T[]) ?? []);
    req.onerror = () => reject(req.error ?? new Error(`IDB getAll(${store}) failed`));
  });
}

export async function idbClear(store: EstimateStore): Promise<void> {
  const db = await openEstimateDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error(`IDB clear(${store}) failed`));
  });
}

/** Test helper: reset the cached database promise (used in vitest). */
export function _resetEstimateDb(): void {
  dbPromise = null;
}

// Silence unused-export warning when txReq is not consumed directly.
void txReq;
