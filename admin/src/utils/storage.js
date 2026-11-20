import { useEffect, useState } from 'react';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: demo data simply won't persist */
  }
}

// useState that persists to localStorage under "dow_<key>"
export function usePersistentState(key, initial) {
  const storageKey = `dow_${key}`;
  const [value, setValue] = useState(() => load(storageKey, initial));
  useEffect(() => {
    save(storageKey, value);
  }, [storageKey, value]);
  return [value, setValue];
}
