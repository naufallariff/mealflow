// src/components/planner/MealBundleModal.tsx

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Utensils, X } from 'lucide-react';
import type {
    BundleComponent,
    CatalogItem,
    MealBundle,
} from '../../types/meal';
import { formatRupiah } from '../../utils/format';

interface MealBundleModalProps {
    readonly isOpen: boolean;
    readonly editingBundle: MealBundle | null;
    readonly catalog: readonly CatalogItem[];
    readonly catalogMap: ReadonlyMap<string, CatalogItem>;
    readonly onClose: () => void;
    readonly onSaveBundle: (
        id: string | null,
        name: string,
        components: readonly BundleComponent[],
    ) => void;
}

export const MealBundleModal: React.FC<MealBundleModalProps> = ({
    isOpen,
    editingBundle,
    catalog,
    catalogMap,
    onClose,
    onSaveBundle,
}) => {
    const [name, setName] = useState('');
    const [components, setComponents] = useState<BundleComponent[]>([]);
    const [selectedItemId, setSelectedItemId] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        if (editingBundle) {
            setName(editingBundle.name);
            setComponents(editingBundle.components.map((c) => ({ ...c })));
        } else {
            setName('');
            const defaultFirst = catalog[0]?.id ?? '';
            setComponents(defaultFirst ? [{ itemId: defaultFirst, portions: 1 }] : []);
        }
        setSelectedItemId(catalog[0]?.id ?? '');
    }, [isOpen, editingBundle, catalog]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const estimatedBundleCost = components.reduce((sum, comp) => {
        const item = catalogMap.get(comp.itemId);
        if (!item) return sum;
        const unitPrice = item.packPrice / Math.max(1, item.portionsPerPack);
        return sum + unitPrice * comp.portions;
    }, 0);

    const handleAddComponent = () => {
        if (!selectedItemId) return;
        setComponents((prev) => {
            const exists = prev.some((c) => c.itemId === selectedItemId);
            if (exists) {
                return prev.map((c) =>
                    c.itemId === selectedItemId
                        ? { ...c, portions: c.portions + 1 }
                        : c,
                );
            }
            return [...prev, { itemId: selectedItemId, portions: 1 }];
        });
    };

    const handleChangePortions = (itemId: string, portions: number) => {
        const safePortions = Math.max(0, Math.min(20, Math.round(portions)));
        if (safePortions === 0) {
            setComponents((prev) => prev.filter((c) => c.itemId !== itemId));
            return;
        }
        setComponents((prev) =>
            prev.map((c) =>
                c.itemId === itemId ? { ...c, portions: safePortions } : c,
            ),
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || components.length === 0) return;
        onSaveBundle(editingBundle?.id ?? null, name.trim(), components);
        onClose();
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mf-bundle-modal-title"
            className="mf-modal-scrim"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <form onSubmit={handleSubmit} className="mf-modal-glass space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-glass text-brand">
                            <Utensils className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                            <span className="mf-eyebrow">Paket Masakan Rumahan</span>
                            <h3
                                id="mf-bundle-modal-title"
                                className="text-sm font-extrabold text-ink-primary"
                            >
                                {editingBundle ? 'Edit Komposisi Paket' : 'Buat Paket Masakan Baru'}
                            </h3>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup editor paket masakan"
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-(--border-subtle) text-ink-secondary cursor-pointer hover:text-ink-primary focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Nama Paket */}
                <div>
                    <label
                        htmlFor="mf-bundle-name"
                        className="block text-xs font-bold text-ink-primary"
                    >
                        Nama Paket Masakan
                    </label>
                    <input
                        id="mf-bundle-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Nasi Goreng Telur + Teh"
                        className="mt-1.5 h-11 w-full rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3.5 text-xs font-semibold text-ink-primary placeholder:text-ink-muted outline-hidden focus:border-brand focus:ring-3 focus:ring-brand/20"
                    />
                </div>

                {/* Tambah Bahan ke Paket */}
                <div>
                    <label
                        htmlFor="mf-bundle-add-item"
                        className="block text-xs font-bold text-ink-primary"
                    >
                        Tambah Bahan Pokok ke Paket
                    </label>
                    <div className="mt-1.5 flex gap-2">
                        <select
                            id="mf-bundle-add-item"
                            value={selectedItemId}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                            className="h-11 min-w-0 flex-1 rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3 text-xs font-semibold text-ink-primary outline-hidden cursor-pointer focus:border-brand focus:ring-3 focus:ring-brand/20"
                        >
                            {catalog.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name} ({item.consumptionUnit})
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={handleAddComponent}
                            className="mf-liquid-pill h-11 shrink-0 px-3.5 text-xs font-bold cursor-pointer"
                        >
                            <Plus className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                            <span>Tambah</span>
                        </button>
                    </div>
                </div>

                {/* Daftar Komponen */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-ink-secondary">
                            Komposisi per 1x Masak
                        </span>
                        <span className="tabular-nums font-extrabold text-brand">
                            Estimasi {formatRupiah(estimatedBundleCost)} / porsi
                        </span>
                    </div>

                    {components.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-(--border-subtle) py-4 text-center text-xs text-ink-muted">
                            Pilih minimal satu bahan pokok di atas.
                        </p>
                    ) : (
                        <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                            {components.map((comp) => {
                                const item = catalogMap.get(comp.itemId);
                                if (!item) return null;
                                return (
                                    <li
                                        key={comp.itemId}
                                        className="flex items-center justify-between gap-2 rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) px-3 py-2"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-ink-primary">
                                                {item.name}
                                            </p>
                                            <p className="text-[11px] text-ink-muted">
                                                Satuan: {item.consumptionUnit}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number"
                                                min={1}
                                                max={20}
                                                value={comp.portions}
                                                aria-label={`Jumlah ${item.name} dalam paket`}
                                                onChange={(e) =>
                                                    handleChangePortions(
                                                        comp.itemId,
                                                        Number.parseInt(e.target.value, 10) || 0,
                                                    )
                                                }
                                                className="h-10 w-14 rounded-lg border border-(--border-subtle) bg-(--glass-card) text-center tabular-nums text-xs font-extrabold text-ink-primary outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/20"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleChangePortions(comp.itemId, 0)}
                                                aria-label={`Hapus ${item.name} dari paket`}
                                                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-muted transition-colors cursor-pointer hover:bg-rose-500/10 hover:text-rose-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-(--border-subtle) pt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="mf-liquid-pill h-11 px-4 text-xs font-bold cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={!name.trim() || components.length === 0}
                        data-variant="primary"
                        className="mf-liquid-pill h-11 px-4 text-xs font-bold cursor-pointer disabled:pointer-events-none disabled:opacity-45"
                    >
                        Simpan Paket Masakan
                    </button>
                </div>
            </form>
        </div>
    );
};