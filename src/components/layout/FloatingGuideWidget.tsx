// src/components/layout/FloatingGuideWidget.tsx

import React, { useEffect, useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export const FloatingGuideWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen]);

    return (
        <>
            {/* Peek Edge Tab at Bottom-Right */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-label="Buka panduan penggunaan"
                title="Panduan Penggunaan"
                className="mf-guide-peek"
            >
                <HelpCircle className="h-4 w-4 text-brand" />
            </button>

            {/* Compact Narrative Card */}
            {isOpen && (
                <aside
                    aria-label="Panduan penggunaan Mealflow"
                    className="fixed right-3 bottom-24 z-50 w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-(--border-strong) bg-(--glass-card) p-4 shadow-xl xl:right-6 xl:bottom-16"
                >
                    <div className="flex items-center justify-between gap-2">
                        <span className="mf-eyebrow">Panduan Singkat</span>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Tutup panduan"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) text-ink-secondary hover:text-ink-primary"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
                        Pilih bahan atau menu dari katalog lalu pasangkan ke slot makan harian sesuai kebutuhan. Sesuaikan jumlah porsi pada tiap jadwal dan sistem akan menghitung pembulatan kemasan belanja beserta sisa stok secara otomatis.
                    </p>
                </aside>
            )}
        </>
    );
};