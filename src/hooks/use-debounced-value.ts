// src/hooks/use-debounced-value.ts

import { useEffect, useState } from 'react';

/**
 * Delays updating a rapidly changing value (such as search input)
 * to keep filtering 125+ catalog items smooth and zero-lag on mobile.
 */
export function useDebouncedValue<T>(value: T, delayMs = 220): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            setDebouncedValue(value);
        }, delayMs);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [value, delayMs]);

    return debouncedValue;
}