// src/components/calendar/MealSlotCard.tsx

import React, { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CatalogItem, DaySchedule, MealPeriod } from '../../types/meal';
import { CATEGORY_META } from '../../data/default-catalog';
import { formatIdr } from '../../utils/currency';

interface MealSlotCardProps {
    readonly day: number;
    readonly dayPlan: DaySchedule;
    readonly catalogMap: ReadonlyMap<string, CatalogItem>;
    readonly onDropItem: (day: number, period: MealPeriod, itemId: string) => void;
    readonly onUpdatePortion: (
        day: number,
        period: MealPeriod,
        itemId: string,
        delta: number,
    ) => void;
    readonly onClearDay: (day: number) => void;
}

const PERIOD_CONFIG: readonly {
    readonly key: MealPeriod;
    readonly label: string;
    readonly slotTheme: 'pagi' | 'siang' | 'malam';
}[] = [
        { key: 'breakfast', label: 'PAGI', slotTheme: 'pagi' },
        { key: 'lunch', label: 'SIANG', slotTheme: 'siang' },
        { key: 'dinner', label: 'MALAM', slotTheme: 'malam' },
    ];

export const MealSlotCard: React.FC<MealSlotCardProps> = React.memo(
    ({ day, dayPlan, catalogMap, onDropItem, onUpdatePortion, onClearDay }) => {
        const [dragOverPeriod, setDragOverPeriod] = useState<MealPeriod | null>(null);

        const dayEstimatedCost = PERIOD_CONFIG.reduce((sum, { key }) => {
            const entries = dayPlan[key];
            return (
                sum +
                entries.reduce((inner, entry) => {
                    const item = catalogMap.get(entry.itemId);
                    if (!item) return inner;
                    return (
                        inner +
                        (item.packPrice / Math.max(1, item.portionsPerPack)) * entry.portions
                    );
                }, 0)
            );
        }, 0);

        const hasAnyEntry = PERIOD_CONFIG.some(({ key }) => dayPlan[key].length > 0);

        return (
            <article
                data-active={hasAnyEntry}
                className="mf-day-card"
            >
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-black/8 pb-2.5 dark:border-white/10">
                    <div className="flex items-center gap-2">
                        <span
                            className={`tabular-nums flex h-6.5 w-6.5 items-center justify-center rounded-xl text-xs font-extrabold shadow-2xs transition-colors ${hasAnyEntry
                                    ? 'bg-linear-to-br from-blue-600 to-indigo-600 text-white'
                                    : 'bg-white/80 text-ink-secondary border border-black/8 dark:bg-white/10 dark:border-white/10'
                                }`}
                        >
                            {day}
                        </span>
                        <span className="text-xs font-bold tracking-tight text-ink-primary">
                            Hari ke-{day}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="tabular-nums text-xs font-bold text-ink-primary">
                            {formatIdr(dayEstimatedCost)}
                        </span>
                        {hasAnyEntry && (
                            <button
                                type="button"
                                onClick={() => onClearDay(day)}
                                title="Kosongkan hari ini"
                                aria-label={`Kosongkan jadwal hari ke-${day}`}
                                className="flex h-6.5 w-6.5 items-center justify-center rounded-full text-ink-muted transition-all duration-150 hover:bg-red-500/12 hover:text-red-600 active:scale-90 dark:hover:text-red-400"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Colorful Liquid Meal Slots */}
                <div className="space-y-2.5">
                    {PERIOD_CONFIG.map(({ key, label, slotTheme }) => {
                        const entries = dayPlan[key];
                        const isOver = dragOverPeriod === key;

                        return (
                            <div
                                key={key}
                                data-slot={slotTheme}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (dragOverPeriod !== key) setDragOverPeriod(key);
                                }}
                                onDragLeave={() => setDragOverPeriod(null)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOverPeriod(null);
                                    const itemId = e.dataTransfer.getData('text/plain');
                                    if (itemId) onDropItem(day, key, itemId);
                                }}
                                className={`mf-meal-slot ${isOver
                                        ? 'scale-[1.01] ring-2 ring-brand shadow-md'
                                        : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span data-slot={slotTheme} className="mf-slot-pill">
                                        {label}
                                    </span>
                                    <span className="tabular-nums text-[10px] font-semibold text-ink-muted">
                                        {entries.length} item
                                    </span>
                                </div>

                                {entries.length === 0 ? (
                                    <p className="py-2.5 text-center text-[11px] font-medium text-ink-muted/80">
                                        Drop atau klik + Pasang
                                    </p>
                                ) : (
                                    <div className="mt-2 space-y-1.5">
                                        {entries.map((entry) => {
                                            const item = catalogMap.get(entry.itemId);
                                            if (!item) return null;
                                            const dot = CATEGORY_META[item.category].dotColor;

                                            return (
                                                <div key={entry.itemId} className="mf-meal-chip">
                                                    <div className="flex min-w-0 items-center gap-1.5">
                                                        <span
                                                            className={`h-2 w-2 shrink-0 rounded-full ${dot}`}
                                                        />
                                                        <span
                                                            title={item.name}
                                                            className="truncate text-[11.5px] font-semibold text-ink-primary"
                                                        >
                                                            {item.name}
                                                        </span>
                                                    </div>

                                                    {/* Liquid Tactile Stepper */}
                                                    <div className="mf-stepper">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onUpdatePortion(day, key, entry.itemId, -1)
                                                            }
                                                            aria-label={`Kurangi porsi ${item.name}`}
                                                            className="mf-stepper-btn"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="tabular-nums min-w-5.5 text-center text-[11px] font-extrabold text-ink-primary">
                                                            {entry.portions}x
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onUpdatePortion(day, key, entry.itemId, 1)
                                                            }
                                                            aria-label={`Tambah porsi ${item.name}`}
                                                            className="mf-stepper-btn"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </article>
        );
    },
);

MealSlotCard.displayName = 'MealSlotCard';