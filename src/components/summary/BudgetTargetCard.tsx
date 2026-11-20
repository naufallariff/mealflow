// src/components/summary/BudgetTargetCard.tsx

import React, { useState } from 'react';
import { Check, Pencil, SlidersHorizontal, Wallet } from 'lucide-react';
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

    return (
        <section className="rounded-2xl border border-[#E5E5EA] bg-white p-4 shadow-2xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {/* Metric 1: Realistic Retail Checkout */}
                <div className="rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] p-3">
                    <div className="flex items-center justify-between text-xs font-medium text-[#636366]">
                        <span>Belanja Realistis (Kemasan)</span>
                        <Wallet className="h-3.5 w-3.5 text-[#007AFF]" />
                    </div>
                    <p className="tabular-nums mt-1 text-lg font-bold tracking-tight text-[#1C1C1E] sm:text-xl">
                        {formatIdr(summary.totalRetailCheckoutCost)}
                    </p>
                    <p className="tabular-nums mt-0.5 text-[11px] text-[#636366]">
                        {summary.lineItems.length} item · {summary.totalUsedPortions} porsi
                    </p>
                </div>

                {/* Metric 2: Consumed Pro-rata & Leftover Pantry Value */}
                <div className="rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] p-3">
                    <div className="flex items-center justify-between text-xs font-medium text-[#636366]">
                        <span>Terpakai vs Sisa Stok</span>
                        <SlidersHorizontal className="h-3.5 w-3.5 text-[#34C759]" />
                    </div>
                    <p className="tabular-nums mt-1 text-lg font-bold tracking-tight text-[#1C1C1E] sm:text-xl">
                        {formatIdr(summary.totalConsumedCost)}
                    </p>
                    <p className="tabular-nums mt-0.5 text-[11px] text-[#34C759] font-medium">
                        Nilai sisa pantry: {formatIdr(summary.totalLeftoverValue)}
                    </p>
                </div>

                {/* Metric 3 & 4: Target Budget Controller */}
                <div className="rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] p-3 sm:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <span className="text-xs font-medium text-[#636366]">
                                Target Anggaran Bulanan
                            </span>
                            {!isEditing ? (
                                <div className="mt-0.5 flex items-center gap-2">
                                    <span className="tabular-nums text-lg font-bold text-[#1C1C1E] sm:text-xl">
                                        {targetBudget > 0 ? formatIdr(targetBudget) : 'Tanpa Target (Rp 0)'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={openEditor}
                                        className="inline-flex min-h-7.5 items-center gap-1 rounded-lg border border-[#E5E5EA] bg-white px-2.5 py-1 text-xs font-medium text-[#007AFF] hover:bg-[#F2F2F7] active:scale-[0.97]"
                                    >
                                        <Pencil className="h-3 w-3" />
                                        <span>Atur</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-1 flex items-center gap-1.5">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={draftValue}
                                        onChange={(e) => setDraftValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && commitDraft()}
                                        placeholder="Contoh: 800000"
                                        className="tabular-nums h-9 w-36 rounded-lg border border-[#007AFF] bg-white px-2.5 text-sm font-semibold text-[#1C1C1E] outline-none"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={commitDraft}
                                        className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#007AFF] px-3 text-xs font-semibold text-white active:scale-[0.97]"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Simpan</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {targetBudget > 0 && (
                            <div className="text-right">
                                <span className="text-[11px] font-medium text-[#636366]">
                                    {summary.isOverBudget ? 'Melebihi Target' : 'Sisa Anggaran'}
                                </span>
                                <p
                                    className={`tabular-nums text-sm font-bold ${summary.isOverBudget ? 'text-[#FF3B30]' : 'text-[#34C759]'
                                        }`}
                                >
                                    {summary.isOverBudget ? '-' : '+'}
                                    {formatIdr(Math.abs(summary.remainingBudget))} ({summary.budgetUsagePercent}%)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar & Quick Preset Chips */}
                    {targetBudget > 0 && (
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E5EA]">
                            <div
                                className={`h-full rounded-full transition-all duration-200 ${summary.isOverBudget ? 'bg-[#FF3B30]' : 'bg-[#34C759]'
                                    }`}
                                style={{ width: `${progressWidth}%` }}
                            />
                        </div>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
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
                                    className={`tabular-nums rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors active:scale-[0.97] ${isSelected
                                            ? 'border-[#007AFF] bg-[#007AFF] text-white'
                                            : 'border-[#E5E5EA] bg-white text-[#636366] hover:bg-[#F2F2F7]'
                                        }`}
                                >
                                    {presetAmount === 0 ? 'Tanpa Target' : formatCompactIdr(presetAmount)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};