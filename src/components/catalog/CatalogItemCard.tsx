// src/components/catalog/CatalogItemCard.tsx

import React from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type { CatalogItem } from '../../types/meal';
import { CATEGORY_META } from '../../data/default-catalog';
import { formatIdr } from '../../utils/currency';

interface CatalogItemCardProps {
    readonly item: CatalogItem;
    readonly usedCount: number;
    readonly onQuickSchedule: (item: CatalogItem) => void;
    readonly onDeleteCustom?: (itemId: string) => void;
}

export const CatalogItemCard: React.FC<CatalogItemCardProps> = React.memo(
    ({ item, usedCount, onQuickSchedule, onDeleteCustom }) => {
        const meta = CATEGORY_META[item.category];
        const perPortion = Math.round(
            item.packPrice / Math.max(1, item.portionsPerPack),
        );

        const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
            e.dataTransfer.setData('text/plain', item.id);
            e.dataTransfer.effectAllowed = 'copy';
        };

        return (
            <div
                draggable
                onDragStart={handleDragStart}
                className="mf-catalog-card group cursor-grab active:cursor-grabbing"
            >
                <div className="flex min-w-0 flex-1 items-start gap-2">
                    <GripVertical
                        aria-hidden="true"
                        className="mt-1 hidden h-4 w-4 shrink-0 text-ink-muted/70 transition-colors group-hover:text-ink-secondary sm:block"
                    />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <p
                                title={item.name}
                                className="truncate text-xs font-bold tracking-tight text-ink-primary"
                            >
                                {item.name}
                            </p>
                            {usedCount > 0 && (
                                <span className="tabular-nums shrink-0 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
                                    {usedCount}x
                                </span>
                            )}
                        </div>

                        <p className="tabular-nums mt-0.5 text-[11px] font-medium text-ink-secondary">
                            {item.packUnit} ·{' '}
                            <strong className="font-bold text-ink-primary">
                                {formatIdr(item.packPrice)}
                            </strong>
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badgeBg} ${meta.badgeText}`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
                                {meta.label}
                            </span>
                            <span className="tabular-nums text-[10px] font-medium text-ink-muted">
                                {formatIdr(perPortion)}/porsi (÷{item.portionsPerPack})
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                    {item.isCustom && onDeleteCustom && (
                        <button
                            type="button"
                            onClick={() => onDeleteCustom(item.id)}
                            title="Hapus item kustom"
                            aria-label={`Hapus item kustom ${item.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-white/75 text-red-600 transition-transform duration-150 hover:bg-red-500/12 active:scale-90 dark:border-white/12 dark:bg-white/10 dark:text-red-400"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onQuickSchedule(item)}
                        data-variant="primary"
                        className="mf-liquid-pill min-h-8.5 px-3 text-xs"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Pasang</span>
                    </button>
                </div>
            </div>
        );
    },
);

CatalogItemCard.displayName = 'CatalogItemCard';