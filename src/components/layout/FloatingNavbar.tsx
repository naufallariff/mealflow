// src/components/layout/FloatingNavbar.tsx

import React from 'react';
import { Moon, RotateCcw, Sun } from 'lucide-react';
import { useScrollDirection } from '../../hooks/use-scroll-direction';
import type { ThemeMode } from '../../hooks/use-theme';
import { MealflowBrandMark } from '../brand/MealflowBrandMark';

interface FloatingNavbarProps {
    readonly theme: ThemeMode;
    readonly onToggleTheme: (origin?: { readonly x: number; readonly y: number }) => void;
    readonly onRequestResetAll: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
    theme,
    onToggleTheme,
    onRequestResetAll,
}) => {
    const scrollDirection = useScrollDirection(14, 72);
    const isHidden = scrollDirection === 'down';

    const handleThemeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onToggleTheme({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });
    };

    return (
        <header
            className={`mf-navbar transition-transform duration-250 ${isHidden ? 'translate-y-[-125%]' : 'translate-y-0'
                }`}
        >
            <div className="mf-navbar-inner">
                <MealflowBrandMark size="sm" />

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onRequestResetAll}
                        title="Kosongkan jadwal dan target anggaran"
                        aria-label="Reset jadwal dan target anggaran"
                        className="mf-liquid-pill h-8.5 px-3 text-xs text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    >
                        <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                        <span>Reset</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleThemeClick}
                        aria-label={
                            theme === 'light'
                                ? 'Aktifkan mode gelap'
                                : 'Aktifkan mode terang'
                        }
                        title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
                        className="mf-liquid-pill h-8.5 w-8.5 shrink-0 p-0 text-ink-secondary hover:text-ink-primary"
                    >
                        {theme === 'light' ? (
                            <Moon className="h-3.5 w-3.5" />
                        ) : (
                            <Sun className="h-3.5 w-3.5" />
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};