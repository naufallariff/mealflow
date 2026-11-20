// src/components/catalog/CustomItemModal.tsx

import React, { useState } from 'react';
import { X } from 'lucide-react';
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

    if (!isOpen) return null;

    const handleKindChange = (nextKind: ItemKind) => {
        setKind(nextKind);
        setCategory(nextKind === 'food' ? 'street-food' : 'home-brew');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const parsedPrice = Math.max(500, Number(packPrice.replace(/\D/g, '')) || 0);
        const parsedPortions = Math.max(1, Math.min(100, Number(portionsPerPack) || 1));

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
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
        >
            <div className="w-full max-w-md rounded-t-3xl border border-[#E5E5EA] bg-white p-5 shadow-xl sm:rounded-2xl">
                <div className="flex items-center justify-between">
                    <h3 id="custom-item-title" className="text-base font-semibold text-[#1C1C1E]">
                        Tambah Item Katalog Sendiri
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] text-[#636366]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F2F2F7] p-1">
                        {(['food', 'drink'] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => handleKindChange(option)}
                                className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${kind === option
                                        ? 'bg-white text-[#1C1C1E] shadow-2xs'
                                        : 'text-[#636366]'
                                    }`}
                            >
                                {option === 'food' ? 'Makanan' : 'Minuman'}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[#636366]">Nama Item</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Nasi Gila / Ikan Patin 1 Kg"
                            className="mt-1 h-10 w-full rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-3 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF] focus:bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[#636366]">Kategori</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as CatalogCategory)}
                            className="mt-1 h-10 w-full rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-3 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
                        >
                            {kind === 'food' ? (
                                <>
                                    <option value="raw-ingredient">Bahan Mentah</option>
                                    <option value="seasoning-pantry">Bumbu & Pantry</option>
                                    <option value="street-food">Warung & Kaki Lima</option>
                                    <option value="fancy-mall">Fancy & Mall</option>
                                </>
                            ) : (
                                <>
                                    <option value="home-brew">Seduh Sendiri</option>
                                    <option value="street-drink">Warung & Gerobak</option>
                                    <option value="cafe-mall">Cafe & Mall</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-xs font-medium text-[#636366]">Satuan Beli</label>
                            <input
                                type="text"
                                value={packUnit}
                                onChange={(e) => setPackUnit(e.target.value)}
                                placeholder="1 Kg / 1 Porsi"
                                className="mt-1 h-10 w-full rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-2.5 text-xs text-[#1C1C1E] outline-none focus:border-[#007AFF]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#636366]">Harga (Rp)</label>
                            <input
                                type="number"
                                min={500}
                                step={500}
                                required
                                value={packPrice}
                                onChange={(e) => setPackPrice(e.target.value)}
                                className="tabular-nums mt-1 h-10 w-full rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-2.5 text-xs text-[#1C1C1E] outline-none focus:border-[#007AFF]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-[#636366]">Jadi Porsi</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                required
                                value={portionsPerPack}
                                onChange={(e) => setPortionsPerPack(e.target.value)}
                                className="tabular-nums mt-1 h-10 w-full rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-2.5 text-xs text-[#1C1C1E] outline-none focus:border-[#007AFF]"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-2 h-11 w-full rounded-xl bg-[#007AFF] text-sm font-semibold text-white shadow-xs hover:bg-[#0066D6] active:scale-[0.98]"
                    >
                        Simpan ke Katalog
                    </button>
                </form>
            </div>
        </div>
    );
};