// src/components/catalog/CustomItemModal.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, Sparkles, X } from 'lucide-react';
import type { CatalogCategory, CatalogItem, ItemKind } from '../../types/meal';
import { CATEGORY_META } from '../../data/default-catalog';
import { CustomSelect } from '../ui/CustomSelect';
import type { ConfirmDialogConfig } from '../ui/ConfirmDialog';

interface CustomItemModalProps {
    readonly isOpen: boolean;
    readonly editingItem?: CatalogItem | null;
    readonly isOverridden?: boolean;
    readonly onClose: () => void;
    readonly onRequestConfirm: (config: ConfirmDialogConfig) => void;
    readonly onAddItem: (newItem: CatalogItem) => void;
    readonly onUpdateItem?: (
        itemId: string,
        patch: Partial<Omit<CatalogItem, 'id'>>,
    ) => void;
    readonly onResetItem?: (itemId: string) => void;
}

const FOOD_CATEGORIES: readonly CatalogCategory[] = [
    'raw-ingredient',
    'seasoning-pantry',
    'street-food',
    'fancy-mall',
];

const DRINK_CATEGORIES: readonly CatalogCategory[] = [
    'home-brew',
    'street-drink',
    'cafe-mall',
];

export const CustomItemModal: React.FC<CustomItemModalProps> = ({
    isOpen,
    editingItem = null,
    isOverridden = false,
    onClose,
    onRequestConfirm,
    onAddItem,
    onUpdateItem,
    onResetItem,
}) => {
    const [name, setName] = useState('');
    const [kind, setKind] = useState<ItemKind>('food');
    const [category, setCategory] = useState<CatalogCategory>('raw-ingredient');
    const [packUnit, setPackUnit] = useState('1 Porsi');
    const [packPrice, setPackPrice] = useState('15000');
    const [portionsPerPack, setPortionsPerPack] = useState('1');

    useEffect(() => {
        if (!isOpen) return;

        if (editingItem) {
            setName(editingItem.name);
            setKind(editingItem.kind);
            setCategory(editingItem.category);
            setPackUnit(editingItem.packUnit);
            setPackPrice(String(editingItem.packPrice));
            setPortionsPerPack(String(editingItem.portionsPerPack));
        } else {
            setName('');
            setKind('food');
            setCategory('raw-ingredient');
            setPackUnit('1 Porsi');
            setPackPrice('15000');
            setPortionsPerPack('1');
        }
    }, [isOpen, editingItem]);

    const categoryOptions = useMemo(() => {
        const list = kind === 'food' ? FOOD_CATEGORIES : DRINK_CATEGORIES;
        return list.map((cat) => ({
            value: cat,
            label: CATEGORY_META[cat].label,
            dotColor: CATEGORY_META[cat].dotColor,
        }));
    }, [kind]);

    if (!isOpen || typeof document === 'undefined') return null;

    const handleKindChange = (nextKind: ItemKind) => {
        setKind(nextKind);
        setCategory(nextKind === 'food' ? 'raw-ingredient' : 'home-brew');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const parsedPrice = Math.max(500, Number(packPrice.replace(/\D/g, '')) || 0);
        const parsedPortions = Math.max(
            1,
            Math.min(100, Number(portionsPerPack) || 1),
        );

        if (!trimmedName) return;

        const isEditing = Boolean(editingItem);

        onRequestConfirm({
            title: isEditing ? 'Simpan Perubahan Item?' : 'Simpan Item ke Katalog?',
            description: isEditing
                ? `Perubahan harga dan porsi untuk "${trimmedName}" akan langsung memperbarui perhitungan jadwal dan daftar belanja.`
                : `Item "${trimmedName}" akan ditambahkan ke daftar katalog Anda.`,
            confirmLabel: isEditing ? 'Ya, Simpan' : 'Ya, Tambahkan',
            tone: 'primary',
            onConfirm: () => {
                if (editingItem && onUpdateItem) {
                    onUpdateItem(editingItem.id, {
                        name: trimmedName,
                        kind,
                        category,
                        packUnit: packUnit.trim() || '1 Unit',
                        packPrice: parsedPrice,
                        portionsPerPack: parsedPortions,
                    });
                } else {
                    onAddItem({
                        id: `custom-${Date.now().toString(36)}`,
                        name: trimmedName,
                        kind,
                        category,
                        packUnit: packUnit.trim() || '1 Unit',
                        packPrice: parsedPrice,
                        portionsPerPack: parsedPortions,
                        isCustom: true,
                    });
                }
                onClose();
            },
        });
    };

    const isEditing = Boolean(editingItem);

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-item-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            className="mf-modal-scrim items-end p-0 sm:items-center sm:p-4"
        >
            <div className="mf-modal-glass overflow-visible rounded-b-none sm:rounded-3xl">
                <div
                    aria-hidden="true"
                    className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-400/40 sm:hidden"
                />

                <div className="flex items-start justify-between gap-2">
                    <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-glass px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-brand uppercase">
                            <Sparkles className="h-3 w-3" />
                            {isEditing ? 'Sesuaikan Item' : 'Item Kustom'}
                        </span>
                        <h3
                            id="custom-item-title"
                            className="mt-1.5 text-base font-extrabold tracking-tight text-ink-primary"
                        >
                            {isEditing ? 'Ubah Harga & Porsi Item' : 'Tambah Item Katalog'}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) text-ink-secondary transition-transform duration-150 hover:text-ink-primary active:scale-90"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-1 rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) p-1">
                        {(['food', 'drink'] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleKindChange(option)}
                                className={`rounded-full py-1.5 text-xs font-bold transition-colors duration-150 ${kind === option
                                        ? 'bg-(--glass-card) text-ink-primary shadow-2xs'
                                        : 'text-ink-secondary hover:text-ink-primary'
                                    }`}
                            >
                                {option === 'food' ? 'Makanan' : 'Minuman'}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label
                            htmlFor="custom-item-name"
                            className="block text-xs font-semibold text-ink-secondary"
                        >
                            Nama Item
                        </label>
                        <input
                            id="custom-item-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Dada Ayam Fillet 1 Kg"
                            className="mt-1.5 h-11 w-full rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3.5 text-sm font-medium text-ink-primary placeholder:text-ink-muted outline-none transition-colors focus:border-brand focus:bg-(--glass-card) focus:ring-2 focus:ring-brand/20"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="custom-item-category"
                            className="mb-1.5 block text-xs font-semibold text-ink-secondary"
                        >
                            Kategori
                        </label>
                        <CustomSelect
                            id="custom-item-category"
                            value={category}
                            options={categoryOptions}
                            onChange={setCategory}
                            ariaLabel="Pilih kategori item"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                        <div>
                            <label
                                htmlFor="custom-item-unit"
                                className="block text-xs font-semibold text-ink-secondary"
                            >
                                Satuan Beli
                            </label>
                            <input
                                id="custom-item-unit"
                                type="text"
                                value={packUnit}
                                onChange={(e) => setPackUnit(e.target.value)}
                                placeholder="1 Kg / 1 Porsi"
                                className="mt-1.5 h-11 w-full rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3 text-xs font-semibold text-ink-primary outline-none focus:border-brand focus:bg-(--glass-card)"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="custom-item-price"
                                className="block text-xs font-semibold text-ink-secondary"
                            >
                                Harga (Rp)
                            </label>
                            <input
                                id="custom-item-price"
                                type="number"
                                min={500}
                                step={500}
                                required
                                value={packPrice}
                                onChange={(e) => setPackPrice(e.target.value)}
                                className="tabular-nums mt-1.5 h-11 w-full rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3 text-xs font-bold text-ink-primary outline-none focus:border-brand focus:bg-(--glass-card)"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="custom-item-portions"
                                className="block text-xs font-semibold text-ink-secondary"
                            >
                                Jadi Porsi
                            </label>
                            <input
                                id="custom-item-portions"
                                type="number"
                                min={1}
                                max={100}
                                required
                                value={portionsPerPack}
                                onChange={(e) => setPortionsPerPack(e.target.value)}
                                className="tabular-nums mt-1.5 h-11 w-full rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3 text-xs font-bold text-ink-primary outline-none focus:border-brand focus:bg-(--glass-card)"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        {isEditing && isOverridden && editingItem && onResetItem && (
                            <button
                                type="button"
                                onClick={() =>
                                    onRequestConfirm({
                                        title: 'Kembalikan ke Pengaturan Awal?',
                                        description: `Harga dan porsi "${editingItem.name}" akan dikembalikan ke nilai bawaan katalog.`,
                                        confirmLabel: 'Ya, Kembalikan',
                                        tone: 'danger',
                                        onConfirm: () => {
                                            onResetItem(editingItem.id);
                                            onClose();
                                        },
                                    })
                                }
                                className="mf-liquid-pill h-11.5 px-3.5 text-xs font-bold"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Reset Awal</span>
                            </button>
                        )}
                        <button
                            type="submit"
                            data-variant="primary"
                            className="mf-liquid-pill h-11.5 flex-1 text-sm font-bold"
                        >
                            {isEditing ? 'Simpan Perubahan' : 'Simpan ke Katalog'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
};