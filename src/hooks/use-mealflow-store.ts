// src/hooks/use-mealflow-store.ts

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CATALOG, DEFAULT_MEAL_BUNDLES } from '../data/default-catalog';
import {
    clearWorkspaceStorage,
    exportWorkspaceSnapshot,
    flushWorkspaceSave,
    loadWorkspaceState,
    parseWorkspacePayload,
    scheduleWorkspaceSave,
    type ActiveWorkspaceTab,
    type MealflowPersistedState,
} from '../services/storage-engine';
import type {
    BundleComponent,
    CatalogItem,
    MealBundle,
    MealPeriod,
    MonthlySchedule,
    UnscheduledPortionMap,
} from '../types/meal';
import {
    calculateBudgetSummary,
    createEmptyMonthlySchedule,
    distributePortionsToSchedule,
} from '../utils/budget-engine';

const DEFAULT_BUDGET = 1_000_000;

export function useMealflowStore() {
    const [hydrated] = useState(() => loadWorkspaceState());

    const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>(
        () => hydrated?.activeTab ?? 'planner',
    );
    const [targetBudget, setTargetBudget] = useState<number>(
        () => hydrated?.targetBudget ?? DEFAULT_BUDGET,
    );
    const [activeWeek, setActiveWeek] = useState<number>(
        () => hydrated?.activeWeek ?? 1,
    );
    const [unscheduledPortions, setUnscheduledPortions] =
        useState<UnscheduledPortionMap>(() => hydrated?.unscheduledPortions ?? {});
    const [schedule, setSchedule] = useState<MonthlySchedule>(
        () => hydrated?.schedule ?? createEmptyMonthlySchedule(31),
    );
    const [checkedItemIds, setCheckedItemIds] = useState<readonly string[]>(
        () => hydrated?.checkedItemIds ?? [],
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
    const [customBundles, setCustomBundles] = useState<readonly MealBundle[]>(
        () => hydrated?.customBundles ?? [],
    );

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

    const { bundles, bundleMap } = useMemo(() => {
        const customMap = new Map(customBundles.map((b) => [b.id, b]));
        const merged: MealBundle[] = DEFAULT_MEAL_BUNDLES.map(
            (base) => customMap.get(base.id) ?? base,
        );
        for (const custom of customBundles) {
            if (!DEFAULT_MEAL_BUNDLES.some((b) => b.id === custom.id)) {
                merged.push(custom);
            }
        }
        return {
            bundles: merged,
            bundleMap: new Map(merged.map((b) => [b.id, b])),
        };
    }, [customBundles]);

    const budgetSummary = useMemo(
        () =>
            calculateBudgetSummary(
                schedule,
                unscheduledPortions,
                catalogMap,
                bundleMap,
                targetBudget,
            ),
        [schedule, unscheduledPortions, catalogMap, bundleMap, targetBudget],
    );

    useEffect(() => {
        const snapshot: MealflowPersistedState = {
            schemaVersion: 3,
            updatedAt: new Date().toISOString(),
            activeTab,
            targetBudget,
            activeWeek,
            unscheduledPortions,
            schedule,
            checkedItemIds,
            catalogOverrides,
            customItems,
            hiddenItemIds,
            customBundles,
        };
        scheduleWorkspaceSave(snapshot);
    }, [
        activeTab,
        targetBudget,
        activeWeek,
        unscheduledPortions,
        schedule,
        checkedItemIds,
        catalogOverrides,
        customItems,
        hiddenItemIds,
        customBundles,
    ]);

    useEffect(() => {
        const handleBeforeUnload = () => flushWorkspaceSave();
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // --- Mode 1: Perencana Frekuensi Bulanan (Spreadsheet View) ---
    const setItemMonthlyPortions = useCallback(
        (itemId: string, desiredTotalPortions: number) => {
            const safeDesired = Math.max(0, Math.min(500, Math.round(desiredTotalPortions)));

            // Hitung porsi yang sudah berada di kalender saat ini
            let currentlyScheduled = 0;
            const periods: readonly MealPeriod[] = ['breakfast', 'lunch', 'dinner'];
            for (let day = 1; day <= 31; day += 1) {
                const dayPlan = schedule[day];
                if (!dayPlan) continue;
                for (const p of periods) {
                    for (const entry of dayPlan[p]) {
                        if (entry.itemId === itemId) {
                            currentlyScheduled += entry.portions;
                        }
                    }
                }
            }

            if (safeDesired >= currentlyScheduled) {
                const remainder = safeDesired - currentlyScheduled;
                setUnscheduledPortions((prev) => {
                    const next = { ...prev };
                    if (remainder <= 0) {
                        delete next[itemId];
                    } else {
                        next[itemId] = remainder;
                    }
                    return next;
                });
                return;
            }

            // Jika target lebih kecil dari yang sudah terjadwal di kalender, pangkas dari hari terakhir
            let toTrim = currentlyScheduled - safeDesired;
            setUnscheduledPortions((prev) => {
                const next = { ...prev };
                delete next[itemId];
                return next;
            });

            setSchedule((prev) => {
                const next = { ...prev };
                for (let day = 31; day >= 1 && toTrim > 0; day -= 1) {
                    const dayPlan = next[day];
                    if (!dayPlan) continue;
                    const updatedDay = {
                        breakfast: [...dayPlan.breakfast],
                        lunch: [...dayPlan.lunch],
                        dinner: [...dayPlan.dinner],
                    };

                    for (let pIdx = periods.length - 1; pIdx >= 0 && toTrim > 0; pIdx -= 1) {
                        const p = periods[pIdx];
                        updatedDay[p] = updatedDay[p]
                            .map((entry) => {
                                if (entry.itemId !== itemId || toTrim <= 0) return entry;
                                const cut = Math.min(entry.portions, toTrim);
                                toTrim -= cut;
                                return { ...entry, portions: entry.portions - cut };
                            })
                            .filter((entry) => entry.portions > 0);
                    }

                    next[day] = updatedDay;
                }
                return next;
            });
        },
        [schedule],
    );

    const adjustItemMonthlyPortions = useCallback(
        (itemId: string, delta: number) => {
            const line = budgetSummary.lineItems.find((l) => l.item.id === itemId);
            const currentTotal = line ? line.usedPortions : (unscheduledPortions[itemId] ?? 0);
            setItemMonthlyPortions(itemId, currentTotal + delta);
        },
        [budgetSummary.lineItems, unscheduledPortions, setItemMonthlyPortions],
    );

    // --- Mode 2: Checklist Eksekusi Kasir ---
    const toggleCheckedItem = useCallback((itemId: string) => {
        setCheckedItemIds((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
        );
    }, []);

    const clearCheckedItems = useCallback(() => {
        setCheckedItemIds([]);
    }, []);

    // --- Mode 3: Kalender 31 Hari & Distribusi Otomatis ---
    const distributeUnscheduledToCalendar = useCallback(() => {
        if (Object.keys(unscheduledPortions).length === 0) return;
        setSchedule((prev) =>
            distributePortionsToSchedule(prev, unscheduledPortions, catalogMap, bundleMap),
        );
        setUnscheduledPortions({});
        setActiveTab('calendar');
    }, [unscheduledPortions, catalogMap, bundleMap]);

    const assignItemToSlot = useCallback(
        (day: number, period: MealPeriod, itemId: string, portionsToAdd = 1) => {
            if (!catalogMap.has(itemId) && !bundleMap.has(itemId)) return;
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
        [catalogMap, bundleMap],
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

    // --- Mutasi Katalog & Paket Masakan ---
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
        setCustomBundles([]);
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

    const saveMealBundle = useCallback(
        (id: string | null, name: string, components: readonly BundleComponent[]) => {
            const cleanComponents = components.filter((c) => c.portions > 0);
            if (!name.trim() || cleanComponents.length === 0) return;

            const targetId =
                id ?? `bundle-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;

            setCustomBundles((prev) => {
                const nextBundle: MealBundle = {
                    id: targetId,
                    name: name.trim(),
                    components: cleanComponents,
                    isCustom: true,
                };
                const exists = prev.some((b) => b.id === targetId);
                return exists
                    ? prev.map((b) => (b.id === targetId ? nextBundle : b))
                    : [nextBundle, ...prev];
            });
        },
        [],
    );

    // --- Backup, Restore & Factory Reset ---
    const exportProfileJson = useCallback(() => {
        return exportWorkspaceSnapshot({
            schemaVersion: 3,
            updatedAt: new Date().toISOString(),
            activeTab,
            targetBudget,
            activeWeek,
            unscheduledPortions,
            schedule,
            checkedItemIds,
            catalogOverrides,
            customItems,
            hiddenItemIds,
            customBundles,
        });
    }, [
        activeTab,
        targetBudget,
        activeWeek,
        unscheduledPortions,
        schedule,
        checkedItemIds,
        catalogOverrides,
        customItems,
        hiddenItemIds,
        customBundles,
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
            if (parsed.activeTab) setActiveTab(parsed.activeTab);
            if (parsed.targetBudget !== undefined) setTargetBudget(parsed.targetBudget);
            if (parsed.activeWeek !== undefined) setActiveWeek(parsed.activeWeek);
            if (parsed.unscheduledPortions) setUnscheduledPortions(parsed.unscheduledPortions);
            if (parsed.schedule) setSchedule(parsed.schedule);
            if (parsed.checkedItemIds) setCheckedItemIds(parsed.checkedItemIds);
            if (parsed.catalogOverrides) setCatalogOverrides(parsed.catalogOverrides);
            if (parsed.customItems) setCustomItems(parsed.customItems);
            if (parsed.hiddenItemIds) setHiddenItemIds(parsed.hiddenItemIds);
            if (parsed.customBundles) setCustomBundles(parsed.customBundles);
            return { ok: true };
        },
        [],
    );

    const resetAllWorkspace = useCallback(() => {
        clearWorkspaceStorage();
        setActiveTab('planner');
        setTargetBudget(DEFAULT_BUDGET);
        setActiveWeek(1);
        setUnscheduledPortions({});
        setSchedule(createEmptyMonthlySchedule(31));
        setCheckedItemIds([]);
        setCatalogOverrides({});
        setCustomItems([]);
        setHiddenItemIds([]);
        setCustomBundles([]);
    }, []);

    return {
        activeTab,
        setActiveTab,
        catalog,
        catalogMap,
        overriddenIds,
        bundles,
        bundleMap,
        targetBudget,
        setTargetBudget,
        activeWeek,
        setActiveWeek,
        unscheduledPortions,
        schedule,
        checkedItemIds,
        budgetSummary,
        // Mode 1: Monthly Frequency Planner
        setItemMonthlyPortions,
        adjustItemMonthlyPortions,
        // Mode 2: Cashier Checklist
        toggleCheckedItem,
        clearCheckedItems,
        // Mode 3: Optional 31-Day Calendar
        distributeUnscheduledToCalendar,
        assignItemToSlot,
        updateSlotPortion,
        clearDaySchedule,
        copyWeekToNext,
        duplicateWeekToMonth,
        // Catalog & Bundles
        updateCatalogItem,
        resetCatalogItem,
        resetAllCatalogCustomizations,
        createCustomItem,
        removeOrHideCatalogItem,
        saveMealBundle,
        // Profile IO
        exportProfileJson,
        importProfileJson,
        resetAllWorkspace,
    } as const;
}