// src/types/meal.ts

export type ItemKind = 'food' | 'drink';

export type FoodCategory =
    | 'raw-ingredient'
    | 'seasoning-pantry'
    | 'street-food'
    | 'fancy-mall';

export type DrinkCategory =
    | 'home-brew'
    | 'street-drink'
    | 'cafe-mall';

export type CatalogCategory = FoodCategory | DrinkCategory;

export type MealPeriod = 'breakfast' | 'lunch' | 'dinner';

export interface CatalogItem {
    readonly id: string;
    readonly name: string;
    readonly kind: ItemKind;
    readonly category: CatalogCategory;
    /** Retail purchase unit label, e.g. "1 Kg", "1 Ekor", "1 Porsi" */
    readonly packUnit: string;
    /** Retail price per purchase unit in IDR */
    readonly packPrice: number;
    /** How many meal portions one purchase unit yields */
    readonly portionsPerPack: number;
    /** Optional short note on prep or nutrition */
    readonly note?: string;
    /** True if created by the user */
    readonly isCustom?: boolean;
}

export interface ScheduledEntry {
    readonly itemId: string;
    /** Number of portions assigned to this slot (e.g., 1 for solo, 2 for two people) */
    readonly portions: number;
}

export type DaySchedule = Record<MealPeriod, readonly ScheduledEntry[]>;

/** Map of day number (1..31) to its three meal slots */
export type MonthlySchedule = Record<number, DaySchedule>;

export interface GroceryLineItem {
    readonly item: CatalogItem;
    readonly usedPortions: number;
    /** Exact pro-rata cost based on used portions */
    readonly consumedCost: number;
    /** Realistic retail packs needed (rounded up) */
    readonly packsToBuy: number;
    /** Total retail checkout cost for whole packs */
    readonly retailCheckoutCost: number;
    /** Total portions yielded by purchased packs */
    readonly totalPurchasedPortions: number;
    /** Remaining portions left in pantry at day 31 */
    readonly leftoverPortions: number;
    /** Percentage of purchased stock actually consumed (0..100) */
    readonly utilizationPercent: number;
}

export interface BudgetSummary {
    readonly lineItems: readonly GroceryLineItem[];
    readonly totalUsedPortions: number;
    readonly totalConsumedCost: number;
    readonly totalRetailCheckoutCost: number;
    readonly totalLeftoverValue: number;
    readonly foodCheckoutCost: number;
    readonly drinkCheckoutCost: number;
    readonly targetBudget: number;
    readonly remainingBudget: number;
    readonly budgetUsagePercent: number;
    readonly isOverBudget: boolean;
}