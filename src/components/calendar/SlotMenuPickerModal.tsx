// src/components/calendar/SlotMenuPickerModal.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, UtensilsCrossed, X } from 'lucide-react';
import { CATEGORY_LABELS } from '../../data/default-catalog';
import type { CatalogItem, MealPeriod } from '../../types/meal';
import { formatRupiah } from '../../utils/format';

export interface ActiveSlotTarget {
    readonly day: number;
    readonly period: MealPeriod;
}

interface SlotMenuPickerModalProps {
    readonly target: ActiveSlotTarget | null;
    readonly catalog: readonly CatalogItem[];
    readonly onClose: () => void;
    readonly onAssignMenu: (
        day: number,
        period: MealPeriod,
        itemId: string,
        portions: number,
    ) => void;
}

const PERIOD_LABEL: Readonly<Record<MealPeriod, string>> = {
    breakfast: 'Pagi',
    lunch: 'Siang',
    dinner: 'Malam',
};

export const SlotMenuPickerModal: React.FC<SlotMenuPickerModalProps> = ({
    target,
    catalog,
    onClose,
    onAssignMenu,
}) => {
    const [query, setQuery] = useState('');
    const [selectedPortions, setSelectedPortions] = useState(1);

    useEffect(() => {
        if (!target) return;
        setQuery('');
        setSelectedPortions(1);
    }, [target]);

    useEffect(() => {
        if (!target) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [target, onClose]);

    const filteredItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        return catalog.filter((item) => {
            if (!q) return true;
            return (
                item.name.toLowerCase().includes(q) ||
                CATEGORY_LABELS[item.category].toLowerCase().includes(q)
            );
        });
    }, [catalog, query]);

    if (!target) return null;

    const periodText = PERIOD_LABEL[target.period];

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mf-slot-picker-title"
            className="mf-modal-scrim"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="mf-modal-glass max-w-md space-y-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-glass text-brand">
                            <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                            <span className="mf-eyebrow">
                                Hari ke-{target.day} · Slot {periodText}
                            </span>
                            <h3
                                id="mf-slot-picker-title"
                                className="mt-0.5 text-sm font-extrabold text-ink-primary"
                            >
                                Pilih Menu / Bahan untuk {periodText}
                            </h3>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup pemilih menu slot"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) text-ink-secondary cursor-pointer hover:text-ink-primary focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Pengaturan Porsi & Pencarian */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    <div className="relative sm:col-span-2">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            aria-label="Cari bahan atau menu"
                            placeholder="Cari beras, telur, ayam, sayur..."
                            className="h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) pr-3 pl-8 text-xs font-semibold text-ink-primary placeholder:text-ink-muted outline-hidden focus:border-brand focus:ring-3 focus:ring-brand/20"
                        />
                    </div>

                    <div>
                        <label htmlFor="mf-slot-portions" className="sr-only">
                            Jumlah porsi per slot
                        </label>
                        <input
                            id="mf-slot-portions"
                            type="number"
                            min={1}
                            max={20}
                            value={selectedPortions}
                            onChange={(e) =>
                                setSelectedPortions(
                                    Math.max(1, Math.min(20, Number.parseInt(e.target.value, 10) || 1)),
                                )
                            }
                            aria-label="Jumlah porsi"
                            className="h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-2.5 text-center tabular-nums text-xs font-extrabold text-ink-primary outline-hidden focus:border-brand focus:ring-3 focus:ring-brand/20"
                        />
                    </div>
                </div>

                {/* Daftar Pilihan Bahan / Menu */}
                <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                    {filteredItems.length === 0 ? (
                        <li className="rounded-xl border border-dashed border-(--border-subtle) py-6 text-center text-xs text-ink-muted">
                            Menu atau bahan tidak ditemukan.
                        </li>
                    ) : (
                        filteredItems.map((item) => {
                            const unitCost = Math.round(
                                item.packPrice / Math.max(1, item.portionsPerPack),
                            );
                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onAssignMenu(
                                                target.day,
                                                target.period,
                                                item.id,
                                                selectedPortions,
                                            );
                                            onClose();
                                        }}
                                        className="flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3 py-2 text-left transition-colors cursor-pointer hover:border-brand focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-extrabold text-ink-primary">
                                                {item.name}
                                            </p>
                                            <p className="mt-0.5 tabular-nums text-[11px] text-ink-secondary">
                                                {item.consumptionUnit} · {formatRupiah(unitCost)} / porsi
                                            </p>
                                        </div>

                                        <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-brand-glass px-2.5 text-[11px] font-extrabold text-brand">
                                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                            <span>+{selectedPortions}</span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>
        </div>
    );
};