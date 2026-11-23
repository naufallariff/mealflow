// src/components/summary/GrocerySummaryPanel.tsx

import React, { useMemo, useState } from 'react';
import {
    AlertTriangle,
    ArrowRight,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Copy,
    Flame,
    Package,
    Scale,
    ShoppingBag,
} from 'lucide-react';
import type { BudgetSummary } from '../../types/meal';
import {
    calculateDailyNutritionAverage,
    formatShoppingListPlainText,
} from '../../utils/export-and-nutrition';
import { formatRupiah } from '../../utils/format';

export interface GrocerySummaryPanelProps {
    readonly summary: BudgetSummary;
    readonly checkedItemIds?: readonly string[];
    readonly onToggleChecked?: (itemId: string) => void;
    readonly onSwitchToCatalog?: () => void;
}

export const GrocerySummaryPanel: React.FC<GrocerySummaryPanelProps> = ({
    summary,
    checkedItemIds = [],
    onToggleChecked,
    onSwitchToCatalog,
}) => {
    const [copied, setCopied] = useState(false);
    const [showNutrition, setShowNutrition] = useState(false);

    const checkedSet = new Set(checkedItemIds);
    const grandTotalWithPantry =
        summary.totalRetailCheckoutCost + summary.suggestedPantryTotalCost;

    const nutrition = useMemo(
        () => calculateDailyNutritionAverage(summary, 31),
        [summary],
    );

    const handleCopyShoppingList = async () => {
        const text = formatShoppingListPlainText(summary, checkedItemIds);
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-extrabold tracking-tight text-ink-primary">
                            Daftar Belanja & Kemasan
                        </h2>
                        <p className="tabular-nums text-[11px] font-medium text-ink-muted">
                            {summary.lineItems.length} bahan, {summary.totalUsedPortions} porsi
                        </p>
                    </div>
                </div>

                {summary.lineItems.length > 0 && (
                    <button
                        type="button"
                        onClick={handleCopyShoppingList}
                        aria-label="Salin daftar belanja ke clipboard"
                        className="mf-liquid-pill h-11 shrink-0 px-3 text-xs font-bold cursor-pointer"
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
                                <span>Salin</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Empty State */}
            {summary.lineItems.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-(--border-subtle) bg-(--glass-card-subtle) p-5 text-center">
                    <Package
                        className="mx-auto h-7 w-7 text-ink-muted"
                        aria-hidden="true"
                    />
                    <p className="mt-2.5 text-xs font-bold text-ink-primary">
                        Belum ada kebutuhan bahan tercatat
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-secondary">
                        Atur frekuensi porsi bulanan atau pilih bahan di katalog untuk
                        menghitung pembulatan kemasan pasar secara otomatis.
                    </p>
                    {onSwitchToCatalog && (
                        <button
                            type="button"
                            onClick={onSwitchToCatalog}
                            data-variant="primary"
                            className="mf-liquid-pill mt-3.5 min-h-11 px-4 text-xs cursor-pointer"
                        >
                            <span>Buka Katalog Bahan</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Ringkasan Kasir vs Nilai Terpakai */}
                    <div className="mt-4 rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle) p-3.5">
                        <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[11px] font-bold text-ink-secondary">
                                Total Bayar Kasir (Kemasan Utuh)
                            </span>
                            <span className="tabular-nums text-base font-extrabold text-ink-primary">
                                {formatRupiah(grandTotalWithPantry)}
                            </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
                            <span>Nilai Porsi Terpakai</span>
                            <span className="tabular-nums font-semibold text-ink-secondary">
                                {formatRupiah(summary.totalConsumedCost)}
                            </span>
                        </div>

                        {summary.totalLeftoverValue > 0 && (
                            <div className="mt-1 flex items-center justify-between text-[11px] text-ink-muted">
                                <span>Nilai Sisa Stok Akhir Bulan</span>
                                <span className="tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                                    +{formatRupiah(summary.totalLeftoverValue)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Lapisan Estimasi Nutrisi Harian Opsional (Tertutup Default) */}
                    {nutrition.coveredItemsCount > 0 && (
                        <div className="mt-3 rounded-2xl border border-(--border-subtle) bg-(--glass-card-subtle)">
                            <button
                                type="button"
                                onClick={() => setShowNutrition((v) => !v)}
                                aria-expanded={showNutrition}
                                className="flex min-h-11 w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-xs font-bold text-ink-secondary transition-colors cursor-pointer hover:text-ink-primary focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Scale className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                                    <span>Estimasi Gizi Harian (Rata-rata 31 Hari)</span>
                                </span>
                                {showNutrition ? (
                                    <ChevronUp className="h-4 w-4 shrink-0" aria-hidden="true" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                                )}
                            </button>

                            {showNutrition && (
                                <div className="grid grid-cols-2 gap-2 border-t border-(--border-subtle) p-3 tabular-nums text-[11px]">
                                    <div className="rounded-xl bg-(--glass-card) p-2">
                                        <span className="block text-[10px] text-ink-muted">
                                            Energi / Hari
                                        </span>
                                        <span className="font-extrabold text-ink-primary">
                                            {nutrition.avgDailyCalories} kkal
                                        </span>
                                    </div>
                                    <div className="rounded-xl bg-(--glass-card) p-2">
                                        <span className="block text-[10px] text-ink-muted">
                                            Protein / Hari
                                        </span>
                                        <span className="font-extrabold text-brand">
                                            {nutrition.avgDailyProtein} g
                                        </span>
                                    </div>
                                    <div className="rounded-xl bg-(--glass-card) p-2">
                                        <span className="block text-[10px] text-ink-muted">
                                            Karbohidrat / Hari
                                        </span>
                                        <span className="font-extrabold text-ink-primary">
                                            {nutrition.avgDailyCarbs} g
                                        </span>
                                    </div>
                                    <div className="rounded-xl bg-(--glass-card) p-2">
                                        <span className="block text-[10px] text-ink-muted">
                                            Lemak / Hari
                                        </span>
                                        <span className="font-extrabold text-ink-primary">
                                            {nutrition.avgDailyFat} g
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Peringatan Sisa Stok >= 50% (Anti-Mubazir Anak Kos) */}
                    {summary.underutilizedItems.length > 0 && (
                        <div
                            role="status"
                            className="mt-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3"
                        >
                            <div className="flex items-start gap-2">
                                <AlertTriangle
                                    className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                                    aria-hidden="true"
                                />
                                <div className="text-[11px] leading-relaxed">
                                    <p className="font-bold text-amber-800 dark:text-amber-300">
                                        {summary.underutilizedItems.length} kemasan terpakai di bawah 50%
                                    </p>
                                    <p className="mt-0.5 text-amber-700/90 dark:text-amber-300/80">
                                        {summary.underutilizedItems
                                            .slice(0, 2)
                                            .map(
                                                (u) =>
                                                    `${u.item.name} (sisa ${u.leftoverPortions} ${u.item.consumptionUnit})`,
                                            )
                                            .join(', ')}
                                        . Pertimbangkan kemasan lebih kecil agar tidak mubazir.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Daftar Item Kemasan */}
                    <ul className="mt-3.5 space-y-2 border-t border-(--border-subtle) pt-3.5">
                        {summary.lineItems.map((line) => {
                            const isChecked = checkedSet.has(line.item.id);
                            const cardBorderClass = isChecked
                                ? 'border-emerald-500/30 bg-emerald-500/8 opacity-75'
                                : 'border-(--border-subtle) bg-(--glass-card-subtle)';

                            return (
                                <li key={line.item.id}>
                                    <button
                                        type="button"
                                        onClick={() => onToggleChecked?.(line.item.id)}
                                        aria-pressed={isChecked}
                                        className={`w-full rounded-xl border p-3 text-left transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 ${cardBorderClass}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex min-w-0 items-start gap-2">
                                                <CheckCircle2
                                                    className={`mt-0.5 h-4 w-4 shrink-0 ${isChecked
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
                                                    <p className="mt-0.5 tabular-nums text-[11px] font-semibold text-brand">
                                                        Beli {line.packsToBuy} x {line.item.packUnit}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="shrink-0 tabular-nums text-xs font-extrabold text-ink-primary">
                                                {formatRupiah(line.retailCheckoutCost)}
                                            </span>
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center justify-between gap-1 border-t border-(--border-subtle) pt-1.5 tabular-nums text-[10px] font-medium text-ink-muted">
                                            <span>
                                                Pakai {line.usedPortions}/{line.totalPurchasedPortions} (
                                                {line.utilizationPercent}%)
                                            </span>
                                            {line.leftoverPortions > 0 ? (
                                                <span
                                                    className={
                                                        line.isLowUtilization
                                                            ? 'font-bold text-amber-600 dark:text-amber-400'
                                                            : 'text-ink-secondary'
                                                    }
                                                >
                                                    Sisa {line.leftoverPortions}
                                                </span>
                                            ) : (
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                    Habis pas
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Smart Pantry Auto-Suggest */}
                    {summary.pantrySuggestions.length > 0 && (
                        <div className="mt-3.5 rounded-2xl border border-brand/25 bg-brand-glass p-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-brand">
                                <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Saran Minyak & Bumbu Otomatis</span>
                            </div>
                            <ul className="mt-2 space-y-1.5">
                                {summary.pantrySuggestions.map((s) => (
                                    <li
                                        key={s.id}
                                        className="flex items-start justify-between gap-2 text-[11px]"
                                    >
                                        <div>
                                            <p className="font-bold text-ink-primary">
                                                {s.name}: {s.recommendedPackLabel}
                                            </p>
                                            <p className="text-[10px] text-ink-secondary">{s.reason}</p>
                                        </div>
                                        <span className="shrink-0 tabular-nums font-bold text-ink-primary">
                                            {formatRupiah(s.estimatedCost)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};