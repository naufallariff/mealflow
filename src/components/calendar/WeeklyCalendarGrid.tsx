// src/components/calendar/WeeklyCalendarGrid.tsx

import React, { useState } from 'react';
import { CalendarRange, CopyPlus, Repeat } from 'lucide-react';
import type { CatalogItem, MealPeriod, MonthlySchedule } from '../../types/meal';
import { MealSlotCard } from './MealSlotCard';

interface WeeklyCalendarGridProps {
    readonly schedule: MonthlySchedule;
    readonly catalogMap: ReadonlyMap<string, CatalogItem>;
    readonly activeWeek: number;
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
}

const WEEK_RANGES: readonly {
    readonly week: number;
    readonly label: string;
    readonly days: readonly number[];
}[] = [
        { week: 1, label: 'Minggu 1 (1–7)', days: [1, 2, 3, 4, 5, 6, 7] },
        { week: 2, label: 'Minggu 2 (8–14)', days: [8, 9, 10, 11, 12, 13, 14] },
        { week: 3, label: 'Minggu 3 (15–21)', days: [15, 16, 17, 18, 19, 20, 21] },
        { week: 4, label: 'Minggu 4 (22–28)', days: [22, 23, 24, 25, 26, 27, 28] },
        { week: 5, label: 'Minggu 5 (29–31)', days: [29, 30, 31] },
    ];

export const WeeklyCalendarGrid: React.FC<WeeklyCalendarGridProps> = ({
    schedule,
    catalogMap,
    activeWeek,
    onChangeWeek,
    onDropItem,
    onUpdatePortion,
    onClearDay,
    onCopyWeekToNext,
    onDuplicateWeekToMonth,
}) => {
    const [desktopCols, setDesktopCols] = useState<4 | 2>(4);

    const currentRange =
        WEEK_RANGES.find((w) => w.week === activeWeek) ?? WEEK_RANGES[0];

    return (
        <div className="flex flex-col">
            {/* Header & Density Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-brand-glass text-brand">
                        <CalendarRange className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-extrabold tracking-tight text-ink-primary sm:text-[15px]">
                            Fokus {currentRange.label}
                        </h2>
                        <p className="text-xs font-medium text-ink-muted">
                            Atur porsi per orang langsung dengan tombol − 1x +
                        </p>
                    </div>
                </div>

                {/* Desktop Column Density Segmented Control */}
                <div className="hidden items-center gap-1 rounded-full border border-black/8 bg-white/50 p-1 backdrop-blur-md xl:flex dark:border-white/10 dark:bg-white/5">
                    <button
                        type="button"
                        onClick={() => setDesktopCols(4)}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-150 ${desktopCols === 4
                                ? 'bg-white text-ink-primary shadow-xs dark:bg-white/15'
                                : 'text-ink-secondary hover:text-ink-primary'
                            }`}
                    >
                        4 Kolom
                    </button>
                    <button
                        type="button"
                        onClick={() => setDesktopCols(2)}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all duration-150 ${desktopCols === 2
                                ? 'bg-white text-ink-primary shadow-xs dark:bg-white/15'
                                : 'text-ink-secondary hover:text-ink-primary'
                            }`}
                    >
                        2 Kolom
                    </button>
                </div>
            </div>

            {/* Week Filter Pills */}
            <div className="mt-3.5 flex flex-wrap gap-1.5">
                {WEEK_RANGES.map((w) => {
                    const isSelected = activeWeek === w.week;
                    return (
                        <button
                            key={w.week}
                            type="button"
                            onClick={() => onChangeWeek(w.week)}
                            data-variant={isSelected ? 'primary' : undefined}
                            className="mf-liquid-pill min-h-8.5 px-3.5 text-xs"
                        >
                            {w.label}
                        </button>
                    );
                })}
            </div>

            {/* Duplication Action Bar */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-black/8 pb-3.5 dark:border-white/10">
                {activeWeek < 5 && (
                    <button
                        type="button"
                        onClick={onCopyWeekToNext}
                        className="mf-liquid-pill min-h-8.5 text-xs"
                    >
                        <CopyPlus className="h-3.5 w-3.5 text-brand" />
                        <span>Salin ke Minggu {activeWeek + 1}</span>
                    </button>
                )}
                <button
                    type="button"
                    onClick={onDuplicateWeekToMonth}
                    data-variant="emerald"
                    className="mf-liquid-pill min-h-8.5 text-xs"
                >
                    <Repeat className="h-3.5 w-3.5" />
                    <span>Terapkan Pola Minggu Ini ke 31 Hari</span>
                </button>
            </div>

            {/* 7-Day Liquid Cards Grid */}
            <div data-cols={desktopCols} className="mf-days-grid mt-4">
                {currentRange.days.map((day) => (
                    <MealSlotCard
                        key={day}
                        day={day}
                        dayPlan={schedule[day] ?? { breakfast: [], lunch: [], dinner: [] }}
                        catalogMap={catalogMap}
                        onDropItem={onDropItem}
                        onUpdatePortion={onUpdatePortion}
                        onClearDay={onClearDay}
                    />
                ))}
            </div>
        </div>
    );
};