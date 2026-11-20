// src/services/storage-engine.ts

import type {
    CatalogCategory,
    CatalogItem,
    DaySchedule,
    MealPeriod,
    MonthlySchedule,
    ScheduledEntry,
} from '../types/meal';
import { createEmptyMonthlySchedule } from '../utils/budget-engine';

export interface MealflowPersistedState {
    readonly schemaVersion: 2;
    readonly updatedAt: string;
    readonly targetBudget: number;
    readonly activeWeek: number;
    readonly schedule: MonthlySchedule;
    /** Delta perubahan pada item katalog bawaan (harga, porsi, nama, kategori) */
    readonly catalogOverrides: Record<string, Partial<CatalogItem>>;
    /** Item katalog tambahan yang dibuat sendiri oleh pengguna */
    readonly customItems: readonly CatalogItem[];
    /** Daftar ID item bawaan yang disembunyikan oleh pengguna */
    readonly hiddenItemIds: readonly string[];
}

const STORAGE_KEY = 'mealflow.workspace.v2';
const VALID_CATEGORIES = new Set<CatalogCategory>([
    'raw-ingredient',
    'seasoning-pantry',
    'street-food',
    'fancy-mall',
    'home-brew',
    'street-drink',
    'cafe-mall',
]);

let pendingWriteTimer: number | null = null;
let latestQueuedState: MealflowPersistedState | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeEntries(raw: unknown): ScheduledEntry[] {
    if (!Array.isArray(raw)) return [];
    const result: ScheduledEntry[] = [];
    for (const entry of raw) {
        if (!isRecord(entry)) continue;
        if (typeof entry.itemId !== 'string' || entry.itemId.trim() === '') continue;
        const portions =
            typeof entry.portions === 'number' && Number.isFinite(entry.portions)
                ? Math.max(1, Math.min(99, Math.round(entry.portions)))
                : 1;
        result.push({ itemId: entry.itemId, portions });
    }
    return result;
}

export function sanitizeSchedule(raw: unknown): MonthlySchedule {
    const base = createEmptyMonthlySchedule(31);
    if (!isRecord(raw)) return base;

    const periods: readonly MealPeriod[] = ['breakfast', 'lunch', 'dinner'];
    const next: Record<number, DaySchedule> = { ...base };

    for (let day = 1; day <= 31; day += 1) {
        const dayRaw = raw[String(day)];
        if (!isRecord(dayRaw)) continue;
        next[day] = {
            breakfast: sanitizeEntries(dayRaw[periods[0]]),
            lunch: sanitizeEntries(dayRaw[periods[1]]),
            dinner: sanitizeEntries(dayRaw[periods[2]]),
        };
    }
    return next;
}

function sanitizeCatalogPatch(raw: unknown): Partial<CatalogItem> | null {
    if (!isRecord(raw)) return null;
    const patch: Record<string, unknown> = {};

    if (typeof raw.name === 'string' && raw.name.trim().length > 0) {
        patch.name = raw.name.trim().slice(0, 80);
    }
    if (typeof raw.packUnit === 'string' && raw.packUnit.trim().length > 0) {
        patch.packUnit = raw.packUnit.trim().slice(0, 32);
    }
    if (
        typeof raw.packPrice === 'number' &&
        Number.isFinite(raw.packPrice) &&
        raw.packPrice >= 0
    ) {
        patch.packPrice = Math.round(raw.packPrice);
    }
    if (
        typeof raw.portionsPerPack === 'number' &&
        Number.isFinite(raw.portionsPerPack) &&
        raw.portionsPerPack >= 1
    ) {
        patch.portionsPerPack = Math.min(500, Math.round(raw.portionsPerPack));
    }
    if (
        typeof raw.category === 'string' &&
        VALID_CATEGORIES.has(raw.category as CatalogCategory)
    ) {
        patch.category = raw.category as CatalogCategory;
    }
    if (typeof raw.note === 'string') {
        patch.note = raw.note.trim().slice(0, 140);
    }

    return Object.keys(patch).length > 0 ? (patch as Partial<CatalogItem>) : null;
}

