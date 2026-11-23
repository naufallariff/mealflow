// src/utils/export-and-nutrition.ts

import type { BudgetSummary } from '../types/meal';
import { formatRupiah } from './format';

export interface DailyNutritionSummary {
    readonly avgDailyCalories: number;
    readonly avgDailyProtein: number;
    readonly avgDailyCarbs: number;
    readonly avgDailyFat: number;
    readonly coveredItemsCount: number;
}

export function calculateDailyNutritionAverage(
    summary: BudgetSummary,
    days = 31,
): DailyNutritionSummary {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let coveredItemsCount = 0;

    for (const line of summary.lineItems) {
        const macros = line.item.macros;
        if (!macros) continue;
        coveredItemsCount += 1;
        totalCalories += macros.calories * line.usedPortions;
        totalProtein += macros.protein * line.usedPortions;
        totalCarbs += macros.carbs * line.usedPortions;
        totalFat += macros.fat * line.usedPortions;
    }

    const safeDays = Math.max(1, days);
    return {
        avgDailyCalories: Math.round(totalCalories / safeDays),
        avgDailyProtein: Math.round(totalProtein / safeDays),
        avgDailyCarbs: Math.round(totalCarbs / safeDays),
        avgDailyFat: Math.round(totalFat / safeDays),
        coveredItemsCount,
    };
}

export function formatShoppingListPlainText(
    summary: BudgetSummary,
    checkedItemIds: readonly string[] = [],
): string {
    const checkedSet = new Set(checkedItemIds);
    const grandTotal =
        summary.totalRetailCheckoutCost + summary.suggestedPantryTotalCost;

    const lines: string[] = [
        'DAFTAR BELANJA POKOK BULANAN (MEALFLOW)',
        `Estimasi Total Kasir: ${formatRupiah(grandTotal)}`,
        '----------------------------------------',
    ];

    for (const line of summary.lineItems) {
        const mark = checkedSet.has(line.item.id) ? '[x]' : '[ ]';
        lines.push(
            `${mark} ${line.item.name}: ${line.packsToBuy} x ${line.item.packUnit} = ${formatRupiah(line.retailCheckoutCost)}`,
        );
    }

    if (summary.pantrySuggestions.length > 0) {
        lines.push('');
        lines.push('SARAN MINYAK & BUMBU:');
        for (const pantry of summary.pantrySuggestions) {
            lines.push(
                `[ ] ${pantry.name} (${pantry.recommendedPackLabel}) = ${formatRupiah(pantry.estimatedCost)}`,
            );
        }
    }

    lines.push('----------------------------------------');
    lines.push(`Nilai Porsi Terpakai: ${formatRupiah(summary.totalConsumedCost)}`);
    if (summary.totalLeftoverValue > 0) {
        lines.push(
            `Estimasi Nilai Sisa Stok: ${formatRupiah(summary.totalLeftoverValue)}`,
        );
    }

    return lines.join('\n');
}