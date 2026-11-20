// src/components/summary/BudgetTargetCard.tsx

import React, { useState } from 'react';
import { Check, Pencil, SlidersHorizontal, Target, Wallet } from 'lucide-react';
import type { BudgetSummary } from '../../types/meal';
import { formatCompactIdr, formatIdr } from '../../utils/currency';

interface BudgetTargetCardProps {
    readonly summary: BudgetSummary;
    readonly targetBudget: number;
    readonly onChangeTarget: (nextTarget: number) => void;
}

const TARGET_CHIPS = [0, 500_000, 800_000, 1_000_000, 1_500_000] as const;

export const BudgetTargetCard: React.FC<BudgetTargetCardProps> = ({
    summary,
    targetBudget,
    onChangeTarget,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [draftValue, setDraftValue] = useState(String(targetBudget));

    const openEditor = () => {
        setDraftValue(targetBudget > 0 ? String(targetBudget) : '');
        setIsEditing(true);
    };

    const commitDraft = () => {
        const numeric = Number(draftValue.replace(/\D/g, ''));
        onChangeTarget(Number.isFinite(numeric) ? numeric : 0);
        setIsEditing(false);
    };

    const progressWidth =
        targetBudget > 0 ? Math.min(100, summary.budgetUsagePercent) : 0;

    const budgetState: 'danger' | 'warn' | undefined = summary.isOverBudget
        ? 'danger'
        : summary.budgetUsagePercent >= 85
            ? 'warn'
            : undefined;

    return (
        <section
            aria-label="Ringkasan Anggaran & Stok Bulanan"
            className="mf-glass-panel p-4 sm:p-5"
        >
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                {/* Metric 1: Realistic Retail Checkout */}
                <div className="mf-glass-card flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-ink-secondary">
                            Belanja Realistis (Kemasan)
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-glass text-brand">
                            <Wallet className="h-3.5 w-3.5" />
                        </div>
                    </div>

                    <p className="mf-kpi-number mt-2 text-ink-primary">
                        {formatIdr(summary.totalRetailCheckoutCost)}
                    </p>

                    <p className="tabular-nums mt-1.5 text-[11px] font-medium text-ink-muted">
                        <strong className="font-bold text-ink-secondary">
                            {summary.lineItems.length}
                        </strong>{' '}
                        item ·{' '}
                        <strong className="font-bold text-ink-secondary">
                            {summary.totalUsedPortions}
                        </strong>{' '}
                        porsi terjadwal
                    </p>
                </div>

                {/* Metric 2: Consumed Pro-rata & Leftover Pantry Value */}
                <div className="mf-glass-card flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-ink-secondary">
                            Terpakai vs Sisa Stok
                        </span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-afternoon-glass text-afternoon-fg">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                        </div>
                    </div>

                    <p className="mf-kpi-number mt-2 text-ink-primary">
                        {formatIdr(summary.totalConsumedCost)}
                    </p>

                    <p className="tabular-nums mt-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Nilai sisa pantry: {formatIdr(summary.totalLeftoverValue)}
                    </p>
                </div>

                {/* Metric 3 & 4: Target Budget Controller */}
                <div className="mf-glass-card flex flex-col justify-between p-4 sm:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-2.5">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5 text-berry-fg" />
                                <span className="text-xs font-semibold text-ink-secondary">
                                    Target Anggaran Bulanan
                                </span>
                            </div>

                            {!isEditing ? (
                                <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                                    <span className="mf-kpi-number text-ink-primary">
                                        {targetBudget > 0
                                            ? formatIdr(targetBudget)
                                            : 'Tanpa Target (Rp 0)'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={openEditor}
                                        className="mf-liquid-pill min-h-7.5 px-3 text-xs text-brand"
                                    >
                                        <Pencil className="h-3 w-3" />
                                        <span>Atur</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-1.5 flex items-center gap-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={draftValue}
                                        onChange={(e) => setDraftValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') commitDraft();
                                            if (e.key === 'Escape') setIsEditing(false);
                                        }}
                                        placeholder="Contoh: 1000000"
                                        className="tabular-nums h-9.5 w-40 rounded-full border border-brand bg-white/90 px-3.5 text-sm font-bold text-ink-primary shadow-2xs outline-none ring-2 ring-brand/20 dark:bg-white/15"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={commitDraft}
                                        data-variant="primary"
                                        className="mf-liquid-pill h-9.5 px-3.5 text-xs"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Simpan</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {targetBudget > 0 && (
                            <div className="rounded-2xl border border-black/6 bg-white/60 px-3 py-1.5 text-right backdrop-blur-md dark:border-white/10 dark:bg-white/6">
                                <span className="block text-[10px] font-bold tracking-wider text-ink-muted uppercase">
                                    {summary.isOverBudget ? 'Melebihi Target' : 'Sisa Anggaran'}
                                </span>
                                <p
                                    className={`tabular-nums text-sm font-extrabold ${summary.isOverBudget
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-emerald-600 dark:text-emerald-400'
                                        }`}
                                >
                                    {summary.isOverBudget ? '-' : '+'}
                                    {formatIdr(Math.abs(summary.remainingBudget))} (
                                    {summary.budgetUsagePercent}%)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Liquid Progress Bar */}
                    {targetBudget > 0 && (
                        <div className="mf-budget-track mt-3">
                            <div
                                data-state={budgetState}
                                className="mf-budget-fill"
                                style={{ width: `${progressWidth}%` }}
                            />
                        </div>
                    )}

                    {/* Quick Preset Pills */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {TARGET_CHIPS.map((presetAmount) => {
                            const isSelected = targetBudget === presetAmount;
                            return (
                                <button
                                    key={presetAmount}
                                    type="button"
                                    onClick={() => {
                                        onChangeTarget(presetAmount);
                                        setIsEditing(false);
                                    }}
                                    data-variant={isSelected ? 'primary' : undefined}
                                    className="mf-liquid-pill tabular-nums min-h-7.5 px-2.5 text-[11px]"
                                >
                                    {presetAmount === 0
                                        ? 'Tanpa Target'
                                        : formatCompactIdr(presetAmount)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};