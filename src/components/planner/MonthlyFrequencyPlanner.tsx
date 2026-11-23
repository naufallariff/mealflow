// src/components/planner/MonthlyFrequencyPlanner.tsx

import React, { useMemo, useState } from 'react';
import {
    CalendarPlus,
    Layers,
    Minus,
    Pencil,
    Plus,
    Search,
    Utensils,
} from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../../data/default-catalog';
import type {
    BudgetSummary,
    BundleComponent,
    CatalogCategory,
    CatalogItem,
    MealBundle,
} from '../../types/meal';
import { formatRupiah } from '../../utils/format';
import { InteractiveEmptyState } from './InteractiveEmptyState';
import { MealBundleModal } from './MealBundleModal';

interface MonthlyFrequencyPlannerProps {
    readonly catalog: readonly CatalogItem[];
    readonly catalogMap: ReadonlyMap<string, CatalogItem>;
    readonly bundles: readonly MealBundle[];
    readonly summary: BudgetSummary;
    readonly onSetPortions: (itemId: string, portions: number) => void;
    readonly onAdjustPortions: (itemId: string, delta: number) => void;
    readonly onSaveBundle: (
        id: string | null,
        name: string,
        components: readonly BundleComponent[],
    ) => void;
    readonly onDistributeToCalendar: () => void;
}

export const MonthlyFrequencyPlanner: React.FC<
    MonthlyFrequencyPlannerProps
