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
    readonly onOpenSlotPicker?: (day: number, period: MealPeriod) => void;
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
        onOpenSlotPicker,
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

        const handleSlotClick = (period: MealPeriod) => {
            if (pendingItem) {
                onDropItem(day, period, pendingItem.id);
                return;
            }
            onOpenSlotPicker?.(day, period);
        };

        return (
            <article data-active={hasAnyEntry} className="mf-day-card">
                {/* Header Hari */}
                <header className="flex items-center justify-between border-b border-(--border-subtle) pb-2.5">
                    <div className="flex items-center gap-2">
                        <span
                            className={`flex size-6.5 items-center justify-center rounded-lg text-xs font-extrabold tabular-nums transition-colors ${hasAnyEntry
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
                        <span className="text-xs font-bold text-ink-secondary tabular-nums">
                            {formatIdr(dayEstimatedCost)}
                        </span>
                        {hasAnyEntry && (
                            <button
                                type="button"
                                onClick={() => onClearDay(day)}
                                title={`Kosongkan jadwal hari ke-${day}`}
                                aria-label={`Kosongkan jadwal hari ke-${day}`}
                                className="flex size-7 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 dark:hover:text-red-400"
                            >
                                <Trash2 className="size-3.5" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </header>

                {/* Slot Waktu Makan (Pagi, Siang, Malam) */}
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
                                role="button"
                                tabIndex={0}
                                aria-label={
                                    isSelectingSlot
                                        ? `Pasang ${pendingItem?.name ?? 'menu'} ke slot ${label} Hari ke-${day}`
                                        : `Pilih menu untuk slot ${label} Hari ke-${day}`
                                }
                                onClick={() => handleSlotClick(key)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleSlotClick(key);
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
                                className={`mf-meal-slot cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 ${isOver ? 'ring-3 ring-brand' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span data-slot={slotTheme} className="mf-slot-pill">
                                        {label}
                                    </span>
                                    {isSelectingSlot ? (
                                        <span className="text-[10px] font-extrabold text-brand">
                                            + Klik untuk pasang
                                        </span>
                                    ) : entries.length > 0 ? (
                                        <span className="text-[10px] font-bold text-ink-secondary tabular-nums">
                                            {formatIdr(slotCost)}
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-semibold text-ink-muted">
                                            + Pilih menu
                                        </span>
                                    )}
                                </div>

                                {entries.length === 0 ? (
                                    <p className="py-2 text-center text-[11px] font-medium text-ink-muted/80">
                                        {isSelectingSlot
                                            ? `Pasang ke ${label}`
                                            : `Kosong — klik untuk tambah ${label.toLowerCase()}`}
                                    </p>
                                ) : (
                                    <ul
                                        onClick={(e) => {
                                            e.stopPropagation();
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
                                                            className={`size-2 shrink-0 rounded-full ${dot}`}
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
                                                            className="mf-stepper-btn focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                                                        >
                                                            <Minus className="size-3" aria-hidden="true" />
                                                        </button>
                                                        <span className="min-w-5 text-center text-[11px] font-bold text-ink-primary tabular-nums">
                                                            {entry.portions}x
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                onUpdatePortion(day, key, entry.itemId, 1)
                                                            }
                                                            aria-label={`Tambah porsi ${item.name}`}
                                                            className="mf-stepper-btn focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                                                        >
                                                            <Plus className="size-3" aria-hidden="true" />
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