function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    const k = '__companii_storage_test__';
    window.localStorage.setItem(k, k);
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return window.sessionStorage;
  }
}

let cached: Storage | null = null;

function storage(): Storage | null {
  if (cached !== null) return cached;
  cached = getStorage();
  return cached;
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      const s = storage();
      return s ? s.getItem(key) : null;
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      const s = storage();
      if (s) s.setItem(key, value);
    } catch {
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, value);
        }
      } catch {
        /* ignore */
      }
    }
  },

  removeItem(key: string): void {
    try {
      const s = storage();
      if (s) s.removeItem(key);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
  },
};
