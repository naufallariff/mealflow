// src/components/calendar/WeeklyCalendarGrid.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
    Check,
    ChevronDown,
    CopyPlus,
    LayoutTemplate,
    MousePointerClick,
    Repeat,
} from 'lucide-react';
import type { CatalogItem, MealPeriod, MonthlySchedule } from '../../types/meal';
import { WEEKLY_PRESETS } from '../../data/default-catalog';
import type { ConfirmDialogConfig } from '../ui/ConfirmDialog';
import { MealSlotCard } from './MealSlotCard';

interface WeeklyCalendarGridProps {
    readonly schedule: MonthlySchedule;
    readonly catalogMap: ReadonlyMap<string, CatalogItem>;
    readonly activeWeek: number;
    readonly pendingItem?: CatalogItem | null;
    readonly onRequestConfirm: (config: ConfirmDialogConfig) => void;
    readonly onCancelPendingItem?: () => void;
    readonly onChangeWeek: (week: number) => void;
    readonly onDropItem: (day: number, period: MealPeriod, itemId: string) => void;
    readonly onUpdatePortion: (
        day: number,
        period: MealPeriod,
        itemId: string,
        delta: number,
    ) => void;
    readonly onClearDay: (day: number) => void;
    readonly onCopyWeekToNext: () => void;
    readonly onDuplicateWeekToMonth: () => void;
    readonly onApplyPreset: (presetId: string) => void;
}

const WEEK_RANGES: readonly {
    readonly week: number;
    readonly code: string;
    readonly title: string;
    readonly daySpanText: string;
    readonly days: readonly number[];
}[] = [
        {
            week: 1,
            code: 'M1',
            title: 'Minggu 1',
            daySpanText: 'Hari ke-1 s.d. Hari ke-7',
            days: [1, 2, 3, 4, 5, 6, 7],
        },
        {
            week: 2,
            code: 'M2',
            title: 'Minggu 2',
            daySpanText: 'Hari ke-8 s.d. Hari ke-14',
            days: [8, 9, 10, 11, 12, 13, 14],
        },
        {
            week: 3,
            code: 'M3',
            title: 'Minggu 3',
            daySpanText: 'Hari ke-15 s.d. Hari ke-21',
            days: [15, 16, 17, 18, 19, 20, 21],
        },
        {
            week: 4,
            code: 'M4',
            title: 'Minggu 4',
            daySpanText: 'Hari ke-22 s.d. Hari ke-28',
            days: [22, 23, 24, 25, 26, 27, 28],
        },
        {
            week: 5,
            code: 'M5',
            title: 'Minggu 5',
            daySpanText: 'Hari ke-29 s.d. Hari ke-31',
            days: [29, 30, 31],
        },
    ];

