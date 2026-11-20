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

    const leftoverCount = summary.lineItems.filter(
        (i) => i.leftoverPortions > 0,
    ).length;

    const visibleItems =
        filterMode === 'leftover'
            ? summary.lineItems.filter((line) => line.leftoverPortions > 0)
            : summary.lineItems;

    const handleCopyList = async () => {
        if (summary.lineItems.length === 0) return;
        const lines = summary.lineItems.map(
            (line, idx) =>
                `${idx + 1}. ${line.item.name} — Beli ${line.packsToBuy} kemasan (${line.item.packUnit}) = ${formatIdr(line.retailCheckoutCost)} | Kebutuhan ${line.usedPortions} porsi, sisa stok ${line.leftoverPortions} porsi`,
        );
        const header = `Daftar Belanja Bulanan (Total: ${formatIdr(summary.totalRetailCheckoutCost)})\n`;
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
                            Daftar Belanja
                        </h2>
                        <p className="text-[11px] font-medium text-ink-muted">
                            Kebutuhan kemasan & sisa stok 31 hari
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleCopyList}
                    disabled={summary.lineItems.length === 0}
                    data-variant={copied ? 'emerald' : undefined}
                    className="mf-liquid-pill h-8.5 px-3 text-xs disabled:pointer-events-none disabled:opacity-40"
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5" />
                    ) : (
                        <Copy className="h-3.5 w-3.5 text-brand" />
                    )}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
            </div>

            {/* Ringkasan Total Belanja */}
            <div className="mt-3.5 rounded-2xl border border-(--brand-border) bg-brand-glass p-3.5">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-bold text-ink-secondary">
                        Total Belanja ({summary.lineItems.length} item)
                    </span>
                    <span className="tabular-nums text-base font-extrabold tracking-tight text-ink-primary">
                        {formatIdr(summary.totalRetailCheckoutCost)}
                    </span>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-(--border-subtle) pt-2.5">
                    <div>
                        <span className="block text-[10px] font-semibold text-ink-muted">
                            Belanja Makanan
                        </span>
                        <span className="tabular-nums text-xs font-extrabold text-morning-fg">
                            {formatIdr(summary.foodCheckoutCost)}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] font-semibold text-ink-muted">
                            Belanja Minuman
                        </span>
                        <span className="tabular-nums text-xs font-extrabold text-brand">
                            {formatIdr(summary.drinkCheckoutCost)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="mt-3 grid grid-cols-2 gap-1.5">
                <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`h-8 rounded-xl text-xs font-bold transition-colors duration-150 active:scale-97 ${filterMode === 'all'
                            ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                            : 'border border-(--border-subtle) bg-(--glass-card-subtle) text-ink-secondary hover:text-ink-primary'
                        }`}
                >
                    Semua ({summary.lineItems.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilterMode('leftover')}
                    className={`h-8 rounded-xl text-xs font-bold transition-colors duration-150 active:scale-97 ${filterMode === 'leftover'
                            ? 'bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900'
                            : 'border border-(--border-subtle) bg-(--glass-card-subtle) text-ink-secondary hover:text-ink-primary'
                        }`}
                >
                    Bersisa ({leftoverCount})
                </button>
            </div>

            {/* Scrollable Line Items */}
            <div className="mf-scroll-panel mt-3.5">
                {visibleItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-(--border-subtle) bg-(--glass-card-subtle) px-4 py-9 text-center">
                        <PackageCheck className="mx-auto h-7 w-7 text-ink-muted" />
                        <p className="mt-2 text-xs font-bold text-ink-secondary">
                            Belum ada daftar belanja
                        </p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-muted">
                            Pasangkan bahan atau menu ke kalender untuk menghitung total belanja dan sisa stok.
                        </p>
                    </div>
                ) : (
                    visibleItems.map((line) => {
                        const leftoverCost = Math.max(
                            0,
                            Math.round(line.retailCheckoutCost - line.consumedCost),
                        );

                        return (
                            <div
                                key={line.item.id}
                                style={{
                                    contentVisibility: 'auto',
                                    containIntrinsicSize: '116px',
                                }}
                                className="mf-glass-card p-3.5"
                            >
                                {/* Baris 1: Nama & Total Harga Item */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p
                                            title={line.item.name}
                                            className="truncate text-xs font-extrabold tracking-tight text-ink-primary"
                                        >
                                            {line.item.name}
                                        </p>
                                        <p className="mt-0.5 text-[11px] font-medium text-ink-muted">
                                            {line.item.packUnit} · {formatIdr(line.item.packPrice)}/kemasan
                                        </p>
                                    </div>
                                    <span className="tabular-nums shrink-0 text-xs font-extrabold text-ink-primary">
                                        {formatIdr(line.retailCheckoutCost)}
                                    </span>
                                </div>

                                {/* Baris 2: Rincian Beli vs Kebutuhan Sebulan vs Sisa */}
                                <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-xl border border-(--border-subtle) bg-(--glass-card-subtle) p-2 text-center">
                                    <div>
                                        <span className="block text-[10px] font-medium text-ink-muted">
                                            Harus Beli
                                        </span>
                                        <span className="tabular-nums text-[11px] font-extrabold text-ink-primary">
                                            {line.packsToBuy} kemasan
                                        </span>
                                        <span className="tabular-nums block text-[10px] text-ink-muted">
                                            ({line.totalPurchasedPortions} porsi)
                                        </span>
                                    </div>

                                    <div className="border-x border-(--border-subtle) px-1">
                                        <span className="block text-[10px] font-medium text-ink-muted">
                                            Terpakai
                                        </span>
                                        <span className="tabular-nums text-[11px] font-extrabold text-brand">
                                            {line.usedPortions} porsi
                                        </span>
                                        <span className="tabular-nums block text-[10px] text-ink-muted">
                                            ({line.utilizationPercent}%)
                                        </span>
                                    </div>

                                    <div>
                                        <span className="block text-[10px] font-medium text-ink-muted">
                                            Sisa Stok
                                        </span>
                                        <span
                                            className={`tabular-nums text-[11px] font-extrabold ${line.leftoverPortions === 0
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : line.isLowUtilization
                                                        ? 'text-morning-fg'
                                                        : 'text-ink-primary'
                                                }`}
                                        >
                                            {line.leftoverPortions === 0
                                                ? 'Habis pas'
                                                : `${line.leftoverPortions} porsi`}
                                        </span>
                                        <span className="tabular-nums block text-[10px] text-ink-muted">
                                            {line.leftoverPortions > 0
                                                ? formatIdr(leftoverCost)
                                                : '0 sisa'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};