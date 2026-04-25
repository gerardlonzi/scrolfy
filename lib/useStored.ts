import { useCallback, useEffect, useState } from 'react';
import { getJson, setJson } from './storage';

export function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const v = await getJson<T>(key, fallback);
      if (!mounted) return;
      setValue(v);
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [key]);

  const setAndPersist = useCallback(
    async (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        void setJson(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return { value, setValue: setAndPersist, ready };
}