export const WeeklyCalendarGrid: React.FC<WeeklyCalendarGridProps> = ({
    schedule,
    catalogMap,
    activeWeek,
    pendingItem = null,
    onRequestConfirm,
    onCancelPendingItem,
    onChangeWeek,
    onDropItem,
    onUpdatePortion,
    onClearDay,
    onCopyWeekToNext,
    onDuplicateWeekToMonth,
    onApplyPreset,
}) => {
    const [desktopCols, setDesktopCols] = useState<4 | 2>(4);
    const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
    const templateMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isTemplateMenuOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                templateMenuRef.current &&
                !templateMenuRef.current.contains(e.target as Node)
            ) {
                setIsTemplateMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isTemplateMenuOpen]);

    const currentRange =
        WEEK_RANGES.find((w) => w.week === activeWeek) ?? WEEK_RANGES[0];

    const handleConfirmClearDay = (day: number) => {
        onRequestConfirm({
            title: `Kosongkan Jadwal Hari ke-${day}?`,
            description: `Seluruh menu Pagi, Siang, dan Malam pada Hari ke-${day} akan dihapus.`,
            confirmLabel: 'Ya, Kosongkan',
            tone: 'danger',
            onConfirm: () => onClearDay(day),
        });
    };

    const handleConfirmApplyMonth = () => {
        onRequestConfirm({
            title: `Terapkan ${currentRange.title} ke 31 Hari?`,
            description:
                'Pola jadwal pada minggu yang sedang dibuka akan menggantikan seluruh jadwal di hari lainnya selama 1 bulan.',
            confirmLabel: 'Ya, Terapkan',
            tone: 'primary',
            onConfirm: onDuplicateWeekToMonth,
        });
    };

    return (
        <div className="flex flex-col">
            {/* Active Tap-to-Place Banner */}
            {pendingItem && (
                <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-brand bg-brand-glass p-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                            <MousePointerClick className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-extrabold text-ink-primary">
                                Memasang: {pendingItem.name}
                            </p>
                            <p className="text-[11px] font-medium text-ink-secondary">
                                Klik slot Pagi, Siang, atau Malam untuk memasang langsung
                            </p>
                        </div>
                    </div>

                    {onCancelPendingItem && (
                        <button
                            type="button"
                            onClick={onCancelPendingItem}
                            data-variant="primary"
                            className="mf-liquid-pill h-8 shrink-0 px-3 text-xs"
                        >
                            <Check className="h-3.5 w-3.5" />
                            <span>Selesai</span>
                        </button>
                    )}
                </div>
            )}

            {/* Header Bento */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <span className="mf-eyebrow">Perencanaan 31 Hari</span>
                    <div className="mt-1 flex flex-wrap items-baseline gap-2">
                        <h2 className="text-base font-extrabold tracking-tight text-ink-primary">
                            {currentRange.title}
                        </h2>
                        <span className="text-xs font-medium text-ink-muted">
                            {currentRange.daySpanText}
                        </span>
                    </div>
                </div>

                {/* Desktop Column Density Toggle */}
                <div className="hidden items-center gap-1 rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) p-1 xl:flex">
                    <button
                        type="button"
                        onClick={() => setDesktopCols(4)}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${desktopCols === 4
                                ? 'bg-(--glass-card) text-ink-primary shadow-2xs'
                                : 'text-ink-secondary hover:text-ink-primary'
                            }`}
                    >
                        4 Kolom
                    </button>
                    <button
                        type="button"
                        onClick={() => setDesktopCols(2)}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${desktopCols === 2
                                ? 'bg-(--glass-card) text-ink-primary shadow-2xs'
                                : 'text-ink-secondary hover:text-ink-primary'
                            }`}
                    >
                        2 Kolom
                    </button>
                </div>
            </div>

            {/* Symmetrical 5-Column Segmented Control (M1–M5) */}
            <div
                role="tablist"
                aria-label="Pilih minggu"
                className="mt-3.5 grid grid-cols-5 gap-1.5 rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) p-1"
            >
                {WEEK_RANGES.map((w) => {
                    const isSelected = activeWeek === w.week;
                    return (
                        <button
                            key={w.week}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            onClick={() => onChangeWeek(w.week)}
                            className={`h-8 rounded-full text-xs font-extrabold transition-colors duration-150 ${isSelected
                                    ? 'bg-brand text-white shadow-2xs'
                                    : 'text-ink-secondary hover:text-ink-primary'
                                }`}
                        >
                            {w.code}
                        </button>
                    );
                })}
            </div>

            {/* Action Toolbar + Optional Template Dropdown */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-(--border-subtle) pb-3.5">
                <div className="flex flex-wrap items-center gap-1.5">
                    {activeWeek < 5 && (
                        <button
                            type="button"
                            onClick={onCopyWeekToNext}
                            className="mf-liquid-pill h-8 px-3 text-xs"
                        >
                            <CopyPlus className="h-3.5 w-3.5 text-brand" />
                            <span>Salin ke M{activeWeek + 1}</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleConfirmApplyMonth}
                        data-variant="emerald"
                        className="mf-liquid-pill h-8 px-3 text-xs"
                    >
                        <Repeat className="h-3.5 w-3.5" />
                        <span>Terapkan 31 Hari</span>
                    </button>
                </div>

                {/* Optional Preset Templates Menu */}
                <div ref={templateMenuRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setIsTemplateMenuOpen((v) => !v)}
                        aria-expanded={isTemplateMenuOpen}
                        className="mf-liquid-pill h-8 px-3 text-xs text-ink-secondary hover:text-ink-primary"
                    >
                        <LayoutTemplate className="h-3.5 w-3.5 text-brand" />
                        <span>Template</span>
                        <ChevronDown
                            className={`h-3 w-3 transition-transform duration-150 ${isTemplateMenuOpen ? 'rotate-180 text-brand' : ''
                                }`}
                        />
                    </button>

                    {isTemplateMenuOpen && (
                        <div className="absolute right-0 z-30 mt-1.5 w-60 rounded-2xl border border-(--border-strong) bg-(--glass-card) p-1.5 shadow-2xl">
                            <span className="block px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                                Pola Jadwal Opsional
                            </span>
                            {WEEKLY_PRESETS.map((preset) => {
                                const cleanName = preset.name.replace(/^Preset\s+/i, '');
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => {
                                            setIsTemplateMenuOpen(false);
                                            onRequestConfirm({
                                                title: `Terapkan Template "${cleanName}"?`,
                                                description:
                                                    'Jadwal 31 hari yang ada saat ini akan diganti dengan susunan menu dari template ini.',
                                                confirmLabel: 'Ya, Terapkan',
                                                tone: 'primary',
                                                onConfirm: () => onApplyPreset(preset.id),
                                            });
                                        }}
                                        className="flex w-full flex-col rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-brand-glass"
                                    >
                                        <span className="text-xs font-bold text-ink-primary">
                                            {cleanName}
                                        </span>
                                        <span className="line-clamp-1 text-[11px] text-ink-muted">
                                            {preset.subtitle}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Days Bento Grid */}
            <div data-cols={desktopCols} className="mf-days-grid mt-4">
                {currentRange.days.map((day) => (
                    <MealSlotCard
                        key={day}
                        day={day}
                        dayPlan={schedule[day] ?? { breakfast: [], lunch: [], dinner: [] }}
                        catalogMap={catalogMap}
                        pendingItem={pendingItem}
                        onDropItem={onDropItem}
                        onUpdatePortion={onUpdatePortion}
                        onClearDay={handleConfirmClearDay}
                    />
                ))}
            </div>
        </div>
    );
};