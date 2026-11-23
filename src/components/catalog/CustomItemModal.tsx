// src/components/catalog/CustomItemModal.tsx

import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { CATEGORY_LABELS } from '../../data/default-catalog';
import type { CatalogCategory, CatalogItem, ItemKind } from '../../types/meal';
import type { ConfirmDialogConfig } from '../ui/ConfirmDialog';

interface CustomItemModalProps {
    readonly isOpen: boolean;
    readonly editingItem: CatalogItem | null;
    readonly isOverridden?: boolean;
    readonly onClose: () => void;
    readonly onRequestConfirm: (config: ConfirmDialogConfig) => void;
    readonly onAddItem: (item: CatalogItem) => void;
    readonly onUpdateItem?: (
        itemId: string,
        patch: Partial<Omit<CatalogItem, 'id'>>,
    ) => void;
    readonly onResetItem?: (itemId: string) => void;
}

const FOOD_CATEGORIES: readonly CatalogCategory[] = [
    'staple-carb',
    'animal-protein',
    'plant-protein-veg',
    'pantry-seasoning',
];

const DRINK_CATEGORIES: readonly CatalogCategory[] = ['home-brew'];

export const CustomItemModal: React.FC<CustomItemModalProps> = ({
    isOpen,
    editingItem,
    isOverridden = false,
    onClose,
    onRequestConfirm,
    onAddItem,
    onUpdateItem,
    onResetItem,
}) => {
    const [name, setName] = useState('');
    const [kind, setKind] = useState<ItemKind>('food');
    const [category, setCategory] = useState<CatalogCategory>('staple-carb');
    const [consumptionUnit, setConsumptionUnit] = useState('1 porsi');
    const [packUnit, setPackUnit] = useState('1 Bungkus');
    const [packPrice, setPackPrice] = useState(15000);
    const [portionsPerPack, setPortionsPerPack] = useState(5);
    const [requiresCooking, setRequiresCooking] = useState(false);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        if (editingItem) {
            setName(editingItem.name);
            setKind(editingItem.kind);
            setCategory(editingItem.category);
            setConsumptionUnit(editingItem.consumptionUnit || '1 porsi');
            setPackUnit(editingItem.packUnit);
            setPackPrice(editingItem.packPrice);
            setPortionsPerPack(editingItem.portionsPerPack);
            setRequiresCooking(Boolean(editingItem.requiresCooking));
            setNote(editingItem.note ?? '');
        } else {
            setName('');
            setKind('food');
            setCategory('staple-carb');
            setConsumptionUnit('1 porsi');
            setPackUnit('1 Kemasan');
            setPackPrice(15000);
            setPortionsPerPack(5);
            setRequiresCooking(false);
            setNote('');
        }
    }, [isOpen, editingItem]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const availableCategories =
        kind === 'food' ? FOOD_CATEGORIES : DRINK_CATEGORIES;

    const handleKindChange = (nextKind: ItemKind) => {
        setKind(nextKind);
        const nextList =
            nextKind === 'food' ? FOOD_CATEGORIES : DRINK_CATEGORIES;
        if (!nextList.includes(category)) {
            setCategory(nextList[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cleanName = name.trim();
        if (!cleanName) return;

        const safePrice = Math.max(0, Math.round(packPrice));
        const safePortions = Math.max(1, Math.round(portionsPerPack));
        const cleanConsumption = consumptionUnit.trim() || '1 porsi';
        const cleanPackUnit = packUnit.trim() || '1 Kemasan';
        const cleanNote = note.trim() || undefined;

        if (editingItem && onUpdateItem) {
            onUpdateItem(editingItem.id, {
                name: cleanName,
                kind,
                category,
                consumptionUnit: cleanConsumption,
                packUnit: cleanPackUnit,
                packPrice: safePrice,
                portionsPerPack: safePortions,
                requiresCooking,
                note: cleanNote,
            });
            onClose();
            return;
        }

        const newItem: CatalogItem = {
            id: `custom-${Date.now().toString(36)}`,
            name: cleanName,
            kind,
            category,
            consumptionUnit: cleanConsumption,
            packUnit: cleanPackUnit,
            packPrice: safePrice,
            portionsPerPack: safePortions,
            requiresCooking,
            note: cleanNote,
            isCustom: true,
        };
        onAddItem(newItem);
        onClose();
    };

    const handleConfirmReset = () => {
        if (!editingItem || !onResetItem) return;
        onRequestConfirm({
            title: `Kembalikan "${editingItem.name}" ke Harga Awal?`,
            description:
                'Perubahan harga dan takaran pada item katalog bawaan ini akan dikembalikan seperti semula.',
            confirmLabel: 'Ya, Kembalikan',
            tone: 'primary',
            onConfirm: () => {
                onResetItem(editingItem.id);
                onClose();
            },
        });
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mf-custom-item-title"
            className="mf-modal-scrim"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <form onSubmit={handleSubmit} className="mf-modal-glass space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <span className="mf-eyebrow">Katalog Bahan Pokok</span>
                        <h3
                            id="mf-custom-item-title"
                            className="mt-0.5 text-base font-extrabold text-ink-primary"
                        >
                            {editingItem ? 'Ubah Bahan / Harga' : 'Tambah Bahan Pokok'}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup modal bahan"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-(--border-subtle) text-ink-secondary cursor-pointer hover:text-ink-primary focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Jenis & Kategori */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="mf-item-kind"
                            className="block text-xs font-bold text-ink-primary"
                        >
                            Jenis Item
                        </label>
                        <select
                            id="mf-item-kind"
                            value={kind}
                            onChange={(e) => handleKindChange(e.target.value as ItemKind)}
                            className="mt-1.5 h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3 text-xs font-bold text-ink-primary outline-hidden cursor-pointer focus:border-brand focus:ring-3 focus:ring-brand/20"
                        >
                            <option value="food">Makanan Pokok</option>
                            <option value="drink">Minuman Pokok</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="mf-item-category"
                            className="block text-xs font-bold text-ink-primary"
                        >
                            Kategori
                        </label>
                        <select
                            id="mf-item-category"
                            value={category}
                            onChange={(e) =>
                                setCategory(e.target.value as CatalogCategory)
                            }
                            className="mt-1.5 h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3 text-xs font-bold text-ink-primary outline-hidden cursor-pointer focus:border-brand focus:ring-3 focus:ring-brand/20"
                        >
                            {availableCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {CATEGORY_LABELS[cat]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Nama Bahan */}
                <div>
                    <label
                        htmlFor="mf-item-name"
                        className="block text-xs font-bold text-ink-primary"
                    >
                        Nama Bahan
                    </label>
                    <input
                        id="mf-item-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Ikan Tongkol Segar"
                        className="mt-1.5 h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3.5 text-xs font-semibold text-ink-primary placeholder:text-ink-muted outline-hidden focus:border-brand focus:ring-3 focus:ring-brand/20"
                    />
                </div>

                {/* Takaran Konsumsi & Kemasan Beli */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="mf-item-consumption-unit"
                            className="block text-xs font-bold text-ink-primary"
                        >
                            Takaran 1x Konsumsi
                        </label>
                        <input
                            id="mf-item-consumption-unit"
                            type="text"
                            required
                            value={consumptionUnit}
                            onChange={(e) => setConsumptionUnit(e.target.value)}
                            placeholder="Contoh: 1 potong sedang"
                            className="mt-1.5 h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3.5 text-xs font-semibold text-ink-primary placeholder:text-ink-muted outline-hidden focus:border-brand focus:ring-3 focus:ring-brand/20"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="mf-item-pack-unit"
                            className="block text-xs font-bold text-ink-primary"
                        >
                            Satuan Kemasan Pasar
                        </label>
                        <input
                            id="mf-item-pack-unit"
                            type="text"
                            required
                            value={packUnit}
                            onChange={(e) => setPackUnit(e.target.value)}
                            placeholder="Contoh: 1 Kg (±8 potong)"
                            className="mt-1.5 h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3.5 text-xs font-semibold text-ink-primary placeholder:text-ink-muted outline-hidden focus:border-brand focus:ring-3 focus:ring-brand/20"
                        />
                    </div>
                </div>

                {/* Harga Kemasan & Isi Takaran per Kemasan */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="mf-item-pack-price"
                            className="block text-xs font-bold text-ink-primary"
                        >
                            Harga Kemasan (Rp)
                        </label>
                        <input
                            id="mf-item-pack-price"
                            type="number"
                            min={0}
                            step={500}
                            required
                            value={packPrice}
                            onChange={(e) =>
                                setPackPrice(Number.parseInt(e.target.value, 10) || 0)
                            }
                            className="mt-1.5 h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3.5 tabular-nums text-xs font-bold text-ink-primary outline-hidden focus:border-brand focus:ring-3 focus:ring-brand/20"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="mf-item-portions-per-pack"
                            className="block text-xs font-bold text-ink-primary"
                        >
                            Isi Takaran / Kemasan
                        </label>
                        <input
                            id="mf-item-portions-per-pack"
                            type="number"
                            min={1}
                            max={500}
                            required
                            value={portionsPerPack}
                            onChange={(e) =>
                                setPortionsPerPack(
                                    Math.max(1, Number.parseInt(e.target.value, 10) || 1),
                                )
                            }
                            className="mt-1.5 h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3.5 tabular-nums text-xs font-bold text-ink-primary outline-hidden focus:border-brand focus:ring-3 focus:ring-brand/20"
                        />
                    </div>
                </div>

                {/* Opsi Perlu Dimasak & Catatan */}
                <label className="flex min-h-11 items-center gap-2.5 rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3.5 py-2 text-xs font-semibold text-ink-primary cursor-pointer">
                    <input
                        type="checkbox"
                        checked={requiresCooking}
                        onChange={(e) => setRequiresCooking(e.target.checked)}
                        className="h-4 w-4 rounded accent-brand"
                    />
                    <span>Bahan mentah yang perlu dimasak (dihitung ke sesi masak)</span>
                </label>

                <div>
                    <label
                        htmlFor="mf-item-note"
                        className="block text-xs font-bold text-ink-primary"
                    >
                        Catatan Penyimpanan / Takaran (Opsional)
                    </label>
                    <input
                        id="mf-item-note"
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Contoh: Simpan di freezer setelah dibersihkan"
                        className="mt-1.5 h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3.5 text-xs font-medium text-ink-primary placeholder:text-ink-muted outline-hidden focus:border-brand focus:ring-3 focus:ring-brand/20"
                    />
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--border-subtle) pt-3">
                    {editingItem && isOverridden && !editingItem.isCustom && onResetItem ? (
                        <button
                            type="button"
                            onClick={handleConfirmReset}
                            className="mf-liquid-pill h-11 px-3 text-xs font-bold text-ink-secondary cursor-pointer"
                        >
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Kembalikan Awal</span>
                        </button>
                    ) : (
                        <span />
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mf-liquid-pill h-11 px-4 text-xs font-bold cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            data-variant="primary"
                            className="mf-liquid-pill h-11 px-4 text-xs font-bold cursor-pointer"
                        >
                            {editingItem ? 'Simpan Perubahan' : 'Tambahkan Bahan'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};