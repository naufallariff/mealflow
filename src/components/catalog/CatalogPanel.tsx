// src/components/catalog/CatalogPanel.tsx

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
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
        <aside className="flex flex-col rounded-2xl border border-[#E5E5EA] bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
                <div>
                    <h2 className="text-sm font-semibold text-[#1C1C1E]">Katalog Puzzle</h2>
                    <p className="text-[11px] text-[#636366]">{filteredItems.length} item tersedia</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex min-h-8.5 items-center gap-1 rounded-xl bg-[#007AFF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0066D6] active:scale-[0.97]"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Item</span>
                </button>
            </div>

            {/* Food vs Drink Segmented Control */}
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-[#F2F2F7] p-1">
                <button
                    type="button"
                    onClick={() => handleSwitchKind('food')}
                    className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${activeKind === 'food'
                            ? 'bg-white text-[#1C1C1E] shadow-2xs'
                            : 'text-[#636366]'
                        }`}
                >
                    Makanan ({items.filter((i) => i.kind === 'food').length})
                </button>
                <button
                    type="button"
                    onClick={() => handleSwitchKind('drink')}
                    className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${activeKind === 'drink'
                            ? 'bg-white text-[#1C1C1E] shadow-2xs'
                            : 'text-[#636366]'
                        }`}
                >
                    Minuman ({items.filter((i) => i.kind === 'drink').length})
                </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-2.5">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#8E8E93]" />
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
                    className="h-9 w-full rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] pr-3 pl-8 text-xs text-[#1C1C1E] outline-none focus:border-[#007AFF] focus:bg-white"
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
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${selectedCategory === 'all'
                            ? 'bg-[#1C1C1E] text-white'
                            : 'bg-[#F2F2F7] text-[#636366] hover:text-[#1C1C1E]'
                        }`}
                >
                    Semua
                </button>
                {categoryOptions.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => {
                            setSelectedCategory(cat);
                            setPage(1);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${selectedCategory === cat
                                ? 'bg-[#1C1C1E] text-white'
                                : 'bg-[#F2F2F7] text-[#636366] hover:text-[#1C1C1E]'
                            }`}
                    >
                        {CATEGORY_META[cat].label}
                    </button>
                ))}
            </div>

            {/* Paginated Item Cards */}
            <div className="mt-3 space-y-2">
                {paginatedItems.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[#D1D1D6] py-8 text-center text-xs text-[#8E8E93]">
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between border-t border-[#E5E5EA] pt-2.5">
                    <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E5E5EA] bg-[#F8F9FB] px-2.5 text-xs font-medium text-[#1C1C1E] disabled:opacity-40"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Prev</span>
                    </button>
                    <span className="tabular-nums text-xs text-[#636366]">
                        Hal {safePage} / {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#E5E5EA] bg-[#F8F9FB] px-2.5 text-xs font-medium text-[#1C1C1E] disabled:opacity-40"
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
        </aside>
    );
};