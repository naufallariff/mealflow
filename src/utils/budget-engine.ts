// src/utils/budget-engine.ts

import type {
    BudgetSummary,
    CatalogCategory,
    CatalogItem,
    DaySchedule,
    GroceryLineItem,
    MealPeriod,
    MonthlySchedule,
    WeeklyCostSummary,
} from '../types/meal';

const MEAL_PERIODS: readonly MealPeriod[] = ['breakfast', 'lunch', 'dinner'];

const WEEK_DEFINITIONS: readonly {
    readonly week: number;
    readonly label: string;
    readonly startDay: number;
    readonly endDay: number;
}[] = [
        { week: 1, label: 'Minggu 1 (1–7)', startDay: 1, endDay: 7 },
        { week: 2, label: 'Minggu 2 (8–14)', startDay: 8, endDay: 14 },
        { week: 3, label: 'Minggu 3 (15–21)', startDay: 15, endDay: 21 },
        { week: 4, label: 'Minggu 4 (22–28)', startDay: 22, endDay: 28 },
        { week: 5, label: 'Minggu 5 (29–31)', startDay: 29, endDay: 31 },
    ];

export function createEmptyMonthlySchedule(days = 31): MonthlySchedule {
    const schedule: Record<number, DaySchedule> = {};
    for (let day = 1; day <= days; day += 1) {
        schedule[day] = {
            breakfast: [],
            lunch: [],
            dinner: [],
        };
    }
    return schedule;
}

function getWeekIndexForDay(day: number): number {
    if (day <= 7) return 0;
    if (day <= 14) return 1;
    if (day <= 21) return 2;
    if (day <= 28) return 3;
    return 4;
}

/**
 * Engine deterministik single-pass O(N) untuk mengagregasi jadwal 31 hari
 * menjadi kebutuhan kemasan ritel, biaya kasir, sisa stok, dan analitik mingguan.
 */
export function calculateBudgetSummary(
    schedule: MonthlySchedule,
    catalogMap: ReadonlyMap<string, CatalogItem>,
    targetBudget: number,
): BudgetSummary {
    const portionTotals = new Map<string, number>();
    const periodConsumedCost: Record<MealPeriod, number> = {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
    };

    const weeklyAcc = WEEK_DEFINITIONS.map((w) => ({
        week: w.week,
        label: w.label,
        activeDays: 0,
        totalPortions: 0,
        consumedCost: 0,
    }));

    let activeDaysCount = 0;

    for (let day = 1; day <= 31; day += 1) {
        const dayPlan = schedule[day];
        if (!dayPlan) continue;

        const weekIdx = getWeekIndexForDay(day);
        let dayHasMenu = false;

        for (const period of MEAL_PERIODS) {
            const entries = dayPlan[period];
            for (const entry of entries) {
                if (entry.portions <= 0) continue;
                const item = catalogMap.get(entry.itemId);
                if (!item) continue;

                dayHasMenu = true;
                portionTotals.set(
                    entry.itemId,
                    (portionTotals.get(entry.itemId) ?? 0) + entry.portions,
                );

                const unitCost = item.packPrice / Math.max(1, item.portionsPerPack);
                const slotCost = unitCost * entry.portions;

                periodConsumedCost[period] += slotCost;
                weeklyAcc[weekIdx].totalPortions += entry.portions;
                weeklyAcc[weekIdx].consumedCost += slotCost;
            }
        }

        if (dayHasMenu) {
            activeDaysCount += 1;
            weeklyAcc[weekIdx].activeDays += 1;
        }
    }

    const lineItems: GroceryLineItem[] = [];
    const underutilizedItems: GroceryLineItem[] = [];
    const categoryCheckoutCost: Partial<Record<CatalogCategory, number>> = {};

    let totalUsedPortions = 0;
    let totalConsumedCost = 0;
    let totalRetailCheckoutCost = 0;
    let foodCheckoutCost = 0;
    let drinkCheckoutCost = 0;

    for (const [itemId, usedPortions] of portionTotals.entries()) {
        const item = catalogMap.get(itemId);
        if (!item || usedPortions <= 0) continue;

        const safeYield = Math.max(1, item.portionsPerPack);
        const unitPortionCost = item.packPrice / safeYield;
        const consumedCost = Math.round(unitPortionCost * usedPortions);
        const packsToBuy = Math.ceil(usedPortions / safeYield);
        const retailCheckoutCost = packsToBuy * item.packPrice;
        const totalPurchasedPortions = packsToBuy * safeYield;
        const leftoverPortions = Math.max(0, totalPurchasedPortions - usedPortions);
        const utilizationPercent = Math.min(
            100,
            Math.round((usedPortions / totalPurchasedPortions) * 100),
        );
        const isLowUtilization = safeYield > 1 && utilizationPercent < 50;

        totalUsedPortions += usedPortions;
        totalConsumedCost += consumedCost;
        totalRetailCheckoutCost += retailCheckoutCost;

        if (item.kind === 'food') {
            foodCheckoutCost += retailCheckoutCost;
        } else {
            drinkCheckoutCost += retailCheckoutCost;
        }

        categoryCheckoutCost[item.category] =
            (categoryCheckoutCost[item.category] ?? 0) + retailCheckoutCost;

        const line: GroceryLineItem = {
            item,
            usedPortions,
            consumedCost,
            packsToBuy,
            retailCheckoutCost,
            totalPurchasedPortions,
            leftoverPortions,
            utilizationPercent,
            isLowUtilization,
        };

        lineItems.push(line);
        if (isLowUtilization) {
            underutilizedItems.push(line);
        }
    }

    lineItems.sort((a, b) => b.retailCheckoutCost - a.retailCheckoutCost);
    underutilizedItems.sort((a, b) => a.utilizationPercent - b.utilizationPercent);

    const weeklyBreakdown: WeeklyCostSummary[] = weeklyAcc.map((w) => ({
        week: w.week,
        label: w.label,
        activeDays: w.activeDays,
        totalPortions: w.totalPortions,
        consumedCost: Math.round(w.consumedCost),
    }));

    const safeTarget = Math.max(0, targetBudget);
    const totalLeftoverValue = Math.max(0, totalRetailCheckoutCost - totalConsumedCost);
    const remainingBudget = safeTarget > 0 ? safeTarget - totalRetailCheckoutCost : 0;
    const budgetUsagePercent =
        safeTarget > 0 ? Math.round((totalRetailCheckoutCost / safeTarget) * 100) : 0;
    const averageDailyCost =
        activeDaysCount > 0 ? Math.round(totalConsumedCost / activeDaysCount) : 0;

    return {
        lineItems,
        totalUsedPortions,
        totalConsumedCost,
        totalRetailCheckoutCost,
        totalLeftoverValue,
        foodCheckoutCost,
        drinkCheckoutCost,
        periodConsumedCost: {
            breakfast: Math.round(periodConsumedCost.breakfast),
            lunch: Math.round(periodConsumedCost.lunch),
            dinner: Math.round(periodConsumedCost.dinner),
        },
        categoryCheckoutCost,
        weeklyBreakdown,
        activeDaysCount,
        averageDailyCost,
        underutilizedItems,
        targetBudget: safeTarget,
        remainingBudget,
        budgetUsagePercent,
        isOverBudget: safeTarget > 0 && totalRetailCheckoutCost > safeTarget,
    };
}