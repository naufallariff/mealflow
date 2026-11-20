// src/components/summary/GrocerySummaryPanel.tsx

import React, { useState } from 'react';
import { Check, Copy, PackageCheck, ShoppingBag } from 'lucide-react';
import type { BudgetSummary } from '../../types/meal';
import { formatIdr } from '../../utils/currency';

interface GrocerySummaryPanelProps {
    readonly summary: BudgetSummary;
}

export const GrocerySummaryPanel: React.FC<GrocerySummaryPanelProps> = ({
    summary,
}) => {
    const [filterMode, setFilterMode] = useState<'all' | 'leftover'>('all');
    const [copied, setCopied] = useState(false);

    const visibleItems =
        filterMode === 'leftover'
            ? summary.lineItems.filter((line) => line.leftoverPortions > 0)
            : summary.lineItems;

    const handleCopyList = async () => {
        if (summary.lineItems.length === 0) return;
        const lines = summary.lineItems.map(
            (line, idx) =>
                `${idx + 1}. ${line.item.name} — Beli ${line.packsToBuy}x (${line.item.packUnit}) = ${formatIdr(line.retailCheckoutCost)} [Pakai ${line.usedPortions}/${line.totalPurchasedPortions} porsi]`,
        );
        const header = `Daftar Belanja Mealflow (Total: ${formatIdr(summary.totalRetailCheckoutCost)})\n`;
        try {
            await navigator.clipboard.writeText(header + lines.join('\n'));
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            // Ignore clipboard permission errors
        }
    };

    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-afternoon-glass text-afternoon-fg">
                        <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-extrabold tracking-tight text-ink-primary">
                            Rekap Belanja Realistis
                        </h2>
                        <p className="text-[11px] font-medium text-ink-muted">
                            Pembulatan kemasan grosir otomatis
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleCopyList}
                    disabled={summary.lineItems.length === 0}
                    data-variant={copied ? 'emerald' : undefined}
                    className="mf-liquid-pill min-h-8.5 px-3 text-xs disabled:pointer-events-none disabled:opacity-40"
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5" />
                    ) : (
                        <Copy className="h-3.5 w-3.5 text-brand" />
                    )}
                    <span>{copied ? 'Tersalin' : 'Salin List'}</span>
                </button>
            </div>

            {/* Colorful Category Subtotals */}
            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-amber-500/25 bg-linear-to-brrom-amber-500/12 to-white/60 p-3 dark:to-white/5">
                    <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                        Sub Makanan
                    </span>
                    <p className="tabular-nums mt-0.5 text-sm font-extrabold text-ink-primary">
                        {formatIdr(summary.foodCheckoutCost)}
                    </p>
                </div>

                <div className="rounded-2xl border border-blue-500/25 bg-linear-to-br from-blue-500/12 to-white/60 p-3 dark:to-white/5">
                    <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">
                        Sub Minuman
                    </span>
                    <p className="tabular-nums mt-0.5 text-sm font-extrabold text-ink-primary">
                        {formatIdr(summary.drinkCheckoutCost)}
                    </p>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="mt-3 flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 active:scale-95 ${filterMode === 'all'
                            ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                            : 'border border-black/6 bg-white/55 text-ink-secondary hover:bg-white/85 hover:text-ink-primary dark:border-white/10 dark:bg-white/6'
                        }`}
                >
                    Semua ({summary.lineItems.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilterMode('leftover')}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 active:scale-95 ${filterMode === 'leftover'
                            ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                            : 'border border-black/6 bg-white/55 text-ink-secondary hover:bg-white/85 hover:text-ink-primary dark:border-white/10 dark:bg-white/6'
                        }`}
                >
                    Sisa Stok (
                    {summary.lineItems.filter((i) => i.leftoverPortions > 0).length})
                </button>
            </div>

            {/* Scrollable Line Items */}
            <div className="mf-scroll-panel mf-scrollbar mt-3.5">
                {visibleItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-black/15 bg-white/40 px-4 py-9 text-center dark:border-white/15 dark:bg-white/5">
                        <PackageCheck className="mx-auto h-7 w-7 text-ink-muted" />
                        <p className="mt-2 text-xs font-bold text-ink-secondary">
                            Belum ada item terpasang di kalender
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                            Pasangkan menu dari katalog untuk melihat hitungan kemasan otomatis.
                        </p>
                    </div>
                ) : (
                    visibleItems.map((line) => (
                        <div
                            key={line.item.id}
                            className="rounded-2xl border border-white/70 bg-white/70 p-3.5 shadow-2xs outline-1 outline-black/6 transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/12 dark:bg-white/6 dark:outline-white/8"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p
                                        title={line.item.name}
                                        className="truncate text-xs font-bold tracking-tight text-ink-primary"
                                    >
                                        {line.item.name}
                                    </p>
                                    <p className="mt-0.5 text-[11px] font-medium text-ink-secondary">
                                        Beli{' '}
                                        <strong className="font-extrabold text-ink-primary">
                                            {line.packsToBuy}x
                                        </strong>{' '}
                                        ({line.item.packUnit})
                                    </p>
                                </div>
                                <span className="tabular-nums shrink-0 text-xs font-extrabold text-ink-primary">
                                    {formatIdr(line.retailCheckoutCost)}
                                </span>
                            </div>

                            {/* Utilization Progress Bar */}
                            <div className="mf-budget-track mt-2.5 h-1.5">
                                <div
                                    className="mf-budget-fill"
                                    style={{ width: `${line.utilizationPercent}%` }}
                                />
                            </div>

                            <div className="tabular-nums mt-2 flex items-center justify-between text-[11px]">
                                <span className="font-medium text-ink-secondary">
                                    Pakai {line.usedPortions} / {line.totalPurchasedPortions} porsi
                                </span>
                                <span className="font-bold text-brand">
                                    Sisa {line.leftoverPortions} porsi (
                                    {100 - line.utilizationPercent}%)
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};