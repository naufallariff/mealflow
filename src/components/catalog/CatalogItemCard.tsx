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
        const perPortion = Math.round(item.packPrice / Math.max(1, item.portionsPerPack));

        const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
            e.dataTransfer.setData('text/plain', item.id);
            e.dataTransfer.effectAllowed = 'copy';
        };

        return (
            <div
                draggable
                onDragStart={handleDragStart}
                className="group flex items-center justify-between gap-2 rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] p-2.5 transition-colors hover:border-[#D1D1D6] hover:bg-white"
            >
                <div className="flex min-w-0 flex-1 items-start gap-2">
                    <GripVertical className="mt-1 hidden h-4 w-4 shrink-0 cursor-grab text-[#8E8E93] sm:block" />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <p className="truncate text-xs font-semibold text-[#1C1C1E]">{item.name}</p>
                            {usedCount > 0 && (
                                <span className="tabular-nums shrink-0 rounded-full bg-[#007AFF] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    {usedCount}x
                                </span>
                            )}
                        </div>
                        <p className="tabular-nums mt-0.5 text-[11px] text-[#636366]">
                            {item.packUnit} · <strong className="text-[#1C1C1E]">{formatIdr(item.packPrice)}</strong>
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span
                                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${meta.badgeBg} ${meta.badgeText}`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
                                {meta.label}
                            </span>
                            <span className="tabular-nums text-[10px] text-[#8E8E93]">
                                {formatIdr(perPortion)}/porsi (÷{item.portionsPerPack})
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {item.isCustom && onDeleteCustom && (
                        <button
                            type="button"
                            onClick={() => onDeleteCustom(item.id)}
                            title="Hapus item kustom"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E5EA] bg-white text-[#FF3B30] hover:bg-red-50 active:scale-[0.96]"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onQuickSchedule(item)}
                        className="inline-flex min-h-8.5 items-center gap-1 rounded-lg bg-[#007AFF] px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#0066D6] active:scale-[0.96]"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Pasang</span>
                    </button>
                </div>
            </div>
        );
    },
);