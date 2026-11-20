// src/components/catalog/CatalogPanel.tsx

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Layers, Plus, Search } from 'lucide-react';
import type { CatalogCategory, CatalogItem, ItemKind } from '../../types/meal';
import { CATEGORY_META } from '../../data/default-catalog';
import { useDebouncedValue } from '../../hooks/use-debounced-value';
import { CatalogItemCard } from './CatalogItemCard';
import { CustomItemModal } from './CustomItemModal';

interface CatalogPanelProps {
    readonly items: readonly CatalogItem[];
    readonly usageCounts: ReadonlyMap<string, number>;
    readonly onQuickSchedule: (item: CatalogItem) => void;
    readonly onAddCustomItem: (item: CatalogItem) => void;
    readonly onDeleteCustomItem: (itemId: string) => void;
}

const ITEMS_PER_PAGE = 9;

export const CatalogPanel: React.FC<CatalogPanelProps> = ({
    items,
    usageCounts,
    onQuickSchedule,
    onAddCustomItem,
    onDeleteCustomItem,
}) => {
    const [activeKind, setActiveKind] = useState<ItemKind>('food');
    const [selectedCategory, setSelectedCategory] = useState<'all' | CatalogCategory>('all');
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const debouncedQuery = useDebouncedValue(searchText.trim().toLowerCase(), 200);

    const categoryOptions: readonly CatalogCategory[] =
        activeKind === 'food'
            ? ['raw-ingredient', 'seasoning-pantry', 'street-food', 'fancy-mall']
            : ['home-brew', 'street-drink', 'cafe-mall'];

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            if (item.kind !== activeKind) return false;
            if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
            if (debouncedQuery && !item.name.toLowerCase().includes(debouncedQuery)) return false;
            return true;
        });
    }, [items, activeKind, selectedCategory, debouncedQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const paginatedItems = filteredItems.slice(
        (safePage - 1) * ITEMS_PER_PAGE,
        safePage * ITEMS_PER_PAGE,
    );

    const handleSwitchKind = (kind: ItemKind) => {
        setActiveKind(kind);
        setSelectedCategory('all');
        setPage(1);
    };

    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-glass text-brand">
                        <Layers className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-extrabold tracking-tight text-ink-primary">
                            Katalog Puzzle
                        </h2>
                        <p className="tabular-nums text-[11px] font-medium text-ink-muted">
                            {filteredItems.length} item tersedia
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    data-variant="primary"
                    className="mf-liquid-pill min-h-8.5 px-3 text-xs"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Item</span>
                </button>
            </div>

            {/* Food vs Drink Liquid Segmented Control */}
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-full border border-black/8 bg-white/45 p-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                <button
                    type="button"
                    onClick={() => handleSwitchKind('food')}
                    className={`rounded-full py-1.5 text-xs font-bold transition-all duration-150 ${activeKind === 'food'
                            ? 'bg-white text-ink-primary shadow-xs dark:bg-white/15'
                            : 'text-ink-secondary hover:text-ink-primary'
                        }`}
                >
                    Makanan ({items.filter((i) => i.kind === 'food').length})
                </button>
                <button
                    type="button"
                    onClick={() => handleSwitchKind('drink')}
                    className={`rounded-full py-1.5 text-xs font-bold transition-all duration-150 ${activeKind === 'drink'
                            ? 'bg-white text-ink-primary shadow-xs dark:bg-white/15'
                            : 'text-ink-secondary hover:text-ink-primary'
                        }`}
                >
                    Minuman ({items.filter((i) => i.kind === 'drink').length})
                </button>
            </div>

            {/* Translucent Search Input */}
            <div className="relative mt-2.5">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                <input
                    type="search"
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                        setPage(1);
                    }}
                    placeholder={
                        activeKind === 'food'
                            ? 'Cari ayam, telur, nasi padang, sushi...'
                            : 'Cari kopi, teh, susu UHT, matcha...'
                    }
                    className="h-9.5 w-full rounded-full border border-black/8 bg-white/70 pr-3.5 pl-9 text-xs font-medium text-ink-primary placeholder:text-ink-muted outline-none transition-all focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 dark:border-white/12 dark:bg-white/8 dark:focus:bg-white/15"
                />
            </div>

            {/* Category Filter Pills */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
                <button
                    type="button"
                    onClick={() => {
                        setSelectedCategory('all');
                        setPage(1);
                    }}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all duration-150 active:scale-95 ${selectedCategory === 'all'
                            ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                            : 'border border-black/6 bg-white/55 text-ink-secondary hover:bg-white/85 hover:text-ink-primary dark:border-white/10 dark:bg-white/6'
                        }`}
                >
                    Semua
                </button>
                {categoryOptions.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const isSelected = selectedCategory === cat;
                    return (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => {
                                setSelectedCategory(cat);
                                setPage(1);
                            }}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all duration-150 active:scale-95 ${isSelected
                                    ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                                    : 'border border-black/6 bg-white/55 text-ink-secondary hover:bg-white/85 hover:text-ink-primary dark:border-white/10 dark:bg-white/6'
                                }`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
                            <span>{meta.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Paginated Item Cards */}
            <div className="mt-3 space-y-2">
                {paginatedItems.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-black/15 bg-white/40 py-8 text-center text-xs font-medium text-ink-muted dark:border-white/15 dark:bg-white/5">
                        Tidak ada item yang cocok dengan filter.
                    </p>
                ) : (
                    paginatedItems.map((item) => (
                        <CatalogItemCard
                            key={item.id}
                            item={item}
                            usedCount={usageCounts.get(item.id) ?? 0}
                            onQuickSchedule={onQuickSchedule}
                            onDeleteCustom={item.isCustom ? onDeleteCustomItem : undefined}
                        />
                    ))
                )}
            </div>

            {/* Liquid Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-3.5 flex items-center justify-between border-t border-black/8 pt-3 dark:border-white/10">
                    <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="mf-liquid-pill min-h-8 px-3 text-xs disabled:pointer-events-none disabled:opacity-40"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Prev</span>
                    </button>
                    <span className="tabular-nums text-xs font-bold text-ink-secondary">
                        Hal {safePage} / {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="mf-liquid-pill min-h-8 px-3 text-xs disabled:pointer-events-none disabled:opacity-40"
                    >
                        <span>Next</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            <CustomItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddItem={onAddCustomItem}
            />
        </div>
    );
};