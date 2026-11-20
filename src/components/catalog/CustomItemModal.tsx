// src/components/catalog/CustomItemModal.tsx

import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import type { CatalogCategory, CatalogItem, ItemKind } from '../../types/meal';

interface CustomItemModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onAddItem: (newItem: CatalogItem) => void;
}

export const CustomItemModal: React.FC<CustomItemModalProps> = ({
    isOpen,
    onClose,
    onAddItem,
}) => {
    const [name, setName] = useState('');
    const [kind, setKind] = useState<ItemKind>('food');
    const [category, setCategory] = useState<CatalogCategory>('street-food');
    const [packUnit, setPackUnit] = useState('1 Porsi');
    const [packPrice, setPackPrice] = useState('15000');
    const [portionsPerPack, setPortionsPerPack] = useState('1');

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleKindChange = (nextKind: ItemKind) => {
        setKind(nextKind);
        setCategory(nextKind === 'food' ? 'street-food' : 'home-brew');
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

        onAddItem({
            id: `custom-${Date.now()}`,
            name: trimmedName,
            kind,
            category,
            packUnit: packUnit.trim() || '1 Unit',
            packPrice: parsedPrice,
            portionsPerPack: parsedPortions,
            isCustom: true,
        });

        setName('');
        setPackPrice('15000');
        setPortionsPerPack('1');
        onClose();
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-item-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            className="mf-modal-scrim items-end p-0 sm:items-center sm:p-4"
        >
            <div className="mf-modal-glass rounded-b-none sm:rounded-[1.5rem]">
                {/* Mobile Sheet Drag Handle */}
                <div
                    aria-hidden="true"
                    className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-400/40 sm:hidden"
                />

                <div className="flex items-start justify-between gap-2">
                    <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-berry-glass px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-berry-fg uppercase">
                            <Sparkles className="h-3 w-3" />
                            Katalog Kustom
                        </span>
                        <h3
                            id="custom-item-title"
                            className="mt-1.5 text-base font-extrabold tracking-tight text-ink-primary"
                        >
                            Tambah Item Katalog Sendiri
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-ink-secondary transition-transform duration-150 hover:bg-white active:scale-90 dark:border-white/15 dark:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                    {/* Kind Segmented Pill */}
                    <div className="grid grid-cols-2 gap-1 rounded-full border border-black/8 bg-white/50 p-1 backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                        {(['food', 'drink'] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleKindChange(option)}
                                className={`rounded-full py-1.5 text-xs font-bold transition-all duration-150 ${kind === option
                                        ? 'bg-white text-ink-primary shadow-xs dark:bg-white/15'
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
                            placeholder="Contoh: Nasi Gila / Ikan Patin 1 Kg"
                            className="mt-1.5 h-10.5 w-full rounded-2xl border border-black/10 bg-white/75 px-3.5 text-sm font-medium text-ink-primary placeholder:text-ink-muted outline-none transition-all focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 dark:border-white/15 dark:bg-white/10"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="custom-item-category"
                            className="block text-xs font-semibold text-ink-secondary"
                        >
                            Kategori
                        </label>
                        <select
                            id="custom-item-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as CatalogCategory)}
                            className="mt-1.5 h-10.5 w-full rounded-2xl border border-black/10 bg-white/75 px-3.5 text-sm font-semibold text-ink-primary outline-none transition-all focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 dark:border-white/15 dark:bg-white/10"
                        >
                            {kind === 'food' ? (
                                <>
                                    <option value="raw-ingredient" className="text-slate-900">
                                        Bahan Mentah
                                    </option>
                                    <option value="seasoning-pantry" className="text-slate-900">
                                        Bumbu & Pantry
                                    </option>
                                    <option value="street-food" className="text-slate-900">
                                        Warung & Kaki Lima
                                    </option>
                                    <option value="fancy-mall" className="text-slate-900">
                                        Fancy & Mall
                                    </option>
                                </>
                            ) : (
                                <>
                                    <option value="home-brew" className="text-slate-900">
                                        Seduh Sendiri
                                    </option>
                                    <option value="street-drink" className="text-slate-900">
                                        Warung & Gerobak
                                    </option>
                                    <option value="cafe-mall" className="text-slate-900">
                                        Cafe & Mall
                                    </option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
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
                                className="mt-1.5 h-10.5 w-full rounded-2xl border border-black/10 bg-white/75 px-3 text-xs font-semibold text-ink-primary outline-none focus:border-brand focus:bg-white dark:border-white/15 dark:bg-white/10"
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
                                className="tabular-nums mt-1.5 h-10.5 w-full rounded-2xl border border-black/10 bg-white/75 px-3 text-xs font-bold text-ink-primary outline-none focus:border-brand focus:bg-white dark:border-white/15 dark:bg-white/10"
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
                                className="tabular-nums mt-1.5 h-10.5 w-full rounded-2xl border border-black/10 bg-white/75 px-3 text-xs font-bold text-ink-primary outline-none focus:border-brand focus:bg-white dark:border-white/15 dark:bg-white/10"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        data-variant="primary"
                        className="mf-liquid-pill mt-2 h-11.5 w-full text-sm font-bold"
                    >
                        Simpan ke Katalog
                    </button>
                </form>
            </div>
        </div>
    );
};