// src/types/meal.ts

export type ItemKind = 'food' | 'drink';

export type FoodCategory =
    | 'staple-carb'
    | 'animal-protein'
    | 'plant-protein-veg'
    | 'pantry-seasoning';

export type DrinkCategory = 'home-brew';

export type CatalogCategory = FoodCategory | DrinkCategory;

export type MealPeriod = 'breakfast' | 'lunch' | 'dinner';

/** Nilai gizi per 1 satuan konsumsi (disiapkan untuk fase UI nutrisi berikutnya) */
export interface NutritionMacro {
    readonly calories: number;
    readonly protein: number;
    readonly carbs: number;
    readonly fat: number;
}

export interface CatalogItem {
    readonly id: string;
    readonly name: string;
    readonly kind: ItemKind;
    readonly category: CatalogCategory;
    /** Takaran konsumsi terkecil yang tampil utama di katalog, mis. "1 porsi", "1 butir", "1 potong" */
    readonly consumptionUnit: string;
    /** Satuan kemasan beli di pasar/toko, mis. "1 Karung (5 Kg)", "1 Kg (±16 butir)" */
    readonly packUnit: string;
    /** Harga ritel per kemasan utuh dalam IDR */
    readonly packPrice: number;
    /** Jumlah takaran konsumsi yang dihasilkan dari 1 kemasan utuh */
    readonly portionsPerPack: number;
    /** True jika bahan mentah memerlukan minyak/bumbu masak dasar */
    readonly requiresCooking?: boolean;
    /** Waktu makan paling umum saat distribusi otomatis ke kalender */
    readonly preferredPeriods?: readonly MealPeriod[];
    /** Estimasi nutrisi per 1 consumptionUnit */
    readonly macros?: NutritionMacro;
    readonly note?: string;
    readonly isCustom?: boolean;
}

export interface BundleComponent {
    readonly itemId: string;
    readonly portions: number;
}

/** Paket masakan yang dapat diedit dan otomatis dipecah menjadi bahan baku di daftar belanja */
export interface MealBundle {
    readonly id: string;
    readonly name: string;
    readonly components: readonly BundleComponent[];
    readonly preferredPeriods?: readonly MealPeriod[];
    readonly isCustom?: boolean;
}

export interface ScheduledEntry {
    readonly itemId: string;
    readonly portions: number;
}

export type DaySchedule = Record<MealPeriod, readonly ScheduledEntry[]>;

/** Peta tanggal (1..31) ke tiga waktu makan */
export type MonthlySchedule = Record<number, DaySchedule>;

/** Peta itemId -> jumlah porsi bulanan yang belum ditempatkan ke tanggal spesifik */
export type UnscheduledPortionMap = Record<string, number>;

export interface GroceryLineItem {
    readonly item: CatalogItem;
    /** Total porsi kebutuhan sebulan (gabungan frekuensi langsung + jadwal kalender + pecahan bundle) */
    readonly usedPortions: number;
    /** Porsi yang berasal dari perencanaan frekuensi langsung (belum dijadwalkan ke tanggal) */
    readonly unscheduledPortions: number;
    /** Porsi yang sudah ditempatkan di kalender 31 hari */
    readonly scheduledPortions: number;
    /** Harga satuan per 1 consumptionUnit */
    readonly unitConsumptionPrice: number;
    /** Biaya pro-rata sesuai porsi yang dikonsumsi */
    readonly consumedCost: number;
    /** Jumlah kemasan utuh yang wajib dibeli di kasir */
    readonly packsToBuy: number;
    /** Total biaya kasir untuk membeli kemasan utuh */
    readonly retailCheckoutCost: number;
    /** Total porsi dari seluruh kemasan yang dibeli */
    readonly totalPurchasedPortions: number;
    /** Sisa stok porsi di akhir bulan */
    readonly leftoverPortions: number;
    /** Persentase efisiensi pemakaian kemasan (0..100) */
    readonly utilizationPercent: number;
    /** True jika sisa stok >= 50% dari 1 kemasan (risiko mubazir/busuk untuk anak kos) */
    readonly isLowUtilization: boolean;
}

export interface PantrySuggestion {
    readonly id: string;
    readonly name: string;
    readonly recommendedPackLabel: string;
    readonly estimatedCost: number;
    readonly reason: string;
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
    readonly pantrySuggestions: readonly PantrySuggestion[];
    readonly suggestedPantryTotalCost: number;
    readonly totalCookingSessions: number;
    readonly totalUsedPortions: number;
    readonly totalUnscheduledPortions: number;
    readonly totalScheduledPortions: number;
    readonly totalConsumedCost: number;
    readonly totalRetailCheckoutCost: number;
    readonly totalLeftoverValue: number;
    readonly foodCheckoutCost: number;
    readonly drinkCheckoutCost: number;
    readonly periodConsumedCost: Readonly<Record<MealPeriod, number>>;
    readonly categoryCheckoutCost: Readonly<Partial<Record<CatalogCategory, number>>>;
    readonly weeklyBreakdown: readonly WeeklyCostSummary[];
    readonly activeDaysCount: number;
    readonly averageDailyCost: number;
    readonly underutilizedItems: readonly GroceryLineItem[];
    readonly targetBudget: number;
    readonly remainingBudget: number;
    readonly budgetUsagePercent: number;
    readonly isOverBudget: boolean;
}