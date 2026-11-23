// src/data/default-catalog.ts

import rawCatalog from './catalog-items.json';
import type { CatalogCategory, CatalogItem, MealBundle } from '../types/meal';

export interface CategoryMeta {
    readonly label: string;
    readonly dotColor: string;
    readonly badgeBg: string;
    readonly badgeText: string;
}

export const CATEGORY_META: Readonly<Record<CatalogCategory, CategoryMeta>> = {
    'staple-carb': {
        label: 'Karbohidrat Pokok',
        dotColor: 'bg-amber-500',
        badgeBg: 'border-amber-500/25 bg-amber-500/10',
        badgeText: 'text-amber-700 dark:text-amber-300',
    },
    'animal-protein': {
        label: 'Protein Hewani',
        dotColor: 'bg-rose-500',
        badgeBg: 'border-rose-500/25 bg-rose-500/10',
        badgeText: 'text-rose-700 dark:text-rose-300',
    },
    'plant-protein-veg': {
        label: 'Nabati & Sayur',
        dotColor: 'bg-emerald-500',
        badgeBg: 'border-emerald-500/25 bg-emerald-500/10',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
    },
    'pantry-seasoning': {
        label: 'Minyak & Bumbu',
        dotColor: 'bg-orange-500',
        badgeBg: 'border-orange-500/25 bg-orange-500/10',
        badgeText: 'text-orange-700 dark:text-orange-300',
    },
    'home-brew': {
        label: 'Minuman Harian',
        dotColor: 'bg-sky-500',
        badgeBg: 'border-sky-500/25 bg-sky-500/10',
        badgeText: 'text-sky-700 dark:text-sky-300',
    },
};

export const CATEGORY_LABELS: Readonly<Record<CatalogCategory, string>> = {
    'staple-carb': 'Karbohidrat Pokok',
    'animal-protein': 'Protein Hewani',
    'plant-protein-veg': 'Protein Nabati & Sayur',
    'pantry-seasoning': 'Minyak & Bumbu Dapur',
    'home-brew': 'Minuman Pokok Harian',
};

export const CATEGORY_ORDER: readonly CatalogCategory[] = [
    'staple-carb',
    'animal-protein',
    'plant-protein-veg',
    'pantry-seasoning',
    'home-brew',
];

export const DEFAULT_CATALOG: readonly CatalogItem[] =
    rawCatalog as readonly CatalogItem[];

export const DEFAULT_MEAL_BUNDLES: readonly MealBundle[] = [
    {
        id: 'bundle-nasi-telur-sayur',
        name: 'Nasi + Telur + Sayur',
        preferredPeriods: ['breakfast', 'lunch', 'dinner'],
        components: [
            { itemId: 'beras-putih', portions: 1 },
            { itemId: 'telur-ayam', portions: 1 },
            { itemId: 'sayur-harian', portions: 1 },
        ],
    },
    {
        id: 'bundle-nasi-ayam-sayur',
        name: 'Nasi + Ayam + Sayur',
        preferredPeriods: ['lunch', 'dinner'],
        components: [
            { itemId: 'beras-putih', portions: 1 },
            { itemId: 'ayam-potong', portions: 1 },
            { itemId: 'sayur-harian', portions: 1 },
        ],
    },
    {
        id: 'bundle-nasi-tempe-tahu',
        name: 'Nasi + Tempe + Tahu',
        preferredPeriods: ['lunch', 'dinner'],
        components: [
            { itemId: 'beras-putih', portions: 1 },
            { itemId: 'tempe-papan', portions: 1 },
            { itemId: 'tahu-putih', portions: 1 },
        ],
    },
];