> = ({
    catalog,
    catalogMap,
    bundles,
    summary,
    onSetPortions,
    onAdjustPortions,
    onSaveBundle,
    onDistributeToCalendar,
}) => {
        const [selectedCategory, setSelectedCategory] = useState<
            'all' | CatalogCategory
        >('all');
        const [searchQuery, setSearchQuery] = useState('');
        const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
        const [editingBundle, setEditingBundle] = useState<MealBundle | null>(null);

        const lineMap = useMemo(() => {
            const map = new Map<string, (typeof summary.lineItems)[number]>();
            for (const line of summary.lineItems) {
                map.set(line.item.id, line);
            }
            return map;
        }, [summary.lineItems]);

        const filteredCatalog = useMemo(() => {
            const q = searchQuery.trim().toLowerCase();
            return catalog.filter((item) => {
                if (selectedCategory !== 'all' && item.category !== selectedCategory) {
                    return false;
                }
                if (q && !item.name.toLowerCase().includes(q)) return false;
                return true;
            });
        }, [catalog, selectedCategory, searchQuery]);

        const handleApplyStarterTemplate = (
            portions: Readonly<Record<string, number>>,
        ) => {
            for (const [itemId, count] of Object.entries(portions)) {
                if (catalogMap.has(itemId)) {
                    onSetPortions(itemId, count);
                }
            }
        };

        const handleApplyBundlePortion = (bundle: MealBundle, multiplier = 1) => {
            for (const comp of bundle.components) {
                if (catalogMap.has(comp.itemId)) {
                    onAdjustPortions(comp.itemId, comp.portions * multiplier);
                }
            }
        };

        return (
            <div className="flex flex-col space-y-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <span className="mf-eyebrow">Prioritas 1: Perencana Bulanan</span>
                        <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-ink-primary">
                            Frekuensi Konsumsi 31 Hari
                        </h2>
                    </div>

                    {summary.totalUnscheduledPortions > 0 && (
                        <button
                            type="button"
                            onClick={onDistributeToCalendar}
                            data-variant="primary"
                            className="mf-liquid-pill min-h-11 px-3.5 text-xs cursor-pointer"
                        >
                            <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>
                                Sebar {summary.totalUnscheduledPortions} Porsi ke Kalender
                            </span>
                        </button>
                    )}
                </div>

                {/* Interactive Empty State bila belum ada porsi */}
                {summary.totalUsedPortions === 0 && (
                    <InteractiveEmptyState
                        onApplyTemplate={handleApplyStarterTemplate}
                        onFocusPlanner={() => {
                            const el = document.getElementById('mf-frequency-search');
                            el?.focus();
                        }}
                    />
                )}

                {/* Paket Masakan Cepat (Editable Meal Bundles -> Pecah Otomatis ke Bahan Baku) */}
                <div className="rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-ink-primary">
                            <Utensils className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                            <span>Paket Masakan Cepat (+1 Porsi)</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setEditingBundle(null);
                                setIsBundleModalOpen(true);
                            }}
                            className="mf-liquid-pill h-10 px-3 text-[11px] font-bold cursor-pointer"
                        >
                            <Plus className="h-3 w-3 text-brand" aria-hidden="true" />
                            <span>Buat Paket</span>
                        </button>
                    </div>

                    <p className="mt-0.5 text-[11px] text-ink-secondary">
                        Klik nama paket untuk menambah porsi bahan mentahnya, atau tekan ikon
                        pensil untuk mengubah komposisi.
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-2">
                        {bundles.map((bundle) => (
                            <div
                                key={bundle.id}
                                className="inline-flex items-center overflow-hidden rounded-full border border-(--border-subtle) bg-(--glass-card)"
                            >
                                <button
                                    type="button"
                                    onClick={() => handleApplyBundlePortion(bundle, 1)}
                                    className="flex min-h-11 items-center gap-1.5 pr-2.5 pl-3.5 text-xs font-bold text-ink-primary transition-colors cursor-pointer hover:text-brand focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                                >
                                    <Plus className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                                    <span>{bundle.name}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingBundle(bundle);
                                        setIsBundleModalOpen(true);
                                    }}
                                    aria-label={`Ubah komposisi paket ${bundle.name}`}
                                    className="flex h-11 w-10 items-center justify-center border-l border-(--border-subtle) text-ink-muted transition-colors cursor-pointer hover:text-ink-primary focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                                >
                                    <Pencil className="h-3 w-3" aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filter & Pencarian */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
                            aria-hidden="true"
                        />
                        <input
                            id="mf-frequency-search"
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Cari bahan pokok di tabel frekuensi"
                            placeholder="Filter bahan pokok (beras, telur, ayam, sayur)..."
                            className="h-11 w-full rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) pr-4 pl-9 text-xs font-medium text-ink-primary placeholder:text-ink-muted outline-hidden transition-colors focus:border-brand focus:bg-(--glass-card) focus:ring-3 focus:ring-brand/20"
                        />
                    </div>

                    <label className="sr-only" htmlFor="mf-category-select">
                        Filter kategori bahan
                    </label>
                    <select
                        id="mf-category-select"
                        value={selectedCategory}
                        onChange={(e) =>
                            setSelectedCategory(e.target.value as 'all' | CatalogCategory)
                        }
                        className="h-11 rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) px-3.5 text-xs font-bold text-ink-primary outline-hidden cursor-pointer focus:border-brand focus:ring-3 focus:ring-brand/20"
                    >
                        <option value="all">Semua Kategori ({catalog.length})</option>
                        {CATEGORY_ORDER.map((cat) => (
                            <option key={cat} value={cat}>
                                {CATEGORY_LABELS[cat]}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tabel Spreadsheet Frekuensi Bulanan */}
                <div className="overflow-x-auto rounded-2xl border border-(--border-subtle)">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                            <tr className="border-b border-(--border-subtle) bg-(--glass-card-subtle) text-[11px] font-bold text-ink-secondary">
                                <th scope="col" className="py-3 pr-2 pl-3.5">
                                    Bahan & Takaran Makan
                                </th>
                                <th scope="col" className="hidden px-2 py-3 sm:table-cell">
                                    Kemasan Pasar
                                </th>
                                <th scope="col" className="px-2 py-3 text-right">
                                    Porsi / Bulan
                                </th>
                                <th scope="col" className="py-3 pr-3.5 pl-2 text-right">
                                    Belanja Kasir
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--border-subtle)">
                            {filteredCatalog.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-8 text-center text-xs font-medium text-ink-muted"
                                    >
                                        Tidak ada bahan pokok yang sesuai dengan filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredCatalog.map((item) => {
                                    const line = lineMap.get(item.id);
                                    const usedPortions = line?.usedPortions ?? 0;
                                    const unitPrice = Math.round(
                                        item.packPrice / Math.max(1, item.portionsPerPack),
                                    );

                                    return (
                                        <tr
                                            key={item.id}
                                            className={`transition-colors ${usedPortions > 0
                                                    ? 'bg-brand-glass/40'
                                                    : 'hover:bg-(--glass-card-subtle)'
                                                }`}
                                        >
                                            <td className="py-3 pr-2 pl-3.5">
                                                <p className="font-extrabold text-ink-primary">
                                                    {item.name}
                                                </p>
                                                <p className="mt-0.5 tabular-nums text-[11px] font-medium text-ink-secondary">
                                                    {item.consumptionUnit} ({formatRupiah(unitPrice)})
                                                </p>
                                            </td>

                                            <td className="hidden px-2 py-3 tabular-nums text-[11px] text-ink-secondary sm:table-cell">
                                                <span className="font-semibold text-ink-primary">
                                                    {item.packUnit}
                                                </span>
                                                <span className="block text-[10px] text-ink-muted">
                                                    {formatRupiah(item.packPrice)} (isi{' '}
                                                    {item.portionsPerPack})
                                                </span>
                                            </td>

                                            <td className="px-2 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => onAdjustPortions(item.id, -1)}
                                                        disabled={usedPortions <= 0}
                                                        aria-label={`Kurangi porsi bulanan ${item.name}`}
                                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--glass-card) text-ink-primary transition-transform cursor-pointer hover:border-brand focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 active:scale-95 disabled:pointer-events-none disabled:opacity-35"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                                                    </button>

                                                    <input
                                                        type="number"
                                                        inputMode="numeric"
                                                        min={0}
                                                        max={500}
                                                        value={usedPortions}
                                                        aria-label={`Jumlah porsi bulanan ${item.name}`}
                                                        onChange={(e) => {
                                                            const nextVal = Number.parseInt(e.target.value, 10);
                                                            onSetPortions(
                                                                item.id,
                                                                Number.isNaN(nextVal) ? 0 : nextVal,
                                                            );
                                                        }}
                                                        className="h-11 w-13 rounded-xl border border-(--border-subtle) bg-(--glass-card) text-center tabular-nums text-xs font-extrabold text-ink-primary outline-hidden focus:border-brand focus:ring-3 focus:ring-brand/20"
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() => onAdjustPortions(item.id, 1)}
                                                        aria-label={`Tambah porsi bulanan ${item.name}`}
                                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-(--border-subtle) bg-(--glass-card) text-ink-primary transition-transform cursor-pointer hover:border-brand focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 active:scale-95"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="py-3 pr-3.5 pl-2 text-right tabular-nums">
                                                {line ? (
                                                    <div>
                                                        <span className="font-extrabold text-ink-primary">
                                                            {formatRupiah(line.retailCheckoutCost)}
                                                        </span>
                                                        <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-semibold text-brand">
                                                            <Layers className="h-3 w-3" aria-hidden="true" />
                                                            {line.packsToBuy} kemasan
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-ink-muted">
                                                        -
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <MealBundleModal
                    isOpen={isBundleModalOpen}
                    editingBundle={editingBundle}
                    catalog={catalog}
                    catalogMap={catalogMap}
                    onClose={() => {
                        setIsBundleModalOpen(false);
                        setEditingBundle(null);
                    }}
                    onSaveBundle={onSaveBundle}
                />
            </div>
        );
    };