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
    readonly onUpdatePortion: (day: number, period: MealPeriod, itemId: string, delta: number) => void;
    readonly onClearDay: (day: number) => void;
}

const PERIOD_LABELS: readonly { readonly key: MealPeriod; readonly label: string }[] = [
    { key: 'breakfast', label: 'PAGI' },
    { key: 'lunch', label: 'SIANG' },
    { key: 'dinner', label: 'MALAM' },
];

export const MealSlotCard: React.FC<MealSlotCardProps> = React.memo(
    ({ day, dayPlan, catalogMap, onDropItem, onUpdatePortion, onClearDay }) => {
        const [dragOverPeriod, setDragOverPeriod] = useState<MealPeriod | null>(null);

        const dayEstimatedCost = PERIOD_LABELS.reduce((sum, { key }) => {
            const entries = dayPlan[key];
            return (
                sum +
                entries.reduce((inner, entry) => {
                    const item = catalogMap.get(entry.itemId);
                    if (!item) return inner;
                    return inner + (item.packPrice / Math.max(1, item.portionsPerPack)) * entry.portions;
                }, 0)
            );
        }, 0);

        const hasAnyEntry = PERIOD_LABELS.some(({ key }) => dayPlan[key].length > 0);

        return (
            <article className="flex flex-col rounded-2xl border border-[#E5E5EA] bg-white p-3.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-2">
                    <div className="flex items-center gap-2">
                        <span className="tabular-nums flex h-6 w-6 items-center justify-center rounded-lg bg-[#007AFF] text-xs font-bold text-white">
                            {day}
                        </span>
                        <span className="text-xs font-semibold text-[#1C1C1E]">Hari ke-{day}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="tabular-nums text-xs font-semibold text-[#1C1C1E]">
                            {formatIdr(dayEstimatedCost)}
                        </span>
                        {hasAnyEntry && (
                            <button
                                type="button"
                                onClick={() => onClearDay(day)}
                                title="Kosongkan hari ini"
                                className="flex h-6 w-6 items-center justify-center rounded-md text-[#8E8E93] hover:bg-red-50 hover:text-[#FF3B30]"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-2.5 space-y-2.5">
                    {PERIOD_LABELS.map(({ key, label }) => {
                        const entries = dayPlan[key];
                        const isOver = dragOverPeriod === key;

                        return (
                            <div
                                key={key}
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
                                className={`rounded-xl border p-2 transition-colors ${isOver
                                        ? 'border-[#007AFF] bg-[#007AFF]/5'
                                        : 'border-[#E5E5EA] bg-[#F8F9FB]'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold tracking-wider text-[#8E8E93]">
                                        {label}
                                    </span>
                                    <span className="tabular-nums text-[10px] text-[#8E8E93]">
                                        {entries.length} item
                                    </span>
                                </div>

                                {entries.length === 0 ? (
                                    <p className="py-2 text-center text-[11px] text-[#8E8E93]">
                                        Drop atau klik + Pasang
                                    </p>
                                ) : (
                                    <div className="mt-1.5 space-y-1.5">
                                        {entries.map((entry) => {
                                            const item = catalogMap.get(entry.itemId);
                                            if (!item) return null;
                                            const dot = CATEGORY_META[item.category].dotColor;

                                            return (
                                                <div
                                                    key={entry.itemId}
                                                    className="flex items-center justify-between gap-1.5 rounded-lg border border-[#E5E5EA] bg-white px-2 py-1.5"
                                                >
                                                    <div className="flex min-w-0 items-center gap-1.5">
                                                        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                                                        <span className="truncate text-[11px] font-medium text-[#1C1C1E]">
                                                            {item.name}
                                                        </span>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-1 rounded-md border border-[#E5E5EA] bg-[#F8F9FB] px-1 py-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => onUpdatePortion(day, key, entry.itemId, -1)}
                                                            aria-label="Kurangi porsi"
                                                            className="flex h-5 w-5 items-center justify-center rounded text-[#636366] hover:bg-white hover:text-[#1C1C1E]"
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </button>
                                                        <span className="tabular-nums min-w-5 text-center text-[11px] font-bold text-[#1C1C1E]">
                                                            {entry.portions}x
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => onUpdatePortion(day, key, entry.itemId, 1)}
                                                            aria-label="Tambah porsi"
                                                            className="flex h-5 w-5 items-center justify-center rounded text-[#636366] hover:bg-white hover:text-[#1C1C1E]"
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