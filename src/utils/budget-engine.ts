// src/utils/budget-engine.ts

import type {
    BudgetSummary,
    CatalogCategory,
    CatalogItem,
    DaySchedule,
    GroceryLineItem,
    MealBundle,
    MealPeriod,
    MonthlySchedule,
    PantrySuggestion,
    ScheduledEntry,
    UnscheduledPortionMap,
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
 * Menghitung saran kebutuhan minyak goreng dan bumbu dasar secara otomatis
 * berdasarkan jumlah sesi masak bahan mentah (protein & sayur) dalam sebulan.
 */
function buildSmartPantrySuggestions(
    totalCookingSessions: number,
    hasExplicitPantryItems: boolean,
): readonly PantrySuggestion[] {
    if (totalCookingSessions <= 0 || hasExplicitPantryItems) {
        return [];
    }

    const suggestions: PantrySuggestion[] = [];

    // Estimasi rata-rata 15-20ml minyak per sesi masak rumahan
    if (totalCookingSessions >= 35) {
        suggestions.push({
            id: 'auto-minyak-2l',
            name: 'Minyak Goreng',
            recommendedPackLabel: '1 Pouch (2 Liter)',
            estimatedCost: 36000,
            reason: `Estimasi untuk ±${totalCookingSessions} sesi masak bahan segar`,
        });
    } else {
        suggestions.push({
            id: 'auto-minyak-1l',
            name: 'Minyak Goreng',
            recommendedPackLabel: '1 Pouch (1 Liter)',
            estimatedCost: 18500,
            reason: `Estimasi untuk ±${totalCookingSessions} sesi masak bahan segar`,
        });
    }

    suggestions.push({
        id: 'auto-bumbu-dasar',
        name: 'Bumbu Dasar (Garam, Gula, Bawang, Kecap)',
        recommendedPackLabel:
            totalCookingSessions >= 30 ? '1 Paket Lengkap Bulanan' : '1 Paket Hemat Kos',
        estimatedCost: totalCookingSessions >= 30 ? 35000 : 20000,
        reason: 'Kebutuhan penyedap & tumis proporsional intensitas masak',
    });

    return suggestions;
}

export function calculateBudgetSummary(
    schedule: MonthlySchedule,
    unscheduledMap: UnscheduledPortionMap,
    catalogMap: ReadonlyMap<string, CatalogItem>,
    bundleMap: ReadonlyMap<string, MealBundle>,
    targetBudget: number,
): BudgetSummary {
    const scheduledTotals = new Map<string, number>();
    const unscheduledTotals = new Map<string, number>();

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

    const expandEntryToItems = (
        entryId: string,
        multiplier: number,
    ): readonly { item: CatalogItem; portions: number }[] => {
        const directItem = catalogMap.get(entryId);
        if (directItem) {
            return [{ item: directItem, portions: multiplier }];
        }
        const bundle = bundleMap.get(entryId);
        if (bundle) {
            const expanded: { item: CatalogItem; portions: number }[] = [];
            for (const comp of bundle.components) {
                const compItem = catalogMap.get(comp.itemId);
                if (compItem && comp.portions > 0) {
                    expanded.push({
                        item: compItem,
                        portions: comp.portions * multiplier,
                    });
                }
            }
            return expanded;
        }
        return [];
    };

    let activeDaysCount = 0;

    // 1. Agregasi dari Kalender 31 Hari
    for (let day = 1; day <= 31; day += 1) {
        const dayPlan = schedule[day];
        if (!dayPlan) continue;

        const weekIdx = getWeekIndexForDay(day);
        let dayHasMenu = false;

        for (const period of MEAL_PERIODS) {
            for (const entry of dayPlan[period]) {
                if (entry.portions <= 0) continue;
                const resolvedList = expandEntryToItems(entry.itemId, entry.portions);
                if (resolvedList.length === 0) continue;

                dayHasMenu = true;
                for (const { item, portions } of resolvedList) {
                    scheduledTotals.set(
                        item.id,
                        (scheduledTotals.get(item.id) ?? 0) + portions,
                    );

                    const unitCost = item.packPrice / Math.max(1, item.portionsPerPack);
                    const slotCost = unitCost * portions;

                    periodConsumedCost[period] += slotCost;
                    weeklyAcc[weekIdx].totalPortions += portions;
                    weeklyAcc[weekIdx].consumedCost += slotCost;
                }
            }
        }

        if (dayHasMenu) {
            activeDaysCount += 1;
            weeklyAcc[weekIdx].activeDays += 1;
        }
    }

    // 2. Agregasi dari Frekuensi Bulanan Langsung (Spreadsheet Mode)
    for (const [entryId, count] of Object.entries(unscheduledMap)) {
        if (!Number.isFinite(count) || count <= 0) continue;
        const resolvedList = expandEntryToItems(entryId, count);
        for (const { item, portions } of resolvedList) {
            unscheduledTotals.set(
                item.id,
                (unscheduledTotals.get(item.id) ?? 0) + portions,
            );
        }
    }

    // 3. Gabungkan & Hitung Pembulatan Kemasan Ritel
    const allItemIds = new Set<string>([
        ...scheduledTotals.keys(),
        ...unscheduledTotals.keys(),
    ]);

    const lineItems: GroceryLineItem[] = [];
    const underutilizedItems: GroceryLineItem[] = [];
    const categoryCheckoutCost: Partial<Record<CatalogCategory, number>> = {};

    let totalUsedPortions = 0;
    let totalScheduledPortions = 0;
    let totalUnscheduledPortions = 0;
    let totalConsumedCost = 0;
    let totalRetailCheckoutCost = 0;
    let foodCheckoutCost = 0;
    let drinkCheckoutCost = 0;
    let totalCookingSessions = 0;
    let hasExplicitPantryItems = false;

    for (const itemId of allItemIds) {
        const item = catalogMap.get(itemId);
        if (!item) continue;

        const scheduledPortions = scheduledTotals.get(itemId) ?? 0;
        const unscheduledPortions = unscheduledTotals.get(itemId) ?? 0;
        const usedPortions = scheduledPortions + unscheduledPortions;
        if (usedPortions <= 0) continue;

        const safeYield = Math.max(1, item.portionsPerPack);
        const unitConsumptionPrice = Math.round(item.packPrice / safeYield);
        const consumedCost = Math.round((item.packPrice / safeYield) * usedPortions);
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
        totalScheduledPortions += scheduledPortions;
        totalUnscheduledPortions += unscheduledPortions;
        totalConsumedCost += consumedCost;
        totalRetailCheckoutCost += retailCheckoutCost;

        if (item.requiresCooking) {
            totalCookingSessions += usedPortions;
        }
        if (item.category === 'pantry-seasoning') {
            hasExplicitPantryItems = true;
        }

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
            unscheduledPortions,
            scheduledPortions,
            unitConsumptionPrice,
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

    const pantrySuggestions = buildSmartPantrySuggestions(
        totalCookingSessions,
        hasExplicitPantryItems,
    );
    const suggestedPantryTotalCost = pantrySuggestions.reduce(
        (sum, s) => sum + s.estimatedCost,
        0,
    );

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
        pantrySuggestions,
        suggestedPantryTotalCost,
        totalCookingSessions,
        totalUsedPortions,
        totalUnscheduledPortions,
        totalScheduledPortions,
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

/**
 * Menyebar porsi bulanan yang belum terjadwal secara merata ke kalender 31 hari.
 */
export function distributePortionsToSchedule(
    currentSchedule: MonthlySchedule,
    unscheduledMap: UnscheduledPortionMap,
    catalogMap: ReadonlyMap<string, CatalogItem>,
    bundleMap: ReadonlyMap<string, MealBundle>,
): MonthlySchedule {
    const next: Record<number, DaySchedule> = {};
    for (let day = 1; day <= 31; day += 1) {
        const existing = currentSchedule[day] ?? {
            breakfast: [],
            lunch: [],
            dinner: [],
        };
        next[day] = {
            breakfast: existing.breakfast.map((e) => ({ ...e })),
            lunch: existing.lunch.map((e) => ({ ...e })),
            dinner: existing.dinner.map((e) => ({ ...e })),
        };
    }

    for (const [entryId, totalToPlace] of Object.entries(unscheduledMap)) {
        if (!Number.isFinite(totalToPlace) || totalToPlace <= 0) continue;

        const item = catalogMap.get(entryId);
        const bundle = bundleMap.get(entryId);
        if (!item && !bundle) continue;

        const periods: readonly MealPeriod[] =
            item?.preferredPeriods && item.preferredPeriods.length > 0
                ? item.preferredPeriods
                : bundle?.preferredPeriods && bundle.preferredPeriods.length > 0
                    ? bundle.preferredPeriods
                    : ['lunch', 'dinner'];

        const count = Math.round(totalToPlace);
        const step = 31 / count;

        for (let i = 0; i < count; i += 1) {
            const day = Math.min(31, Math.max(1, Math.floor(i * step) + 1));
            const period = periods[i % periods.length];
            const slot = next[day][period] as ScheduledEntry[];
            const existingIdx = slot.findIndex((e) => e.itemId === entryId);

            if (existingIdx >= 0) {
                slot[existingIdx] = {
                    ...slot[existingIdx],
                    portions: slot[existingIdx].portions + 1,
                };
            } else {
                slot.push({ itemId: entryId, portions: 1 });
            }
        }
    }

    return next;
}