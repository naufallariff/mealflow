// src/components/summary/GrocerySummaryPanel.tsx

import React, { useState } from 'react';
import { Check, Copy, PackageCheck, ShoppingCart } from 'lucide-react';
import type { BudgetSummary } from '../../types/meal';
import { formatIdr } from '../../utils/currency';

interface GrocerySummaryPanelProps {
    readonly summary: BudgetSummary;
}

export const GrocerySummaryPanel: React.FC<GrocerySummaryPanelProps> = ({ summary }) => {
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
        <aside className="flex flex-col rounded-2xl border border-[#E5E5EA] bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-[#007AFF]" />
                    <h2 className="text-sm font-semibold text-[#1C1C1E]">Rekap Belanja Realistis</h2>
                </div>
                <button
                    type="button"
                    onClick={handleCopyList}
                    disabled={summary.lineItems.length === 0}
                    className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-[#E5E5EA] bg-[#F8F9FB] px-2.5 py-1 text-xs font-medium text-[#1C1C1E] hover:bg-[#F2F2F7] disabled:opacity-40 active:scale-[0.97]"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-[#34C759]" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin List'}</span>
                </button>
            </div>

            {/* Category Subtotals */}
            <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-3 py-2">
                    <span className="text-[11px] text-[#636366]">Sub Makanan</span>
                    <p className="tabular-nums text-sm font-bold text-[#1C1C1E]">
                        {formatIdr(summary.foodCheckoutCost)}
                    </p>
                </div>
                <div className="rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-3 py-2">
                    <span className="text-[11px] text-[#636366]">Sub Minuman</span>
                    <p className="tabular-nums text-sm font-bold text-[#1C1C1E]">
                        {formatIdr(summary.drinkCheckoutCost)}
                    </p>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="mt-3 flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${filterMode === 'all'
                            ? 'bg-[#1C1C1E] text-white'
                            : 'bg-[#F2F2F7] text-[#636366] hover:text-[#1C1C1E]'
                        }`}
                >
                    Semua ({summary.lineItems.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilterMode('leftover')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${filterMode === 'leftover'
                            ? 'bg-[#1C1C1E] text-white'
                            : 'bg-[#F2F2F7] text-[#636366] hover:text-[#1C1C1E]'
                        }`}
                >
                    Sisa Stok ({summary.lineItems.filter((i) => i.leftoverPortions > 0).length})
                </button>
            </div>

            {/* Line Items */}
            <div className="mt-3 max-h-135 space-y-2 overflow-y-auto pr-0.5">
                {visibleItems.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#D1D1D6] bg-[#F8F9FB] px-4 py-8 text-center">
                        <PackageCheck className="mx-auto h-7 w-7 text-[#8E8E93]" />
                        <p className="mt-2 text-xs font-medium text-[#636366]">
                            Belum ada item terpasang di kalender
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#8E8E93]">
                            Pasangkan menu dari katalog untuk melihat hitungan kemasan otomatis.
                        </p>
                    </div>
                ) : (
                    visibleItems.map((line) => (
                        <div
                            key={line.item.id}
                            className="rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] p-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold text-[#1C1C1E]">
                                        {line.item.name}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-[#636366]">
                                        Beli <strong className="text-[#1C1C1E]">{line.packsToBuy}x</strong> ({line.item.packUnit})
                                    </p>
                                </div>
                                <span className="tabular-nums shrink-0 text-xs font-bold text-[#1C1C1E]">
                                    {formatIdr(line.retailCheckoutCost)}
                                </span>
                            </div>

                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E5EA]">
                                <div
                                    className="h-full rounded-full bg-[#34C759]"
                                    style={{ width: `${line.utilizationPercent}%` }}
                                />
                            </div>

                            <div className="tabular-nums mt-1.5 flex items-center justify-between text-[11px] text-[#636366]">
                                <span>
                                    Pakai {line.usedPortions} / {line.totalPurchasedPortions} porsi
                                </span>
                                <span className="font-medium text-[#007AFF]">
                                    Sisa {line.leftoverPortions} porsi ({100 - line.utilizationPercent}%)
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
};