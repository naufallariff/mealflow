// src/utils/budget-engine.ts

import type {
    BudgetSummary,
    CatalogItem,
    DaySchedule,
    GroceryLineItem,
    MealPeriod,
    MonthlySchedule,
} from '../types/meal';

const MEAL_PERIODS: readonly MealPeriod[] = ['breakfast', 'lunch', 'dinner'];

/**
 * Creates a clean empty schedule for 31 days (blank-slate default state).
 */
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

/**
 * Pure, deterministic engine that aggregates 31-day meal usage into
 * realistic retail pack quantities, checkout costs, and leftover stock projections.
 */
export function calculateBudgetSummary(
    schedule: MonthlySchedule,
    catalogMap: ReadonlyMap<string, CatalogItem>,
    targetBudget: number,
): BudgetSummary {
    const portionTotals = new Map<string, number>();

    for (const dayKey of Object.keys(schedule)) {
        const dayPlan = schedule[Number(dayKey)];
        if (!dayPlan) continue;

        for (const period of MEAL_PERIODS) {
            const entries = dayPlan[period];
            for (const entry of entries) {
                if (entry.portions <= 0) continue;
                const prev = portionTotals.get(entry.itemId) ?? 0;
                portionTotals.set(entry.itemId, prev + entry.portions);
            }
        }
    }

    const lineItems: GroceryLineItem[] = [];
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

        totalUsedPortions += usedPortions;
        totalConsumedCost += consumedCost;
        totalRetailCheckoutCost += retailCheckoutCost;

        if (item.kind === 'food') {
            foodCheckoutCost += retailCheckoutCost;
        } else {
            drinkCheckoutCost += retailCheckoutCost;
        }

        lineItems.push({
            item,
            usedPortions,
            consumedCost,
            packsToBuy,
            retailCheckoutCost,
            totalPurchasedPortions,
            leftoverPortions,
            utilizationPercent,
        });
    }

    // Sort highest retail expenditure first for immediate visibility
    lineItems.sort((a, b) => b.retailCheckoutCost - a.retailCheckoutCost);

    const safeTarget = Math.max(0, targetBudget);
    const totalLeftoverValue = Math.max(0, totalRetailCheckoutCost - totalConsumedCost);
    const remainingBudget = safeTarget > 0 ? safeTarget - totalRetailCheckoutCost : 0;
    const budgetUsagePercent =
        safeTarget > 0 ? Math.round((totalRetailCheckoutCost / safeTarget) * 100) : 0;

    return {
        lineItems,
        totalUsedPortions,
        totalConsumedCost,
        totalRetailCheckoutCost,
        totalLeftoverValue,
        foodCheckoutCost,
        drinkCheckoutCost,
        targetBudget: safeTarget,
        remainingBudget,
        budgetUsagePercent,
        isOverBudget: safeTarget > 0 && totalRetailCheckoutCost > safeTarget,
    };
}