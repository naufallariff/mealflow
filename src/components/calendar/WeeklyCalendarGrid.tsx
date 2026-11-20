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
    readonly onUpdatePortion: (day: number, period: MealPeriod, itemId: string, delta: number) => void;
    readonly onClearDay: (day: number) => void;
    readonly onCopyWeekToNext: () => void;
    readonly onDuplicateWeekToMonth: () => void;
}

const WEEK_RANGES: readonly { readonly week: number; readonly label: string; readonly days: readonly number[] }[] = [
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

    const currentRange = WEEK_RANGES.find((w) => w.week === activeWeek) ?? WEEK_RANGES[0];

    return (
        <section className="flex flex-col rounded-2xl border border-[#E5E5EA] bg-white p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-[#007AFF]" />
                    <div>
                        <h2 className="text-sm font-semibold text-[#1C1C1E]">
                            Fokus {currentRange.label}
                        </h2>
                        <p className="text-[11px] text-[#636366]">
                            Atur porsi per orang langsung dengan tombol − 1x +
                        </p>
                    </div>
                </div>

                {/* Desktop Column Density Toggle */}
                <div className="hidden items-center gap-1 rounded-xl bg-[#F2F2F7] p-1 xl:flex">
                    <button
                        type="button"
                        onClick={() => setDesktopCols(4)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${desktopCols === 4 ? 'bg-white text-[#1C1C1E] shadow-2xs' : 'text-[#636366]'
                            }`}
                    >
                        4 Kolom
                    </button>
                    <button
                        type="button"
                        onClick={() => setDesktopCols(2)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${desktopCols === 2 ? 'bg-white text-[#1C1C1E] shadow-2xs' : 'text-[#636366]'
                            }`}
                    >
                        2 Kolom
                    </button>
                </div>
            </div>

            {/* Week Filter Tabs */}
            <div className="mt-3 flex flex-wrap gap-1.5">
                {WEEK_RANGES.map((w) => (
                    <button
                        key={w.week}
                        type="button"
                        onClick={() => onChangeWeek(w.week)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors active:scale-[0.97] ${activeWeek === w.week
                                ? 'bg-[#007AFF] text-white shadow-2xs'
                                : 'bg-[#F2F2F7] text-[#636366] hover:text-[#1C1C1E]'
                            }`}
                    >
                        {w.label}
                    </button>
                ))}
            </div>

            {/* Duplication Shortcuts */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 border-b border-[#E5E5EA] pb-3">
                {activeWeek < 5 && (
                    <button
                        type="button"
                        onClick={onCopyWeekToNext}
                        className="inline-flex min-h-8.5 items-center gap-1.5 rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-3 py-1.5 text-xs font-medium text-[#1C1C1E] hover:bg-[#F2F2F7] active:scale-[0.97]"
                    >
                        <CopyPlus className="h-3.5 w-3.5 text-[#007AFF]" />
                        <span>Salin ke Minggu {activeWeek + 1}</span>
                    </button>
                )}
                <button
                    type="button"
                    onClick={onDuplicateWeekToMonth}
                    className="inline-flex min-h-8.5 items-center gap-1.5 rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-3 py-1.5 text-xs font-medium text-[#1C1C1E] hover:bg-[#F2F2F7] active:scale-[0.97]"
                >
                    <Repeat className="h-3.5 w-3.5 text-[#34C759]" />
                    <span>Terapkan Pola Minggu Ini ke 31 Hari</span>
                </button>
            </div>

            {/* 7-Day Cards Grid */}
            <div
                className={`mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 ${desktopCols === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-2'
                    }`}
            >
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
        </section>
    );
};