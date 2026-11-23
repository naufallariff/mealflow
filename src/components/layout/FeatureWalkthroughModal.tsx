// src/components/layout/FeatureWalkthroughModal.tsx

import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckSquare,
    Package,
    TableProperties,
    X,
} from 'lucide-react';
import type { ActiveWorkspaceTab } from '../../services/storage-engine';
import type { MobileTab } from './MobileBottomNav';

interface WalkthroughStep {
    readonly id: string;
    readonly stepLabel: string;
    readonly title: string;
    readonly summary: string;
    readonly detail: string;
    readonly icon: 'unit' | 'planner' | 'dashboard' | 'calendar';
    readonly targetWorkspaceTab?: ActiveWorkspaceTab;
    readonly targetMobileTab?: MobileTab;
    readonly ctaLabel: string;
}

const WALKTHROUGH_STEPS: readonly WalkthroughStep[] = [
    {
        id: 'unit-inversion',
        stepLabel: 'Langkah 1 dari 4',
        title: 'Hitung dari Takaran Makan, Beli Kemasan Utuh',
        summary:
            'Anda makan per porsi atau butir, tetapi belanja di pasar selalu per kemasan.',
        detail:
            'Setiap bahan menampilkan harga per takaran konsumsi (misalnya 1 butir telur atau 1 porsi nasi), lalu otomatis dihitung ke jumlah kemasan pasar utuh beserta sisa stok akhir bulan.',
        icon: 'unit',
        targetMobileTab: 'catalog',
        ctaLabel: 'Lihat Katalog Bahan',
    },
    {
        id: 'monthly-planner',
        stepLabel: 'Langkah 2 dari 4',
        title: 'Perencana Frekuensi Bulanan & Paket Masakan',
        summary:
            'Hitung belanja bulanan langsung tanpa harus mengisi 93 slot kalender.',
        detail:
            'Gunakan tombol +/- untuk mengatur frekuensi konsumsi 31 hari, mulai cepat dari pola anak kos atau rumah tangga, atau klik paket masakan agar bahan bakunya terisi otomatis.',
        icon: 'planner',
        targetWorkspaceTab: 'planner',
        targetMobileTab: 'calendar',
        ctaLabel: 'Buka Perencana Bulanan',
    },
    {
        id: 'ongoing-dashboard',
        stepLabel: 'Langkah 3 dari 4',
        title: 'Dashboard Berjalan, Checklist Kasir & Salin WA',
        summary:
            'Pantau sisa anggaran dan centang belanjaan langsung saat di kasir.',
        detail:
            'Cek persentase pemakaian budget, peringatan kemasan yang terpakai di bawah 50%, centang barang yang sudah masuk keranjang, atau salin daftar belanja ke WhatsApp.',
        icon: 'dashboard',
        targetWorkspaceTab: 'grocery',
        targetMobileTab: 'dashboard',
        ctaLabel: 'Buka Dashboard & Kasir',
    },
    {
        id: 'optional-calendar',
        stepLabel: 'Langkah 4 dari 4',
        title: 'Kalender 31 Hari Opsional (M1 sampai M5)',
        summary:
            'Atur ritme makan harian hanya jika Anda membutuhkan jadwal per waktu makan.',
        detail:
            'Sebarkan porsi bulanan ke slot Pagi, Siang, dan Malam, salin pola antar-minggu, atau terapkan pola satu minggu ke seluruh bulan.',
        icon: 'calendar',
        targetWorkspaceTab: 'calendar',
        targetMobileTab: 'calendar',
        ctaLabel: 'Buka Kalender 31 Hari',
    },
];

interface FeatureWalkthroughModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onJumpToFeature?: (
        workspaceTab?: ActiveWorkspaceTab,
        mobileTab?: MobileTab,
    ) => void;
}

export const FeatureWalkthroughModal: React.FC<FeatureWalkthroughModalProps> = ({
    isOpen,
    onClose,
    onJumpToFeature,
}) => {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (!isOpen) return;
        setStepIndex(0);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const currentStep = WALKTHROUGH_STEPS[stepIndex] ?? WALKTHROUGH_STEPS[0];
    const isLastStep = stepIndex === WALKTHROUGH_STEPS.length - 1;

    const renderIcon = (icon: WalkthroughStep['icon']) => {
        switch (icon) {
            case 'unit':
                return <Package className="h-5 w-5" aria-hidden="true" />;
            case 'planner':
                return <TableProperties className="h-5 w-5" aria-hidden="true" />;
            case 'dashboard':
                return <CheckSquare className="h-5 w-5" aria-hidden="true" />;
            case 'calendar':
                return <CalendarDays className="h-5 w-5" aria-hidden="true" />;
        }
    };

    const handleJump = () => {
        onJumpToFeature?.(
            currentStep.targetWorkspaceTab,
            currentStep.targetMobileTab,
        );
        onClose();
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mf-walkthrough-title"
            className="mf-modal-scrim"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="mf-modal-glass max-w-lg space-y-4">
                {/* Header Modal */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-glass text-brand">
                            {renderIcon(currentStep.icon)}
                        </div>
                        <div>
                            <span className="mf-eyebrow">{currentStep.stepLabel}</span>
                            <h2
                                id="mf-walkthrough-title"
                                className="mt-0.5 text-base font-extrabold tracking-tight text-ink-primary"
                            >
                                {currentStep.title}
                            </h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup tur fitur Mealflow"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) text-ink-secondary cursor-pointer hover:text-ink-primary focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>

                {/* Indikator Progres Langkah */}
                <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                    {WALKTHROUGH_STEPS.map((step, idx) => (
                        <button
                            key={step.id}
                            type="button"
                            tabIndex={-1}
                            onClick={() => setStepIndex(idx)}
                            className={`h-1.5 rounded-full transition-colors ${idx <= stepIndex ? 'bg-brand' : 'bg-(--border-subtle)'
                                }`}
                        />
                    ))}
                </div>

                {/* Konten Penjelasan */}
                <div className="rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) p-4 space-y-2">
                    <p className="text-xs font-extrabold leading-relaxed text-ink-primary">
                        {currentStep.summary}
                    </p>
                    <p className="text-xs leading-relaxed text-ink-secondary">
                        {currentStep.detail}
                    </p>
                </div>

                {/* Pintasan Langsung ke Fitur pada Langkah Ini */}
                {onJumpToFeature && (
                    <button
                        type="button"
                        onClick={handleJump}
                        className="mf-liquid-pill min-h-11 w-full justify-between px-4 text-xs font-bold cursor-pointer"
                    >
                        <span>{currentStep.ctaLabel}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                    </button>
                )}

                {/* Navigasi Langkah */}
                <div className="flex items-center justify-between gap-2 border-t border-(--border-subtle) pt-3">
                    <button
                        type="button"
                        onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                        disabled={stepIndex === 0}
                        className="mf-liquid-pill min-h-11 px-3.5 text-xs font-bold cursor-pointer disabled:pointer-events-none disabled:opacity-40"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Sebelumnya</span>
                    </button>

                    {isLastStep ? (
                        <button
                            type="button"
                            onClick={onClose}
                            data-variant="primary"
                            className="mf-liquid-pill min-h-11 px-4 text-xs font-bold cursor-pointer"
                        >
                            <span>Selesai & Mulai</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() =>
                                setStepIndex((i) => Math.min(WALKTHROUGH_STEPS.length - 1, i + 1))
                            }
                            data-variant="primary"
                            className="mf-liquid-pill min-h-11 px-4 text-xs font-bold cursor-pointer"
                        >
                            <span>Lanjut</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};