// src/components/planner/InteractiveEmptyState.tsx

import React from 'react';
import { ArrowRight, Home, User } from 'lucide-react';
import type { ConfirmDialogConfig } from '../ui/ConfirmDialog';

export interface QuickStartTemplate {
    readonly id: string;
    readonly title: string;
    readonly subtitle: string;
    readonly icon: 'kos' | 'household';
    readonly portions: Readonly<Record<string, number>>;
}

const STARTER_TEMPLATES: readonly QuickStartTemplate[] = [
    {
        id: 'starter-anak-kos',
        title: 'Pola Hemat Anak Kos (1 Orang)',
        subtitle:
            'Fokus beras, telur ayam, tempe, tahu, sayur harian, serta teh dan air minum tanpa risiko stok busuk.',
        icon: 'kos',
        portions: {
            'beras-putih': 45,
            'telur-ayam': 30,
            'tempe-papan': 16,
            'tahu-putih': 16,
            'sayur-harian': 20,
            'ayam-potong': 10,
            'air-galon': 60,
        },
    },
    {
        id: 'starter-rumah-tangga',
        title: 'Pola Dapur Harian (2 Orang)',
        subtitle:
            'Kombinasi karbohidrat pokok, lauk protein hewani dan nabati bergantian, serta sayuran segar sebulan.',
        icon: 'household',
        portions: {
            'beras-putih': 90,
            'telur-ayam': 45,
            'ayam-potong': 24,
            'ikan-lele': 12,
            'tempe-papan': 24,
            'tahu-putih': 24,
            'sayur-harian': 40,
            'air-galon': 120,
        },
    },
];

interface InteractiveEmptyStateProps {
    readonly onApplyTemplate: (portions: Readonly<Record<string, number>>) => void;
    readonly onFocusPlanner: () => void;
    readonly onRequestConfirm?: (config: ConfirmDialogConfig) => void;
}

export const InteractiveEmptyState: React.FC<InteractiveEmptyStateProps> = ({
    onApplyTemplate,
    onFocusPlanner,
    onRequestConfirm,
}) => {
    const handleSelectTemplate = (tpl: QuickStartTemplate) => {
        const applyNow = () => onApplyTemplate(tpl.portions);

        if (!onRequestConfirm) {
            applyNow();
            return;
        }

        onRequestConfirm({
            title: `Terapkan ${tpl.title}?`,
            description:
                'Porsi bulanan pada bahan pokok yang ada di pola ini akan diisi otomatis. Rencana yang sudah Anda susun bisa ikut berubah.',
            confirmLabel: 'Ya, Gunakan Pola',
            tone: 'primary',
            onConfirm: applyNow,
        });
    };

    return (
        <section
            aria-label="Mulai perencanaan belanja bulanan"
            className="rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) p-4 sm:p-5"
        >
            <div className="max-w-prose">
                <span className="mf-eyebrow">Mulai Hitung Anggaran</span>
                <h3 className="mt-1 text-base font-extrabold tracking-tight text-ink-primary">
                    Pilih Pola Awal atau Isi Frekuensi Makan Sendiri
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                    Cukup tentukan berapa kali bahan dikonsumsi dalam 31 hari. Mealflow
                    otomatis menghitung pembulatan kemasan pasar dan sisa stok akhir bulan.
                </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                {STARTER_TEMPLATES.map((tpl) => {
                    const totalPortions = Object.values(tpl.portions).reduce(
                        (acc, val) => acc + val,
                        0,
                    );
                    return (
                        <button
                            key={tpl.id}
                            type="button"
                            onClick={() => handleSelectTemplate(tpl)}
                            className="group flex flex-col justify-between rounded-2xl border border-(--border-subtle) bg-(--glass-card) p-4 text-left transition-transform duration-150 cursor-pointer hover:border-brand focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 active:scale-99"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-glass text-brand">
                                        {tpl.icon === 'kos' ? (
                                            <User className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <Home className="h-4 w-4" aria-hidden="true" />
                                        )}
                                    </div>
                                    <span className="tabular-nums rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) px-2.5 py-0.5 text-[11px] font-bold text-ink-secondary">
                                        {totalPortions} total takaran
                                    </span>
                                </div>

                                <h4 className="mt-3 text-sm font-extrabold text-ink-primary">
                                    {tpl.title}
                                </h4>
                                <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                                    {tpl.subtitle}
                                </p>
                            </div>

                            <div className="mt-4 flex items-center gap-1.5 text-xs font-extrabold text-brand">
                                <span>Gunakan Pola Ini</span>
                                <ArrowRight
                                    className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                                    aria-hidden="true"
                                />
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-(--border-subtle) pt-3 text-xs text-ink-secondary">
                <span>Ingin menyusun dari nol per bahan pokok?</span>
                <button
                    type="button"
                    onClick={onFocusPlanner}
                    className="mf-liquid-pill min-h-11 px-3.5 text-xs font-bold cursor-pointer"
                >
                    Isi Tabel Frekuensi di Bawah
                </button>
            </div>
        </section>
    );
};