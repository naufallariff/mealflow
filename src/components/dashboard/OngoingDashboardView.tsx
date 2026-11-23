// src/components/dashboard/OngoingDashboardView.tsx

import React, { useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    Check,
    CheckCircle2,
    Copy,
    RotateCcw,
    ShoppingCart,
} from 'lucide-react';
import { CATEGORY_LABELS } from '../../data/default-catalog';
import type { BudgetSummary, CatalogCategory } from '../../types/meal';
import { formatShoppingListPlainText } from '../../utils/export-and-nutrition';
import { formatRupiah } from '../../utils/format';
import { WorkspaceBackupBar } from './WorkspaceBackupBar';

interface OngoingDashboardViewProps {
    readonly summary: BudgetSummary;
    readonly checkedItemIds: readonly string[];
    readonly onToggleChecked: (itemId: string) => void;
    readonly onClearChecked: () => void;
    readonly onSwitchToPlanner: () => void;
    readonly onExportJson: () => string;
    readonly onImportJson: (
        rawJson: string,
    ) => { ok: true } | { ok: false; error: string };
}

export const OngoingDashboardView: React.FC<OngoingDashboardViewProps> = ({
    summary,
    checkedItemIds,
    onToggleChecked,
    onClearChecked,
    onSwitchToPlanner,
    onExportJson,
    onImportJson,
}) => {
    const checkedSet = new Set(checkedItemIds);

    let checkedCheckoutTotal = 0;
    for (const line of summary.lineItems) {
        if (checkedSet.has(line.item.id)) {
            checkedCheckoutTotal += line.retailCheckoutCost;
        }
    }

    const grandCheckoutCost =
        summary.totalRetailCheckoutCost + summary.suggestedPantryTotalCost;
    const remainingCartTotal = Math.max(
        0,
        summary.totalRetailCheckoutCost - checkedCheckoutTotal,
    );
    const clampedUsagePercent = Math.min(
        100,
        Math.max(0, summary.budgetUsagePercent),
    );

    const categoryEntries = (
        Object.entries(summary.categoryCheckoutCost) as [CatalogCategory, number][]
    )
        .filter(([, cost]) => cost > 0)
        .sort((a, b) => b[1] - a[1]);

    const [copied, setCopied] = useState(false);

    const handleCopyList = async () => {
        const text = formatShoppingListPlainText(summary, checkedItemIds);
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    if (summary.lineItems.length === 0) {
        return (
            <div className="space-y-4">
                <div className="rounded-2xl border border-dashed border-(--border-subtle) bg-(--glass-card-subtle) p-6 text-center">
                    <ShoppingCart
                        className="mx-auto h-8 w-8 text-ink-muted"
                        aria-hidden="true"
                    />
                    <h3 className="mt-3 text-sm font-extrabold text-ink-primary">
                        Dashboard Belanja Belum Aktif
                    </h3>
                    <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-ink-secondary">
                        Tentukan porsi kebutuhan bulanan terlebih dahulu untuk memantau
                        serapan anggaran, efisiensi kemasan, dan checklist belanja kasir.
                    </p>
                    <button
                        type="button"
                        onClick={onSwitchToPlanner}
                        data-variant="primary"
                        className="mf-liquid-pill mt-4 min-h-11 px-4 text-xs cursor-pointer"
                    >
                        <span>Mulai di Perencana Bulanan</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </div>

                <WorkspaceBackupBar
                    onExportJson={onExportJson}
                    onImportJson={onImportJson}
                />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <span className="mf-eyebrow">Prioritas 2: Kontrol Stok & Kasir</span>
                    <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-ink-primary">
                        Dashboard Berjalan & Checklist Belanja
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopyList}
                        className="mf-liquid-pill min-h-11 px-3 text-xs font-bold cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <Check
                                    className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                                    aria-hidden="true"
                                />
                                <span>Tersalin</span>
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                                <span>Salin ke WA / Catatan</span>
                            </>
                        )}
                    </button>

                    {checkedItemIds.length > 0 && (
                        <button
                            type="button"
                            onClick={onClearChecked}
                            className="mf-liquid-pill min-h-11 px-3 text-xs cursor-pointer"
                        >
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Reset Centang ({checkedItemIds.length})</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Bullet / Share Bar Serapan Anggaran */}
            <div className="rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                        <span className="text-[11px] font-bold text-ink-secondary">
                            Serapan Anggaran Belanja Kasir
                        </span>
                        <p className="mt-0.5 tabular-nums text-lg font-extrabold text-ink-primary">
                            {formatRupiah(grandCheckoutCost)}{' '}
                            <span className="text-xs font-medium text-ink-muted">
                                dari target {formatRupiah(summary.targetBudget)}
                            </span>
                        </p>
                    </div>

                    <span
                        className={`tabular-nums rounded-full px-2.5 py-1 text-xs font-extrabold ${summary.isOverBudget
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            }`}
                    >
                        {summary.budgetUsagePercent}% terpakai
                    </span>
                </div>

                {/* Track Bar */}
                <div
                    role="progressbar"
                    aria-valuenow={clampedUsagePercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Persentase penggunaan anggaran bulanan"
                    className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-(--border-subtle)"
                >
                    <div
                        className={`h-full rounded-full transition-all duration-200 ${summary.isOverBudget ? 'bg-rose-500' : 'bg-brand'
                            }`}
                        style={{ width: `${clampedUsagePercent}%` }}
                    />
                </div>

                {/* Sub-metrics */}
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-(--border-subtle) pt-3 text-xs sm:grid-cols-3">
                    <div>
                        <span className="block text-[11px] text-ink-muted">
                            Sudah Masuk Keranjang
                        </span>
                        <span className="tabular-nums font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(checkedCheckoutTotal)}
                        </span>
                    </div>
                    <div>
                        <span className="block text-[11px] text-ink-muted">
                            Sisa Belum Dibeli
                        </span>
                        <span className="tabular-nums font-extrabold text-ink-primary">
                            {formatRupiah(remainingCartTotal)}
                        </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <span className="block text-[11px] text-ink-muted">
                            Rata-rata Biaya / Hari Aktif
                        </span>
                        <span className="tabular-nums font-extrabold text-ink-primary">
                            {summary.activeDaysCount > 0
                                ? formatRupiah(summary.averageDailyCost)
                                : '-'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Checklist Eksekusi Kasir */}
            <div>
                <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">
                        Checklist Belanja Pasar & Minimarket
                    </h3>
                    <span className="tabular-nums text-xs font-bold text-ink-muted">
                        {checkedItemIds.length} / {summary.lineItems.length} selesai
                    </span>
                </div>

                <ul className="space-y-2">
                    {summary.lineItems.map((line) => {
                        const isChecked = checkedSet.has(line.item.id);
                        return (
                            <li key={line.item.id}>
                                <button
                                    type="button"
                                    onClick={() => onToggleChecked(line.item.id)}
                                    aria-pressed={isChecked}
                                    className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 ${isChecked
                                        ? 'border-emerald-500/30 bg-emerald-500/8 opacity-75'
                                        : 'border-(--border-subtle) bg-(--glass-card-subtle) hover:border-brand'
                                        }`}
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <CheckCircle2
                                            className={`h-5 w-5 shrink-0 ${isChecked
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-ink-muted'
                                                }`}
                                            aria-hidden="true"
                                        />
                                        <div className="min-w-0">
                                            <p
                                                className={`truncate text-xs font-extrabold ${isChecked
                                                    ? 'line-through text-ink-muted'
                                                    : 'text-ink-primary'
                                                    }`}
                                            >
                                                {line.item.name}
                                            </p>
                                            <p className="mt-0.5 tabular-nums text-[11px] text-ink-secondary">
                                                Beli{' '}
                                                <strong className="font-bold text-brand">
                                                    {line.packsToBuy} x {line.item.packUnit}
                                                </strong>{' '}
                                                (untuk {line.usedPortions} {line.item.consumptionUnit})
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-right tabular-nums">
                                        <span className="block text-xs font-extrabold text-ink-primary">
                                            {formatRupiah(line.retailCheckoutCost)}
                                        </span>
                                        {line.isLowUtilization && (
                                            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                                <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                                Sisa {line.leftoverPortions}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Rincian Kategori Belanja */}
            {categoryEntries.length > 0 && (
                <div className="rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) p-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-ink-secondary">
                        Proporsi Biaya per Kategori Bahan
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                        {categoryEntries.map(([category, cost]) => {
                            const sharePercent =
                                summary.totalRetailCheckoutCost > 0
                                    ? Math.round((cost / summary.totalRetailCheckoutCost) * 100)
                                    : 0;
                            return (
                                <li key={category} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-bold text-ink-primary">
                                            {CATEGORY_LABELS[category]}
                                        </span>
                                        <span className="tabular-nums font-bold text-ink-secondary">
                                            {formatRupiah(cost)} ({sharePercent}%)
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--border-subtle)">
                                        <div
                                            className="h-full rounded-full bg-brand"
                                            style={{ width: `${sharePercent}%` }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* Cadangan & Pemulihan Profil JSON */}
            <WorkspaceBackupBar
                onExportJson={onExportJson}
                onImportJson={onImportJson}
            />
        </div>
    );
};