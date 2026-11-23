// src/components/catalog/CatalogItemCard.tsx

import React from 'react';
import { CalendarPlus, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { CATEGORY_META } from '../../data/default-catalog';
import type { CatalogItem } from '../../types/meal';
import { formatRupiah } from '../../utils/format';

interface CatalogItemCardProps {
    readonly item: CatalogItem;
    readonly usedCount?: number;
    readonly isOverridden?: boolean;
    readonly onQuickSchedule: (item: CatalogItem) => void;
    readonly onEditItem?: (item: CatalogItem) => void;
    readonly onResetItem?: (itemId: string) => void;
    readonly onDeleteCustom?: (itemId: string) => void;
}

export const CatalogItemCard: React.FC<CatalogItemCardProps> = ({
    item,
    usedCount = 0,
    isOverridden = false,
    onQuickSchedule,
    onEditItem,
    onResetItem,
    onDeleteCustom,
}) => {
    const meta = CATEGORY_META[item.category];
    const safeYield = Math.max(1, item.portionsPerPack);
    const unitConsumptionPrice = Math.round(item.packPrice / safeYield);

    return (
        <div className="rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) p-3 transition-colors hover:border-brand/50">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badgeBg} ${meta.badgeText}`}
                        >
                            <span
                                className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`}
                                aria-hidden="true"
                            />
                            <span>{meta.label}</span>
                        </span>

                        {usedCount > 0 && (
                            <span className="tabular-nums rounded-full bg-brand-glass px-2 py-0.5 text-[10px] font-extrabold text-brand">
                                {usedCount}x / bln
                            </span>
                        )}
                    </div>

                    <h3 className="mt-1.5 truncate text-xs font-extrabold text-ink-primary">
                        {item.name}
                    </h3>
                    <p className="mt-0.5 tabular-nums text-[11px] font-semibold text-ink-secondary">
                        {item.consumptionUnit} · {formatRupiah(unitConsumptionPrice)}
                    </p>
                    <p className="mt-0.5 tabular-nums text-[10px] text-ink-muted">
                        Kemasan: {item.packUnit} ({formatRupiah(item.packPrice)}, isi{' '}
                        {safeYield})
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {onEditItem && (
                        <button
                            type="button"
                            onClick={() => onEditItem(item)}
                            aria-label={`Ubah harga atau satuan ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--glass-card) text-ink-secondary transition-colors cursor-pointer hover:border-brand hover:text-ink-primary focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    )}

                    {isOverridden && onResetItem && !item.isCustom && (
                        <button
                            type="button"
                            onClick={() => onResetItem(item.id)}
                            aria-label={`Kembalikan harga bawaan ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--glass-card) text-ink-secondary transition-colors cursor-pointer hover:border-brand hover:text-ink-primary focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                        >
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    )}

                    {item.isCustom && onDeleteCustom && (
                        <button
                            type="button"
                            onClick={() => onDeleteCustom(item.id)}
                            aria-label={`Hapus item ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--glass-card) text-ink-secondary transition-colors cursor-pointer hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-600 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                        >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={() => onQuickSchedule(item)}
                className="mf-liquid-pill mt-2.5 min-h-10 w-full justify-center px-3 text-xs font-bold cursor-pointer"
            >
                <CalendarPlus className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                <span>Pasang ke Slot Kalender</span>
            </button>
        </div>
    );
};