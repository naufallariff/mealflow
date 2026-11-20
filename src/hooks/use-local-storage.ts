// src/hooks/use-local-storage.ts

import { useCallback, useState } from 'react';

/**
 * Persists state synchronously to localStorage with safe fallback
 * when storage quota is exceeded or unavailable.
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T | (() => T),
): readonly [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        const fallback =
            typeof initialValue === 'function'
                ? (initialValue as () => T)()
                : initialValue;

        try {
            const raw = window.localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : fallback;
        } catch {
            return fallback;
        }
    });

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue((prev) => {
                const nextValue =
                    typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
                try {
                    window.localStorage.setItem(key, JSON.stringify(nextValue));
                } catch {
                    // Ignore storage quota errors in private browsing mode
                }
                return nextValue;
            });
        },
        [key],
    );

    return [storedValue, setValue] as const;
}