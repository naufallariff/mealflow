// src/components/layout/FloatingNavbar.tsx

import React from 'react';
import { HelpCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useScrollDirection } from '../../hooks/use-scroll-direction';
import { WEEKLY_PRESETS } from '../../data/default-catalog';
import { MealflowBrandMark } from '../brand/MealflowBrandMark';

interface FloatingNavbarProps {
    readonly showGuide: boolean;
    readonly onToggleGuide: () => void;
    readonly onApplyPreset: (presetId: string) => void;
    readonly onResetAll: () => void;
}

const PRESET_VARIANTS = ['berry', 'emerald', 'default'] as const;

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({
    showGuide,
    onToggleGuide,
    onApplyPreset,
    onResetAll,
}) => {
    const scrollDirection = useScrollDirection(14, 72);
    const isHidden = scrollDirection === 'down';

    return (
        <header
            className={`mf-navbar transition-transform duration-300 ease-liquid-settle ${isHidden ? '-translate-y-full' : 'translate-y-0'
                }`}
        >
            <div className="mf-fluid-container mf-navbar-inner">
                {/* Personal Brand Identity */}
                <MealflowBrandMark
                    size="md"
                    badgeText="31D PWA"
                    subtitle="Puzzle rencana makan & simulasi belanja realistis"
                />

                {/* Actions & Colorful OS Presets */}
                <div className="flex flex-wrap items-center gap-2">
                    {WEEKLY_PRESETS.map((preset, index) => {
                        const variant = PRESET_VARIANTS[index % PRESET_VARIANTS.length];
                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => onApplyPreset(preset.id)}
                                title={preset.subtitle}
                                data-variant={variant === 'default' ? undefined : variant}
                                className="mf-liquid-pill hidden md:inline-flex"
                            >
                                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                                <span>{preset.name}</span>
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={onToggleGuide}
                        aria-pressed={showGuide}
                        data-variant={showGuide ? 'primary' : undefined}
                        className="mf-liquid-pill"
                    >
                        <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>Panduan</span>
                    </button>

                    <button
                        type="button"
                        onClick={onResetAll}
                        title="Kosongkan jadwal & target"
                        className="mf-liquid-pill text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    >
                        <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden sm:inline">Reset 0</span>
                    </button>
                </div>
            </div>
        </header>
    );
};