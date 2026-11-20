// src/components/catalog/CatalogPanel.tsx

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Layers, Plus, Search } from 'lucide-react';
import type { CatalogCategory, CatalogItem, ItemKind } from '../../types/meal';
import { CATEGORY_META } from '../../data/default-catalog';
import { useDebouncedValue } from '../../hooks/use-debounced-value';
import type { ConfirmDialogConfig } from '../ui/ConfirmDialog';
import { CatalogItemCard } from './CatalogItemCard';
import { CustomItemModal } from './CustomItemModal';

interface CatalogPanelProps {
    readonly items: readonly CatalogItem[];
    readonly usageCounts: ReadonlyMap<string, number>;
    readonly overriddenIds?: ReadonlySet<string>;
    readonly onRequestConfirm: (config: ConfirmDialogConfig) => void;
    readonly onQuickSchedule: (item: CatalogItem) => void;
    readonly onAddCustomItem: (item: CatalogItem) => void;
    readonly onUpdateCatalogItem?: (
        itemId: string,
        patch: Partial<Omit<CatalogItem, 'id'>>,
    ) => void;
    readonly onResetCatalogItem?: (itemId: string) => void;
    readonly onDeleteCustomItem: (itemId: string) => void;
}

const ITEMS_PER_PAGE = 9;

export const CatalogPanel: React.FC<CatalogPanelProps> = ({
    items,
    usageCounts,
    overriddenIds,
    onRequestConfirm,
    onQuickSchedule,
    onAddCustomItem,
    onUpdateCatalogItem,
    onResetCatalogItem,
    onDeleteCustomItem,
}) => {
    const [activeKind, setActiveKind] = useState<ItemKind>('food');
    const [selectedCategory, setSelectedCategory] = useState<'all' | CatalogCategory>('all');
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

    const debouncedQuery = useDebouncedValue(searchText.trim().toLowerCase(), 200);

    const { foodCount, drinkCount } = useMemo(() => {
        let food = 0;
        let drink = 0;
        for (const item of items) {
            if (item.kind === 'food') food += 1;
            else drink += 1;
        }
        return { foodCount: food, drinkCount: drink };
    }, [items]);

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

    const handleOpenCreate = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: CatalogItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = (itemId: string) => {
        const target = items.find((i) => i.id === itemId);
        onRequestConfirm({
            title: 'Hapus Item dari Katalog?',
            description: target
                ? `Item "${target.name}" akan dihapus dari katalog dan jadwal yang menggunakannya.`
                : 'Item ini akan dihapus dari katalog.',
            confirmLabel: 'Ya, Hapus',
            tone: 'danger',
            onConfirm: () => onDeleteCustomItem(itemId),
        });
    };

    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-brand-glass text-brand">
                        <Layers className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-extrabold tracking-tight text-ink-primary">
                            Katalog Bahan & Menu
                        </h2>
                        <p className="tabular-nums text-[11px] font-medium text-ink-muted">
                            {filteredItems.length} item tersedia
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    data-variant="primary"
                    className="mf-liquid-pill h-8.5 px-3 text-xs"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah</span>
                </button>
            </div>

            {/* Food vs Drink Segmented Control */}
            <div className="mt-4 grid grid-cols-2 gap-1 rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) p-1">
                <button
                    type="button"
                    onClick={() => handleSwitchKind('food')}
                    className={`rounded-full py-1.5 text-xs font-bold transition-colors duration-150 ${activeKind === 'food'
                            ? 'bg-(--glass-card) text-ink-primary shadow-2xs'
                            : 'text-ink-secondary hover:text-ink-primary'
                        }`}
                >
                    Makanan ({foodCount})
                </button>
                <button
                    type="button"
                    onClick={() => handleSwitchKind('drink')}
                    className={`rounded-full py-1.5 text-xs font-bold transition-colors duration-150 ${activeKind === 'drink'
                            ? 'bg-(--glass-card) text-ink-primary shadow-2xs'
                            : 'text-ink-secondary hover:text-ink-primary'
                        }`}
                >
                    Minuman ({drinkCount})
                </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-3.5">
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
                            ? 'Cari bahan atau menu makanan...'
                            : 'Cari bahan atau menu minuman...'
                    }
                    className="h-9.5 w-full rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) pr-3.5 pl-9 text-xs font-medium text-ink-primary placeholder:text-ink-muted outline-none transition-colors focus:border-brand focus:bg-(--glass-card) focus:ring-2 focus:ring-brand/20"
                />
            </div>

            {/* Symmetrical 2-Column Category Grid with Generous Breathing Room */}
            <div className="mt-3.5 grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => {
                        setSelectedCategory('all');
                        setPage(1);
                    }}
                    className={`${activeKind === 'food' ? 'col-span-2' : ''
                        } flex h-9 items-center justify-center rounded-xl px-3 text-[11px] font-bold transition-colors duration-150 active:scale-97 ${selectedCategory === 'all'
                            ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                            : 'border border-(--border-subtle) bg-(--glass-card-subtle) text-ink-secondary hover:text-ink-primary'
                        }`}
                >
                    Semua Kategori
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
                            className={`flex h-9 items-center justify-center gap-1.5 rounded-xl px-2.5 text-[11px] font-bold transition-colors duration-150 active:scale-97 ${isSelected
                                    ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                                    : 'border border-(--border-subtle) bg-(--glass-card-subtle) text-ink-secondary hover:text-ink-primary'
                                }`}
                        >
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dotColor}`} />
                            <span className="truncate">{meta.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Paginated Item Cards */}
            <div className="mt-4 space-y-2.5 border-t border-(--border-subtle) pt-3.5">
                {paginatedItems.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-(--border-subtle) bg-(--glass-card-subtle) py-8 text-center text-xs font-medium text-ink-muted">
                        Tidak ada item yang sesuai dengan pencarian.
                    </p>
                ) : (
                    paginatedItems.map((item) => (
                        <CatalogItemCard
                            key={item.id}
                            item={item}
                            usedCount={usageCounts.get(item.id) ?? 0}
                            isOverridden={overriddenIds?.has(item.id)}
                            onQuickSchedule={onQuickSchedule}
                            onEditItem={onUpdateCatalogItem ? handleOpenEdit : undefined}
                            onDeleteCustom={item.isCustom ? handleConfirmDelete : undefined}
                        />
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-(--border-subtle) pt-3">
                    <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="mf-liquid-pill h-8 px-3 text-xs disabled:pointer-events-none disabled:opacity-40"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        <span>Sebelumnya</span>
                    </button>
                    <span className="tabular-nums text-xs font-bold text-ink-secondary">
                        {safePage} / {totalPages}
                    </span>
                    <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="mf-liquid-pill h-8 px-3 text-xs disabled:pointer-events-none disabled:opacity-40"
                    >
                        <span>Berikutnya</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            <CustomItemModal
                isOpen={isModalOpen}
                editingItem={editingItem}
                isOverridden={editingItem ? overriddenIds?.has(editingItem.id) : false}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                }}
                onRequestConfirm={onRequestConfirm}
                onAddItem={onAddCustomItem}
                onUpdateItem={onUpdateCatalogItem}
                onResetItem={onResetCatalogItem}
            />
        </div>
    );
};