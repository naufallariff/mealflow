// src/hooks/use-mealflow-store.ts

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CATALOG } from '../data/default-catalog';
import {
    clearWorkspaceStorage,
    exportWorkspaceSnapshot,
    flushWorkspaceSave,
    loadWorkspaceState,
    parseWorkspacePayload,
    scheduleWorkspaceSave,
    type MealflowPersistedState,
} from '../services/storage-engine';
import type {
    CatalogItem,
    MealPeriod,
    MonthlySchedule,
} from '../types/meal';
import {
    calculateBudgetSummary,
    createEmptyMonthlySchedule,
} from '../utils/budget-engine';

const DEFAULT_BUDGET = 1_000_000;

export function useMealflowStore() {
    const [hydrated] = useState(() => loadWorkspaceState());

    const [targetBudget, setTargetBudget] = useState<number>(
        () => hydrated?.targetBudget ?? DEFAULT_BUDGET,
    );
    const [activeWeek, setActiveWeek] = useState<number>(
        () => hydrated?.activeWeek ?? 1,
    );
    const [schedule, setSchedule] = useState<MonthlySchedule>(
        () => hydrated?.schedule ?? createEmptyMonthlySchedule(31),
    );
    const [catalogOverrides, setCatalogOverrides] = useState<
        Record<string, Partial<CatalogItem>>
    >(() => hydrated?.catalogOverrides ?? {});
    const [customItems, setCustomItems] = useState<readonly CatalogItem[]>(
        () => hydrated?.customItems ?? [],
    );
    const [hiddenItemIds, setHiddenItemIds] = useState<readonly string[]>(
        () => hydrated?.hiddenItemIds ?? [],
    );

    // Gabungkan katalog bawaan + override pengguna + item buatan sendiri
    const { catalog, catalogMap, overriddenIds } = useMemo(() => {
        const hiddenSet = new Set(hiddenItemIds);
        const modifiedSet = new Set<string>();
        const merged: CatalogItem[] = [];
        const map = new Map<string, CatalogItem>();

        for (const baseItem of DEFAULT_CATALOG) {
            if (hiddenSet.has(baseItem.id)) continue;
            const patch = catalogOverrides[baseItem.id];
            const resolved: CatalogItem = patch
                ? { ...baseItem, ...patch, id: baseItem.id }
                : baseItem;
            if (patch) modifiedSet.add(baseItem.id);
            merged.push(resolved);
            map.set(resolved.id, resolved);
        }

        for (const custom of customItems) {
            if (hiddenSet.has(custom.id)) continue;
            merged.push(custom);
            map.set(custom.id, custom);
        }

        return {
            catalog: merged,
            catalogMap: map,
            overriddenIds: modifiedSet,
        };
    }, [catalogOverrides, customItems, hiddenItemIds]);

    // Kalkulasi anggaran 31 hari (single-pass memoized)
    const budgetSummary = useMemo(
        () => calculateBudgetSummary(schedule, catalogMap, targetBudget),
        [schedule, catalogMap, targetBudget],
    );

    // Sinkronisasi otomatis ke storage secara non-blocking
    useEffect(() => {
        const snapshot: MealflowPersistedState = {
            schemaVersion: 2,
            updatedAt: new Date().toISOString(),
            targetBudget,
            activeWeek,
            schedule,
            catalogOverrides,
            customItems,
            hiddenItemIds,
        };
        scheduleWorkspaceSave(snapshot);
    }, [
        targetBudget,
        activeWeek,
        schedule,
        catalogOverrides,
        customItems,
        hiddenItemIds,
    ]);

    // Pastikan write tertunda langsung disimpan jika tab ditutup
    useEffect(() => {
        const handleBeforeUnload = () => flushWorkspaceSave();
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // --- Mutasi Katalog & Preferensi Pengguna ---
    const updateCatalogItem = useCallback(
        (itemId: string, patch: Partial<Omit<CatalogItem, 'id'>>) => {
            const isCustom = customItems.some((item) => item.id === itemId);
            if (isCustom) {
                setCustomItems((prev) =>
                    prev.map((item) =>
                        item.id === itemId ? { ...item, ...patch, id: item.id } : item,
                    ),
                );
                return;
            }

            setCatalogOverrides((prev) => ({
                ...prev,
                [itemId]: { ...(prev[itemId] ?? {}), ...patch },
            }));
        },
        [customItems],
    );

    const resetCatalogItem = useCallback((itemId: string) => {
        setCatalogOverrides((prev) => {
            const next = { ...prev };
            delete next[itemId];
            return next;
        });
    }, []);

    const resetAllCatalogCustomizations = useCallback(() => {
        setCatalogOverrides({});
        setHiddenItemIds([]);
    }, []);

    const createCustomItem = useCallback(
        (input: Omit<CatalogItem, 'id' | 'isCustom'>) => {
            const id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
            const newItem: CatalogItem = {
                ...input,
                id,
                isCustom: true,
            };
            setCustomItems((prev) => [newItem, ...prev]);
            return newItem;
        },
        [],
    );

    const removeOrHideCatalogItem = useCallback(
        (itemId: string) => {
            const isCustom = customItems.some((item) => item.id === itemId);
            if (isCustom) {
                setCustomItems((prev) => prev.filter((item) => item.id !== itemId));
            } else {
                setHiddenItemIds((prev) =>
                    prev.includes(itemId) ? prev : [...prev, itemId],
                );
            }
        },
        [customItems],
    );

    // --- Mutasi Jadwal 31 Hari ---
    const assignItemToSlot = useCallback(
        (day: number, period: MealPeriod, itemId: string, portionsToAdd = 1) => {
            if (!catalogMap.has(itemId)) return;
            setSchedule((prev) => {
                const currentDay = prev[day] ?? { breakfast: [], lunch: [], dinner: [] };
                const currentSlot = currentDay[period];
                const existingIdx = currentSlot.findIndex((e) => e.itemId === itemId);

                const nextSlot =
                    existingIdx >= 0
                        ? currentSlot.map((entry, idx) =>
                            idx === existingIdx
                                ? { ...entry, portions: entry.portions + portionsToAdd }
                                : entry,
                        )
                        : [...currentSlot, { itemId, portions: Math.max(1, portionsToAdd) }];

                return {
                    ...prev,
                    [day]: {
                        ...currentDay,
                        [period]: nextSlot,
                    },
                };
            });
        },
        [catalogMap],
    );

    const updateSlotPortion = useCallback(
        (day: number, period: MealPeriod, itemId: string, delta: number) => {
            setSchedule((prev) => {
                const currentDay = prev[day];
                if (!currentDay) return prev;
                const nextSlot = currentDay[period]
                    .map((entry) =>
                        entry.itemId === itemId
                            ? { ...entry, portions: entry.portions + delta }
                            : entry,
                    )
                    .filter((entry) => entry.portions > 0);

                return {
                    ...prev,
                    [day]: {
                        ...currentDay,
                        [period]: nextSlot,
                    },
                };
            });
        },
        [],
    );

    const clearDaySchedule = useCallback((day: number) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: { breakfast: [], lunch: [], dinner: [] },
        }));
    }, []);

    const copyWeekToNext = useCallback(() => {
        if (activeWeek >= 5) return;
        const sourceStart = (activeWeek - 1) * 7 + 1;
        const targetStart = activeWeek * 7 + 1;

        setSchedule((prev) => {
            const next = { ...prev };
            for (let offset = 0; offset < 7; offset += 1) {
                const targetDay = targetStart + offset;
                if (targetDay > 31) break;
                const sourceDayPlan = prev[sourceStart + offset] ?? {
                    breakfast: [],
                    lunch: [],
                    dinner: [],
                };
                next[targetDay] = {
                    breakfast: sourceDayPlan.breakfast.map((e) => ({ ...e })),
                    lunch: sourceDayPlan.lunch.map((e) => ({ ...e })),
                    dinner: sourceDayPlan.dinner.map((e) => ({ ...e })),
                };
            }
            return next;
        });
        setActiveWeek((w) => Math.min(5, w + 1));
    }, [activeWeek]);

    const duplicateWeekToMonth = useCallback(() => {
        const sourceStart = (activeWeek - 1) * 7 + 1;
        setSchedule((prev) => {
            const next = { ...prev };
            for (let day = 1; day <= 31; day += 1) {
                const offset = (day - 1) % 7;
                const templateDay = Math.min(31, sourceStart + offset);
                const templatePlan = prev[templateDay] ?? {
                    breakfast: [],
                    lunch: [],
                    dinner: [],
                };
                next[day] = {
                    breakfast: templatePlan.breakfast.map((e) => ({ ...e })),
                    lunch: templatePlan.lunch.map((e) => ({ ...e })),
                    dinner: templatePlan.dinner.map((e) => ({ ...e })),
                };
            }
            return next;
        });
    }, [activeWeek]);

    const replaceFullSchedule = useCallback((nextSchedule: MonthlySchedule) => {
        setSchedule(nextSchedule);
    }, []);

    // --- Backup, Restore & Factory Reset ---
    const exportProfileJson = useCallback(() => {
        return exportWorkspaceSnapshot({
            schemaVersion: 2,
            updatedAt: new Date().toISOString(),
            targetBudget,
            activeWeek,
            schedule,
            catalogOverrides,
            customItems,
            hiddenItemIds,
        });
    }, [
        targetBudget,
        activeWeek,
        schedule,
        catalogOverrides,
        customItems,
        hiddenItemIds,
    ]);

    const importProfileJson = useCallback(
        (rawJson: string): { ok: true } | { ok: false; error: string } => {
            const parsed = parseWorkspacePayload(rawJson);
            if (!parsed) {
                return {
                    ok: false,
                    error: 'Format file JSON profil Mealflow tidak valid.',
                };
            }
            if (parsed.targetBudget !== undefined) setTargetBudget(parsed.targetBudget);
            if (parsed.activeWeek !== undefined) setActiveWeek(parsed.activeWeek);
            if (parsed.schedule) setSchedule(parsed.schedule);
            if (parsed.catalogOverrides) setCatalogOverrides(parsed.catalogOverrides);
            if (parsed.customItems) setCustomItems(parsed.customItems);
            if (parsed.hiddenItemIds) setHiddenItemIds(parsed.hiddenItemIds);
            return { ok: true };
        },
        [],
    );

    const resetAllWorkspace = useCallback(() => {
        clearWorkspaceStorage();
        setTargetBudget(DEFAULT_BUDGET);
        setActiveWeek(1);
        setSchedule(createEmptyMonthlySchedule(31));
        setCatalogOverrides({});
        setCustomItems([]);
        setHiddenItemIds([]);
    }, []);

    return {
        catalog,
        catalogMap,
        overriddenIds,
        targetBudget,
        setTargetBudget,
        activeWeek,
        setActiveWeek,
        schedule,
        budgetSummary,
        // Catalog actions
        updateCatalogItem,
        resetCatalogItem,
        resetAllCatalogCustomizations,
        createCustomItem,
        removeOrHideCatalogItem,
        // Schedule actions
        assignItemToSlot,
        updateSlotPortion,
        clearDaySchedule,
        copyWeekToNext,
        duplicateWeekToMonth,
        replaceFullSchedule,
        // Profile IO
        exportProfileJson,
        importProfileJson,
        resetAllWorkspace,
    } as const;
}