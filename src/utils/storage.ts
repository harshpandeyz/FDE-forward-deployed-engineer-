const KEY = 'fde-lab-progress-v1';
const THEME_KEY = 'fde-theme';

export const storageService = {
  load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  save(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full / private mode — ignore */
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch { /* noop */ }
  },
  get progressKey() {
    return KEY;
  },
  get themeKey() {
    return THEME_KEY;
  },
};
