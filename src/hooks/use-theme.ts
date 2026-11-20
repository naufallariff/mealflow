// src/hooks/use-theme.ts

import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'mealflow.theme.v1';

function getInitialTheme(): ThemeMode {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
    const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // Ignore private mode storage failures
        }
    }, [theme]);

    const toggleTheme = useCallback(
        (origin?: { readonly x: number; readonly y: number }) => {
            const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';

            const prefersReducedMotion =
                typeof window !== 'undefined' &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            const docWithTransition = document as Document & {
                startViewTransition?: (cb: () => void) => {
                    ready: Promise<void>;
                };
            };

            if (!docWithTransition.startViewTransition || prefersReducedMotion) {
                setTheme(nextTheme);
                return;
            }

            // Default origin: top-right theme button area
            const x = origin?.x ?? window.innerWidth - 36;
            const y = origin?.y ?? 32;

            // Maximum distance to farthest corner (bottom-left)
            const endRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y),
            );

            const transition = docWithTransition.startViewTransition(() => {
                document.documentElement.setAttribute('data-theme', nextTheme);
                setTheme(nextTheme);
            });

            transition.ready
                .then(() => {
                    document.documentElement.animate(
                        {
                            clipPath: [
                                `circle(0px at ${x}px ${y}px)`,
                                `circle(${endRadius}px at ${x}px ${y}px)`,
                            ],
                        },
                        {
                            duration: 520,
                            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                            pseudoElement: '::view-transition-new(root)',
                        },
                    );
                })
                .catch(() => {
                    // Fallback if animation is interrupted
                });
        },
        [theme],
    );

    return { theme, toggleTheme };
}