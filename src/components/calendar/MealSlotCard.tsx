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
    readonly pendingItem?: CatalogItem | null;
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
        { key: 'breakfast', label: 'Pagi', slotTheme: 'pagi' },
        { key: 'lunch', label: 'Siang', slotTheme: 'siang' },
        { key: 'dinner', label: 'Malam', slotTheme: 'malam' },
    ];

export const MealSlotCard: React.FC<MealSlotCardProps> = React.memo(
    ({
        day,
        dayPlan,
        catalogMap,
        pendingItem = null,
        onDropItem,
        onUpdatePortion,
        onClearDay,
    }) => {
        const [dragOverPeriod, setDragOverPeriod] = useState<MealPeriod | null>(null);

        const periodCosts: Record<MealPeriod, number> = {
            breakfast: 0,
            lunch: 0,
            dinner: 0,
        };
        let dayEstimatedCost = 0;
        let hasAnyEntry = false;

        for (const { key } of PERIOD_CONFIG) {
            const entries = dayPlan[key];
            if (entries.length > 0) hasAnyEntry = true;
            for (const entry of entries) {
                const item = catalogMap.get(entry.itemId);
                if (item) {
                    const cost =
                        (item.packPrice / Math.max(1, item.portionsPerPack)) * entry.portions;
                    periodCosts[key] += cost;
                    dayEstimatedCost += cost;
                }
            }
        }

        const isSelectingSlot = Boolean(pendingItem);

        return (
            <article data-active={hasAnyEntry} className="mf-day-card">
                {/* Day Header */}
                <header className="flex items-center justify-between border-b border-(--border-subtle) pb-2.5">
                    <div className="flex items-center gap-2">
                        <span
                            className={`tabular-nums flex h-6.5 w-6.5 items-center justify-center rounded-lg text-xs font-extrabold transition-colors ${hasAnyEntry
                                    ? 'bg-brand text-white'
                                    : 'border border-(--border-subtle) bg-(--glass-card-subtle) text-ink-secondary'
                                }`}
                        >
                            {day}
                        </span>
                        <h3 className="text-[13px] font-bold tracking-tight text-ink-primary">
                            Hari ke-{day}
                        </h3>
                    </div>

                    <div className="flex items-center gap-1">
                        <span className="tabular-nums text-xs font-bold text-ink-secondary">
                            {formatIdr(dayEstimatedCost)}
                        </span>
                        {hasAnyEntry && (
                            <button
                                type="button"
                                onClick={() => onClearDay(day)}
                                title={`Kosongkan jadwal hari ke-${day}`}
                                aria-label={`Kosongkan jadwal hari ke-${day}`}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </header>

                {/* Meal Slots (Pagi, Siang, Malam) */}
                <div className="mt-3 space-y-2.5">
                    {PERIOD_CONFIG.map(({ key, label, slotTheme }) => {
                        const entries = dayPlan[key];
                        const isOver = dragOverPeriod === key;
                        const slotCost = periodCosts[key];

                        return (
                            <div
                                key={key}
                                data-slot={slotTheme}
                                data-selectable={isSelectingSlot}
                                role={isSelectingSlot ? 'button' : undefined}
                                tabIndex={isSelectingSlot ? 0 : undefined}
                                onClick={() => {
                                    if (pendingItem) {
                                        onDropItem(day, key, pendingItem.id);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        pendingItem &&
                                        (e.key === 'Enter' || e.key === ' ')
                                    ) {
                                        e.preventDefault();
                                        onDropItem(day, key, pendingItem.id);
                                    }
                                }}
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
                                className={`mf-meal-slot ${isOver ? 'ring-2 ring-brand' : ''}`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span data-slot={slotTheme} className="mf-slot-pill">
                                        {label}
                                    </span>
                                    {isSelectingSlot ? (
                                        <span className="text-[10px] font-extrabold text-brand">
                                            + Klik untuk pasang
                                        </span>
                                    ) : (
                                        entries.length > 0 && (
                                            <span className="tabular-nums text-[10px] font-bold text-ink-secondary">
                                                {formatIdr(slotCost)}
                                            </span>
                                        )
                                    )}
                                </div>

                                {entries.length === 0 ? (
                                    <p className="py-2 text-center text-[11px] font-medium text-ink-muted/75">
                                        {isSelectingSlot
                                            ? `Pasang ke ${label}`
                                            : 'Kosong'}
                                    </p>
                                ) : (
                                    <ul
                                        onClick={(e) => {
                                            if (!isSelectingSlot) e.stopPropagation();
                                        }}
                                        className="mt-2 space-y-1.5"
                                    >
                                        {entries.map((entry) => {
                                            const item = catalogMap.get(entry.itemId);
                                            if (!item) return null;
                                            const dot = CATEGORY_META[item.category].dotColor;

                                            return (
                                                <li key={entry.itemId} className="mf-meal-chip">
                                                    <div className="flex min-w-0 items-center gap-1.5">
                                                        <span
                                                            className={`h-2 w-2 shrink-0 rounded-full ${dot}`}
                                                        />
                                                        <span
                                                            title={item.name}
                                                            className="truncate text-xs font-medium text-ink-primary"
                                                        >
                                                            {item.name}
                                                        </span>
                                                    </div>

                                                    <div
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="mf-stepper"
                                                    >
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
                                                        <span className="tabular-nums min-w-5 text-center text-[11px] font-bold text-ink-primary">
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
                                                </li>
                                            );
                                        })}
                                    </ul>
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