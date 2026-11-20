// src/components/summary/BudgetTargetCard.tsx

import React, { useState } from 'react';
import {
    Check,
    ChevronDown,
    ChevronUp,
    Pencil,
    SlidersHorizontal,
    Target,
    Wallet,
} from 'lucide-react';
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
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const [draftValue, setDraftValue] = useState(String(targetBudget));

    const openEditor = () => {
        setDraftValue(targetBudget > 0 ? String(targetBudget) : '');
        setIsEditing(true);
        setIsMobileExpanded(true);
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
            aria-label="Ringkasan Anggaran Bulanan"
            className="mf-glass-panel p-3.5 sm:p-5"
        >
            {/* Mobile Compact Summary Header (< 1024px) */}
            <div className="flex items-center justify-between gap-3 lg:hidden">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="mf-eyebrow">Estimasi Belanja</span>
                        {targetBudget > 0 && (
                            <span
                                className={`tabular-nums rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${summary.isOverBudget
                                        ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                    }`}
                            >
                                {summary.budgetUsagePercent}%
                            </span>
                        )}
                    </div>
                    <p className="tabular-nums mt-0.5 text-lg font-extrabold tracking-tight text-ink-primary">
                        {formatIdr(summary.totalRetailCheckoutCost)}
                    </p>
                    <p className="tabular-nums text-[11px] font-medium text-ink-muted">
                        Terpakai {formatCompactIdr(summary.totalConsumedCost)} · Sisa stok{' '}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCompactIdr(summary.totalLeftoverValue)}
                        </span>
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsMobileExpanded((prev) => !prev)}
                    aria-expanded={isMobileExpanded}
                    className="mf-liquid-pill h-8.5 shrink-0 px-3 text-xs font-bold text-brand"
                >
                    <span>{isMobileExpanded ? 'Tutup' : 'Target'}</span>
                    {isMobileExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>

            {/* Symmetric 3-Column Bento Row (Aligns with 3-Column Desktop Workspace) */}
            <div
                className={`${isMobileExpanded ? 'mt-3.5 grid' : 'hidden lg:grid'
                    } grid-cols-1 gap-3.5 lg:grid-cols-3`}
            >
                {/* Column 1: Estimasi Belanja */}
                <div className="mf-glass-card hidden flex-col justify-between p-4 lg:flex">
                    <div className="flex items-center justify-between gap-2">
                        <span className="mf-eyebrow">Estimasi Belanja</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-brand-glass text-brand">
                            <Wallet className="h-3.5 w-3.5" />
                        </div>
                    </div>

                    <p className="mf-kpi-number mt-2">
                        {formatIdr(summary.totalRetailCheckoutCost)}
                    </p>

                    <p className="tabular-nums mt-1.5 text-xs font-medium text-ink-muted">
                        <strong className="font-bold text-ink-secondary">
                            {summary.lineItems.length}
                        </strong>{' '}
                        kemasan ·{' '}
                        <strong className="font-bold text-ink-secondary">
                            {summary.totalUsedPortions}
                        </strong>{' '}
                        porsi ({summary.activeDaysCount} hari)
                    </p>
                </div>

                {/* Column 2: Konsumsi Terjadwal */}
                <div className="mf-glass-card hidden flex-col justify-between p-4 lg:flex">
                    <div className="flex items-center justify-between gap-2">
                        <span className="mf-eyebrow">Konsumsi Terjadwal</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-afternoon-glass text-afternoon-fg">
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                        </div>
                    </div>

                    <p className="mf-kpi-number mt-2">
                        {formatIdr(summary.totalConsumedCost)}
                    </p>

                    <p className="tabular-nums mt-1.5 text-xs font-medium text-ink-muted">
                        Rata-rata{' '}
                        <strong className="font-bold text-ink-secondary">
                            {formatCompactIdr(summary.averageDailyCost)}/hari
                        </strong>{' '}
                        · Sisa{' '}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCompactIdr(summary.totalLeftoverValue)}
                        </span>
                    </p>
                </div>

                {/* Column 3: Target Anggaran Bulanan */}
                <div className="mf-glass-card flex flex-col justify-between p-3.5 sm:p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5 shrink-0 text-brand" />
                                <span className="mf-eyebrow">Target Anggaran</span>
                            </div>

                            {!isEditing ? (
                                <div className="mt-1.5 flex items-center gap-2">
                                    <span className="mf-kpi-number truncate">
                                        {targetBudget > 0
                                            ? formatIdr(targetBudget)
                                            : 'Tanpa Target'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={openEditor}
                                        className="mf-liquid-pill h-7.5 shrink-0 px-2.5 text-[11px] text-brand"
                                    >
                                        <Pencil className="h-3 w-3" />
                                        <span>Ubah</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-1.5 flex items-center gap-1.5">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={draftValue}
                                        onChange={(e) => setDraftValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') commitDraft();
                                            if (e.key === 'Escape') setIsEditing(false);
                                        }}
                                        placeholder="1000000"
                                        className="tabular-nums h-8.5 w-32 rounded-full border border-brand bg-(--glass-card-subtle) px-3 text-xs font-bold text-ink-primary outline-none ring-2 ring-brand/20"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={commitDraft}
                                        data-variant="primary"
                                        className="mf-liquid-pill h-8.5 px-3 text-xs"
                                    >
                                        <Check className="h-3.5 w-3.5" />
                                        <span>Simpan</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {targetBudget > 0 && (
                            <span
                                className={`tabular-nums shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${summary.isOverBudget
                                        ? 'bg-red-500/12 text-red-600 dark:text-red-400'
                                        : 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400'
                                    }`}
                            >
                                {summary.isOverBudget ? 'Lebih ' : 'Sisa '}
                                {formatCompactIdr(Math.abs(summary.remainingBudget))}
                            </span>
                        )}
                    </div>

                    {targetBudget > 0 && (
                        <div className="mf-budget-track mt-2.5">
                            <div
                                data-state={budgetState}
                                className="mf-budget-fill"
                                style={{ width: `${progressWidth}%` }}
                            />
                        </div>
                    )}

                    {/* Symmetrical 5-Column Preset Chips */}
                    <div className="mt-2.5 grid grid-cols-5 gap-1">
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
                                    className="mf-liquid-pill tabular-nums h-7.5 w-full px-1 text-[10px] sm:text-[11px]"
                                >
                                    {presetAmount === 0
                                        ? 'Bebas'
                                        : formatCompactIdr(presetAmount).replace('Rp ', '')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};