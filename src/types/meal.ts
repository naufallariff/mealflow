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
    /** Satuan beli ritel, mis. "1 Kg", "1 Ekor", "1 Porsi" */
    readonly packUnit: string;
    /** Harga ritel per satuan beli dalam IDR */
    readonly packPrice: number;
    /** Jumlah porsi yang dihasilkan dari 1 kemasan */
    readonly portionsPerPack: number;
    /** Catatan opsional terkait persiapan atau nutrisi */
    readonly note?: string;
    /** True jika dibuat sendiri oleh pengguna */
    readonly isCustom?: boolean;
}

export interface ScheduledEntry {
    readonly itemId: string;
    /** Jumlah porsi pada slot ini (mis. 1 untuk sendiri, 2 untuk berdua) */
    readonly portions: number;
}

export type DaySchedule = Record<MealPeriod, readonly ScheduledEntry[]>;

/** Peta tanggal (1..31) ke tiga waktu makan */
export type MonthlySchedule = Record<number, DaySchedule>;

export interface GroceryLineItem {
    readonly item: CatalogItem;
    readonly usedPortions: number;
    /** Biaya pro-rata sesuai porsi yang benar-benar dimakan */
    readonly consumedCost: number;
    /** Jumlah kemasan utuh yang wajib dibeli (dibulatkan ke atas) */
    readonly packsToBuy: number;
    /** Total biaya kasir untuk membeli kemasan utuh */
    readonly retailCheckoutCost: number;
    /** Total porsi dari kemasan yang dibeli */
    readonly totalPurchasedPortions: number;
    /** Sisa porsi stok di akhir hari ke-31 */
    readonly leftoverPortions: number;
    /** Persentase efisiensi pemakaian stok (0..100) */
    readonly utilizationPercent: number;
    /** True jika sisa stok >= 50% dari 1 kemasan (potensi mubazir) */
    readonly isLowUtilization: boolean;
}

export interface WeeklyCostSummary {
    readonly week: number;
    readonly label: string;
    readonly activeDays: number;
    readonly totalPortions: number;
    readonly consumedCost: number;
}

export interface BudgetSummary {
    readonly lineItems: readonly GroceryLineItem[];
    readonly totalUsedPortions: number;
    readonly totalConsumedCost: number;
    readonly totalRetailCheckoutCost: number;
    readonly totalLeftoverValue: number;
    readonly foodCheckoutCost: number;
    readonly drinkCheckoutCost: number;
    /** Distribusi biaya pro-rata per waktu makan (Pagi, Siang, Malam) */
    readonly periodConsumedCost: Readonly<Record<MealPeriod, number>>;
    /** Distribusi biaya kasir per kategori bahan */
    readonly categoryCheckoutCost: Readonly<Partial<Record<CatalogCategory, number>>>;
    /** Ringkasan biaya & porsi per minggu (Minggu 1..5) */
    readonly weeklyBreakdown: readonly WeeklyCostSummary[];
    /** Jumlah hari (1..31) yang sudah terisi minimal 1 menu */
    readonly activeDaysCount: number;
    /** Rata-rata biaya pro-rata per hari aktif */
    readonly averageDailyCost: number;
    /** Daftar bahan dengan efisiensi pemakaian rendah (< 50%) */
    readonly underutilizedItems: readonly GroceryLineItem[];
    readonly targetBudget: number;
    readonly remainingBudget: number;
    readonly budgetUsagePercent: number;
    readonly isOverBudget: boolean;
}