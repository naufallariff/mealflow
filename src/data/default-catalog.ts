// src/data/default-catalog.ts

import type { CatalogCategory, CatalogItem, MealPeriod } from '../types/meal';
import rawCatalogItems from './catalog-items.json';
import rawWeeklyPresets from './weekly-presets.json';

export const CATEGORY_META: Record<
    CatalogCategory,
    {
        readonly label: string;
        readonly badgeBg: string;
        readonly badgeText: string;
        readonly dotColor: string;
    }
> = {
    'raw-ingredient': {
        label: 'Bahan Segar',
        badgeBg: 'bg-emerald-500/14 border-emerald-500/25',
        badgeText: 'text-emerald-800 dark:text-emerald-300',
        dotColor: 'bg-emerald-500',
    },
    'seasoning-pantry': {
        label: 'Bumbu & Pokok',
        badgeBg: 'bg-amber-500/14 border-amber-500/25',
        badgeText: 'text-amber-800 dark:text-amber-300',
        dotColor: 'bg-amber-500',
    },
    'street-food': {
        label: 'Masakan Harian',
        badgeBg: 'bg-rose-500/14 border-rose-500/25',
        badgeText: 'text-rose-800 dark:text-rose-300',
        dotColor: 'bg-rose-500',
    },
    'fancy-mall': {
        label: 'Restoran & Kafe',
        badgeBg: 'bg-purple-500/14 border-purple-500/25',
        badgeText: 'text-purple-800 dark:text-purple-300',
        dotColor: 'bg-purple-500',
    },
    'home-brew': {
        label: 'Seduh Mandiri',
        badgeBg: 'bg-sky-500/14 border-sky-500/25',
        badgeText: 'text-sky-800 dark:text-sky-300',
        dotColor: 'bg-sky-500',
    },
    'street-drink': {
        label: 'Minuman Harian',
        badgeBg: 'bg-teal-500/14 border-teal-500/25',
        badgeText: 'text-teal-800 dark:text-teal-300',
        dotColor: 'bg-teal-500',
    },
    'cafe-mall': {
        label: 'Kafe & Kedai',
        badgeBg: 'bg-indigo-500/14 border-indigo-500/25',
        badgeText: 'text-indigo-800 dark:text-indigo-300',
        dotColor: 'bg-indigo-500',
    },
};

export interface WeeklyPatternPreset {
    readonly id: string;
    readonly name: string;
    readonly subtitle: string;
    readonly pattern: Record<
        number,
        Record<MealPeriod, readonly { readonly itemId: string; readonly portions: number }[]>
    >;
}

export const DEFAULT_CATALOG = rawCatalogItems as readonly CatalogItem[];
export const WEEKLY_PRESETS = rawWeeklyPresets as readonly WeeklyPatternPreset[];