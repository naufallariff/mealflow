// src/services/storage-engine.ts

import type {
  CatalogItem,
  MealBundle,
  MonthlySchedule,
  UnscheduledPortionMap,
} from '../types/meal';

export type ActiveWorkspaceTab = 'planner' | 'grocery' | 'calendar';

export interface MealflowPersistedState {
  readonly schemaVersion: 3;
  readonly updatedAt: string;
  readonly activeTab: ActiveWorkspaceTab;
  readonly targetBudget: number;
  readonly activeWeek: number;
  readonly unscheduledPortions: UnscheduledPortionMap;
  readonly schedule: MonthlySchedule;
  readonly checkedItemIds: readonly string[];
  readonly catalogOverrides: Record<string, Partial<CatalogItem>>;
  readonly customItems: readonly CatalogItem[];
  readonly hiddenItemIds: readonly string[];
  readonly customBundles: readonly MealBundle[];
}

const STORAGE_KEY = 'mealflow.workspace.v3';
let saveTimer: number | null = null;
let latestPendingSnapshot: MealflowPersistedState | null = null;

function isValidTab(value: unknown): value is ActiveWorkspaceTab {
  return value === 'planner' || value === 'grocery' || value === 'calendar';
}

export function loadWorkspaceState(): Partial<MealflowPersistedState> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<MealflowPersistedState>;
    if (!parsed || typeof parsed !== 'object') return null;

    return {
      ...parsed,
      activeTab: isValidTab(parsed.activeTab) ? parsed.activeTab : 'planner',
    };
  } catch {
    return null;
  }
}

export function scheduleWorkspaceSave(snapshot: MealflowPersistedState): void {
  latestPendingSnapshot = snapshot;
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer);
  }
  saveTimer = window.setTimeout(() => {
    flushWorkspaceSave();
  }, 250);
}

export function flushWorkspaceSave(): void {
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (!latestPendingSnapshot) return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(latestPendingSnapshot),
    );
    latestPendingSnapshot = null;
  } catch {
    // Abaikan kuota penuh secara aman
  }
}

export function clearWorkspaceStorage(): void {
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer);
    saveTimer = null;
  }
  latestPendingSnapshot = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Abaikan error storage
  }
}

export function exportWorkspaceSnapshot(
  snapshot: MealflowPersistedState,
): string {
  return JSON.stringify(snapshot, null, 2);
}

export function parseWorkspacePayload(
  rawJson: string,
): Partial<MealflowPersistedState> | null {
  try {
    const parsed = JSON.parse(rawJson) as Partial<MealflowPersistedState>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (
      parsed.targetBudget !== undefined &&
      typeof parsed.targetBudget !== 'number'
    ) {
      return null;
    }
    return {
      ...parsed,
      activeTab: isValidTab(parsed.activeTab) ? parsed.activeTab : 'planner',
    };
  } catch {
    return null;
  }
}