function sanitizeCustomItem(raw: unknown): CatalogItem | null {
    if (!isRecord(raw)) return null;
    if (typeof raw.id !== 'string' || !raw.id.trim()) return null;
    if (typeof raw.name !== 'string' || !raw.name.trim()) return null;
    if (raw.kind !== 'food' && raw.kind !== 'drink') return null;
    if (
        typeof raw.category !== 'string' ||
        !VALID_CATEGORIES.has(raw.category as CatalogCategory)
    ) {
        return null;
    }

    const packPrice =
        typeof raw.packPrice === 'number' && Number.isFinite(raw.packPrice)
            ? Math.max(0, Math.round(raw.packPrice))
            : 0;
    const portionsPerPack =
        typeof raw.portionsPerPack === 'number' && Number.isFinite(raw.portionsPerPack)
            ? Math.max(1, Math.min(500, Math.round(raw.portionsPerPack)))
            : 1;

    return {
        id: raw.id.trim(),
        name: raw.name.trim().slice(0, 80),
        kind: raw.kind,
        category: raw.category as CatalogCategory,
        packUnit:
            typeof raw.packUnit === 'string' && raw.packUnit.trim()
                ? raw.packUnit.trim().slice(0, 32)
                : '1 Porsi',
        packPrice,
        portionsPerPack,
        note: typeof raw.note === 'string' ? raw.note.trim().slice(0, 140) : undefined,
        isCustom: true,
    };
}

export function parseWorkspacePayload(
    rawText: string,
): Partial<MealflowPersistedState> | null {
    try {
        const parsed: unknown = JSON.parse(rawText);
        if (!isRecord(parsed)) return null;

        const overrides: Record<string, Partial<CatalogItem>> = {};
        if (isRecord(parsed.catalogOverrides)) {
            for (const [key, val] of Object.entries(parsed.catalogOverrides)) {
                const cleanPatch = sanitizeCatalogPatch(val);
                if (cleanPatch) overrides[key] = cleanPatch;
            }
        }

        const customItems: CatalogItem[] = [];
        if (Array.isArray(parsed.customItems)) {
            for (const item of parsed.customItems) {
                const cleanItem = sanitizeCustomItem(item);
                if (cleanItem) customItems.push(cleanItem);
            }
        }

        return {
            schemaVersion: 2,
            updatedAt:
                typeof parsed.updatedAt === 'string'
                    ? parsed.updatedAt
                    : new Date().toISOString(),
            targetBudget:
                typeof parsed.targetBudget === 'number' &&
                    Number.isFinite(parsed.targetBudget)
                    ? Math.max(0, Math.round(parsed.targetBudget))
                    : undefined,
            activeWeek:
                typeof parsed.activeWeek === 'number' &&
                    parsed.activeWeek >= 1 &&
                    parsed.activeWeek <= 5
                    ? Math.round(parsed.activeWeek)
                    : undefined,
            schedule: isRecord(parsed.schedule)
                ? sanitizeSchedule(parsed.schedule)
                : undefined,
            catalogOverrides: overrides,
            customItems,
            hiddenItemIds: Array.isArray(parsed.hiddenItemIds)
                ? parsed.hiddenItemIds.filter((id): id is string => typeof id === 'string')
                : [],
        };
    } catch {
        return null;
    }
}

export function loadWorkspaceState(): Partial<MealflowPersistedState> | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return parseWorkspacePayload(raw);
    } catch {
        return null;
    }
}

export function flushWorkspaceSave(): void {
    if (pendingWriteTimer !== null) {
        window.clearTimeout(pendingWriteTimer);
        pendingWriteTimer = null;
    }
    if (!latestQueuedState) return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(latestQueuedState));
        latestQueuedState = null;
    } catch {
        // Abaikan jika quota penuh
    }
}

export function scheduleWorkspaceSave(state: MealflowPersistedState): void {
    latestQueuedState = state;
    if (pendingWriteTimer !== null) {
        window.clearTimeout(pendingWriteTimer);
    }

    pendingWriteTimer = window.setTimeout(() => {
        pendingWriteTimer = null;
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => flushWorkspaceSave(), { timeout: 1000 });
        } else {
            flushWorkspaceSave();
        }
    }, 300);
}

export function clearWorkspaceStorage(): void {
    latestQueuedState = null;
    if (pendingWriteTimer !== null) {
        window.clearTimeout(pendingWriteTimer);
        pendingWriteTimer = null;
    }
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Ignore
    }
}

export function exportWorkspaceSnapshot(state: MealflowPersistedState): string {
    return JSON.stringify(state, null, 2);
}