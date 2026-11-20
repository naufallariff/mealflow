// src/components/layout/FloatingNavbar.tsx

import React from 'react';
import { HelpCircle, RotateCcw, Sparkles, UtensilsCrossed } from 'lucide-react';
import { useScrollDirection } from '../../hooks/use-scroll-direction';
import { WEEKLY_PRESETS } from '../../data/default-catalog';

interface FloatingNavbarProps {
    readonly showGuide: boolean;
    readonly onToggleGuide: () => void;
    readonly onApplyPreset: (presetId: string) => void;
    readonly onResetAll: () => void;
}

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
            className={`sticky top-0 z-40 w-full border-b border-[#E5E5EA] bg-white/95 backdrop-blur-md transition-transform duration-200 ease-out ${isHidden ? '-translate-y-full' : 'translate-y-0'
                }`}
        >
            <div className="flex w-full items-center justify-between gap-3 px-3 py-2.5 sm:px-5 lg:px-7">
                {/* Brand Identity */}
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#007AFF] text-white shadow-xs">
                        <UtensilsCrossed className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-[15px] font-semibold tracking-tight text-[#1C1C1E] sm:text-base">
                                Mealflow
                            </h1>
                            <span className="rounded-md bg-[#F2F2F7] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#636366] uppercase">
                                31D PWA
                            </span>
                        </div>
                        <p className="hidden text-xs text-[#636366] sm:block">
                            Puzzle rencana makan & simulasi belanja realistis
                        </p>
                    </div>
                </div>

                {/* Actions & Presets */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {WEEKLY_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            onClick={() => onApplyPreset(preset.id)}
                            title={preset.subtitle}
                            className="hidden items-center gap-1.5 rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-3 py-2 text-xs font-medium text-[#1C1C1E] transition-transform duration-150 hover:bg-[#F2F2F7] active:scale-[0.97] md:inline-flex"
                        >
                            <Sparkles className="h-3.5 w-3.5 text-[#007AFF]" />
                            <span>{preset.name}</span>
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={onToggleGuide}
                        aria-pressed={showGuide}
                        className={`inline-flex min-h-9.5 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.97] ${showGuide
                                ? 'border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF]'
                                : 'border-[#E5E5EA] bg-white text-[#636366] hover:bg-[#F2F2F7]'
                            }`}
                    >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>Panduan</span>
                    </button>

                    <button
                        type="button"
                        onClick={onResetAll}
                        title="Kosongkan jadwal & target"
                        className="inline-flex min-h-9.5 items-center gap-1.5 rounded-xl border border-[#E5E5EA] bg-white px-2.5 py-1.5 text-xs font-medium text-[#FF3B30] transition-colors hover:bg-red-50 active:scale-[0.97]"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Reset 0</span>
                    </button>
                </div>
            </div>
        </header>
    );
};