// src/components/layout/FloatingGuideWidget.tsx

import React, { useEffect, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export const FloatingGuideWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Buka panduan singkat Mealflow"
                className="mf-guide-peek focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
            >
                <HelpCircle className="h-4 w-4 text-brand" aria-hidden="true" />
                <span className="text-xs font-bold">Panduan</span>
            </button>

            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mf-guide-title"
                    className="mf-modal-scrim"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsOpen(false);
                    }}
                >
                    <div className="mf-modal-glass space-y-4">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <span className="mf-eyebrow">Cara Kerja Mealflow</span>
                                <h3
                                    id="mf-guide-title"
                                    className="mt-0.5 text-base font-extrabold text-ink-primary"
                                >
                                    Hitung Belanja Pokok Bulanan
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Tutup panduan"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-(--border-subtle) text-ink-secondary hover:text-ink-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>

                        <ol className="space-y-2.5 text-xs leading-relaxed text-ink-secondary">
                            <li className="rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) p-3">
                                <strong className="block font-bold text-ink-primary">
                                    1. Hitung dari Takaran Makan
                                </strong>
                                Pilih bahan pokok di katalog sesuai takaran konsumsi harian (butir, potong,
                                porsi). Harga satuan dihitung otomatis dari kemasan pasar.
                            </li>
                            <li className="rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) p-3">
                                <strong className="block font-bold text-ink-primary">
                                    2. Pembulatan Kemasan Utuh & Sisa Stok
                                </strong>
                                Daftar Belanja membulatkan kebutuhan porsi menjadi kemasan ritel utuh dan
                                menampilkan sisa porsi agar tidak mubazir.
                            </li>
                            <li className="rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) p-3">
                                <strong className="block font-bold text-ink-primary">
                                    3. Kalender 31 Hari (Opsional)
                                </strong>
                                Gunakan jadwal M1–M5 jika ingin membagi porsi ke waktu makan Pagi, Siang, dan
                                Malam. Data tersimpan otomatis di perangkat Anda.
                            </li>
                        </ol>

                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            data-variant="primary"
                            className="mf-liquid-pill h-9.5 w-full text-xs"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};