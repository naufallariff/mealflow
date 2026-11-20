// src/App.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CatalogItem } from './types/meal';
import { WEEKLY_PRESETS } from './data/default-catalog';
import { createEmptyMonthlySchedule } from './utils/budget-engine';
import { useMealflowStore } from './hooks/use-mealflow-store';
import { useTheme } from './hooks/use-theme';
import { FloatingNavbar } from './components/layout/FloatingNavbar';
import { MobileBottomNav, type MobileTab } from './components/layout/MobileBottomNav';
import { FloatingGuideWidget } from './components/layout/FloatingGuideWidget';
import { BudgetTargetCard } from './components/summary/BudgetTargetCard';
import { GrocerySummaryPanel } from './components/summary/GrocerySummaryPanel';
import { CatalogPanel } from './components/catalog/CatalogPanel';
import { WeeklyCalendarGrid } from './components/calendar/WeeklyCalendarGrid';
import { ConfirmDialog, type ConfirmDialogConfig } from './components/ui/ConfirmDialog';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    catalog,
    catalogMap,
    overriddenIds,
    targetBudget,
    setTargetBudget,
    activeWeek,
    setActiveWeek,
    schedule,
    budgetSummary,
    updateCatalogItem,
    resetCatalogItem,
    createCustomItem,
    removeOrHideCatalogItem,
    assignItemToSlot,
    updateSlotPortion,
    clearDaySchedule,
    copyWeekToNext,
    duplicateWeekToMonth,
    replaceFullSchedule,
    resetAllWorkspace,
  } = useMealflowStore();

  const [mobileTab, setMobileTab] = useState<MobileTab>('calendar');
  const [pendingItem, setPendingItem] = useState<CatalogItem | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmDialogConfig | null>(null);

  useEffect(() => {
    if (!pendingItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPendingItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingItem]);

  const usageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const line of budgetSummary.lineItems) {
      counts.set(line.item.id, line.usedPortions);
    }
    return counts;
  }, [budgetSummary.lineItems]);

  const applyPreset = useCallback(
    (presetId: string) => {
      const preset = WEEKLY_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      const next = createEmptyMonthlySchedule(31);
      for (let day = 1; day <= 31; day += 1) {
        const weekday = ((day - 1) % 7) + 1;
        const template = preset.pattern[weekday];
        if (template) {
          next[day] = {
            breakfast: template.breakfast.map((e) => ({ ...e })),
            lunch: template.lunch.map((e) => ({ ...e })),
            dinner: template.dinner.map((e) => ({ ...e })),
          };
        }
      }
      replaceFullSchedule(next);
      setActiveWeek(1);
    },
    [replaceFullSchedule, setActiveWeek],
  );

  const handleStartQuickSchedule = useCallback((item: CatalogItem) => {
    setPendingItem(item);
    setMobileTab('calendar');
  }, []);

  const handleRequestResetAll = useCallback(() => {
    setConfirmConfig({
      title: 'Reset Seluruh Jadwal & Target?',
      description:
        'Semua jadwal makan 31 hari dan target anggaran bulanan akan dikosongkan ke kondisi awal.',
      confirmLabel: 'Ya, Reset Semua',
      tone: 'danger',
      onConfirm: () => {
        setPendingItem(null);
        resetAllWorkspace();
      },
    });
  }, [resetAllWorkspace]);

  return (
    <div className="mf-liquid-canvas">
      <FloatingNavbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onRequestResetAll={handleRequestResetAll}
      />

      <main className="mf-fluid-container space-y-5 pt-5 sm:space-y-6 sm:pt-6">
        {/* Top 3-Column Symmetric KPI & Budget Strip */}
        <BudgetTargetCard
          summary={budgetSummary}
          targetBudget={targetBudget}
          onChangeTarget={setTargetBudget}
        />

        {/* 3-Column Full-Width Desktop Workspace / Tabbed Mobile View */}
        <div className="mf-workspace-grid">
          {/* Kolom 1: Katalog */}
          <aside
            className={`${mobileTab === 'catalog' ? 'block' : 'hidden'
              } mf-glass-panel p-4 xl:sticky xl:top-20 xl:block`}
          >
            <CatalogPanel
              items={catalog}
              usageCounts={usageCounts}
              overriddenIds={overriddenIds}
              onRequestConfirm={setConfirmConfig}
              onQuickSchedule={handleStartQuickSchedule}
              onAddCustomItem={({
                name,
                kind,
                category,
                packUnit,
                packPrice,
                portionsPerPack,
                note,
              }) =>
                createCustomItem({
                  name,
                  kind,
                  category,
                  packUnit,
                  packPrice,
                  portionsPerPack,
                  note,
                })
              }
              onUpdateCatalogItem={updateCatalogItem}
              onResetCatalogItem={resetCatalogItem}
              onDeleteCustomItem={removeOrHideCatalogItem}
            />
          </aside>

          {/* Kolom 2: Kalender 31 Hari */}
          <section
            className={`${mobileTab === 'calendar' ? 'block' : 'hidden'
              } mf-glass-panel min-w-0 p-4 sm:p-5 xl:block`}
          >
            <WeeklyCalendarGrid
              schedule={schedule}
              catalogMap={catalogMap}
              activeWeek={activeWeek}
              pendingItem={pendingItem}
              onRequestConfirm={setConfirmConfig}
              onCancelPendingItem={() => setPendingItem(null)}
              onChangeWeek={setActiveWeek}
              onDropItem={(day, period, itemId) =>
                assignItemToSlot(day, period, itemId, 1)
              }
              onUpdatePortion={updateSlotPortion}
              onClearDay={clearDaySchedule}
              onCopyWeekToNext={copyWeekToNext}
              onDuplicateWeekToMonth={duplicateWeekToMonth}
              onApplyPreset={applyPreset}
            />
          </section>

          {/* Kolom 3: Daftar Belanja */}
          <aside
            className={`${mobileTab === 'summary' ? 'block' : 'hidden'
              } mf-glass-panel p-4 xl:sticky xl:top-20 xl:block`}
          >
            <GrocerySummaryPanel summary={budgetSummary} />
          </aside>
        </div>
      </main>

      {/* Bottom-Right Peek Guide Tab */}
      <FloatingGuideWidget />

      {/* Mobile Floating Dock */}
      <MobileBottomNav
        activeTab={mobileTab}
        onChangeTab={setMobileTab}
      />

      {/* Centralized Decision Confirmation Dialog */}
      <ConfirmDialog
        config={confirmConfig}
        onClose={() => setConfirmConfig(null)}
      />
    </div>
  );
}

export default App;