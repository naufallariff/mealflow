// src/App.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckSquare, TableProperties } from 'lucide-react';
import type { CatalogItem, MealPeriod } from './types/meal';
import { useMealflowStore } from './hooks/use-mealflow-store';
import { useTheme } from './hooks/use-theme';
import { FloatingNavbar } from './components/layout/FloatingNavbar';
import {
  MobileBottomNav,
  type MobileTab,
} from './components/layout/MobileBottomNav';
import { FloatingGuideWidget } from './components/layout/FloatingGuideWidget';
import { BudgetTargetCard } from './components/summary/BudgetTargetCard';
import { GrocerySummaryPanel } from './components/summary/GrocerySummaryPanel';
import { CatalogPanel } from './components/catalog/CatalogPanel';
import { WeeklyCalendarGrid } from './components/calendar/WeeklyCalendarGrid';
import {
  SlotMenuPickerModal,
  type ActiveSlotTarget,
} from './components/calendar/SlotMenuPickerModal';
import { MonthlyFrequencyPlanner } from './components/planner/MonthlyFrequencyPlanner';
import { OngoingDashboardView } from './components/dashboard/OngoingDashboardView';
import {
  ConfirmDialog,
  type ConfirmDialogConfig,
} from './components/ui/ConfirmDialog';

type WorkspaceSection = 'dashboard' | 'planner' | 'calendar' | 'catalog';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    activeTab,
    setActiveTab,
    catalog,
    catalogMap,
    overriddenIds,
    bundles,
    targetBudget,
    setTargetBudget,
    activeWeek,
    setActiveWeek,
    schedule,
    checkedItemIds,
    budgetSummary,
    setItemMonthlyPortions,
    adjustItemMonthlyPortions,
    toggleCheckedItem,
    clearCheckedItems,
    updateCatalogItem,
    resetCatalogItem,
    createCustomItem,
    removeOrHideCatalogItem,
    saveMealBundle,
    distributeUnscheduledToCalendar,
    assignItemToSlot,
    updateSlotPortion,
    clearDaySchedule,
    copyWeekToNext,
    duplicateWeekToMonth,
    exportProfileJson,
    importProfileJson,
    resetAllWorkspace,
  } = useMealflowStore();

  const [mobileTab, setMobileTab] = useState<MobileTab>(() =>
    activeTab === 'grocery' ? 'dashboard' : activeTab,
  );
  const [pendingItem, setPendingItem] = useState<CatalogItem | null>(null);
  const [slotPickerTarget, setSlotPickerTarget] =
    useState<ActiveSlotTarget | null>(null);
  const [confirmConfig, setConfirmConfig] =
    useState<ConfirmDialogConfig | null>(null);

  useEffect(() => {
    if (!pendingItem && !slotPickerTarget) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (slotPickerTarget) setSlotPickerTarget(null);
      else if (pendingItem) setPendingItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingItem, slotPickerTarget]);

  const usageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const line of budgetSummary.lineItems) {
      counts.set(line.item.id, line.usedPortions);
    }
    return counts;
  }, [budgetSummary.lineItems]);

  const pendingShoppingCount = useMemo(() => {
    const checkedSet = new Set(checkedItemIds);
    return budgetSummary.lineItems.filter(
      (line) => !checkedSet.has(line.item.id),
    ).length;
  }, [budgetSummary.lineItems, checkedItemIds]);

  const navigateToSection = useCallback(
    (section: WorkspaceSection) => {
      if (section === 'catalog') {
        setMobileTab('catalog');
        return;
      }
      setMobileTab(section);
      setActiveTab(section === 'dashboard' ? 'grocery' : section);
    },
    [setActiveTab],
  );

  const handleSelectMobileTab = useCallback(
    (tab: MobileTab) => {
      navigateToSection(tab);
    },
    [navigateToSection],
  );

  const handleStartQuickSchedule = useCallback(
    (item: CatalogItem) => {
      setPendingItem(item);
      setSlotPickerTarget(null);
      navigateToSection('calendar');
    },
    [navigateToSection],
  );

  const handleOpenSlotPicker = useCallback(
    (day: number, period: MealPeriod) => {
      if (pendingItem) {
        assignItemToSlot(day, period, pendingItem.id, 1);
        setPendingItem(null);
        return;
      }
      setSlotPickerTarget({ day, period });
    },
    [assignItemToSlot, pendingItem],
  );

  const handleRequestResetAll = useCallback(() => {
    setConfirmConfig({
      title: 'Reset Seluruh Rencana & Target?',
      description:
        'Semua porsi bulanan, jadwal 31 hari, checklist kasir, dan target anggaran akan dikosongkan ke kondisi awal.',
      confirmLabel: 'Ya, Reset Semua',
      tone: 'danger',
      onConfirm: () => {
        setPendingItem(null);
        setSlotPickerTarget(null);
        setMobileTab('dashboard');
        resetAllWorkspace();
      },
    });
  }, [resetAllWorkspace]);

  const isMainWorkspaceVisibleOnMobile =
    mobileTab === 'planner' ||
    mobileTab === 'dashboard' ||
    mobileTab === 'calendar';

  return (
    <div className="mf-liquid-canvas">
      <FloatingNavbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onRequestResetAll={handleRequestResetAll}
      />

      <main className="mf-fluid-container space-y-6 pt-7 pb-24 sm:space-y-7 sm:pt-8 xl:pb-10">
        <BudgetTargetCard
          summary={budgetSummary}
          targetBudget={targetBudget}
          onChangeTarget={setTargetBudget}
        />

        <div className="mf-workspace-grid">
          {/* Kolom 1: Katalog Bahan Pokok */}
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
              onAddCustomItem={(item) =>
                createCustomItem({
                  name: item.name,
                  kind: item.kind,
                  category: item.category,
                  consumptionUnit: item.consumptionUnit || '1 porsi',
                  packUnit: item.packUnit,
                  packPrice: item.packPrice,
                  portionsPerPack: item.portionsPerPack,
                  requiresCooking: item.requiresCooking,
                  macros: item.macros,
                  note: item.note,
                })
              }
              onUpdateCatalogItem={updateCatalogItem}
              onResetCatalogItem={resetCatalogItem}
              onDeleteCustomItem={removeOrHideCatalogItem}
            />
          </aside>

          {/* Kolom 2: Area Kerja Utama */}
          <section
            className={`${isMainWorkspaceVisibleOnMobile ? 'block' : 'hidden'
              } mf-glass-panel min-w-0 p-4 sm:p-5 xl:block`}
          >
            <div
              role="tablist"
              aria-label="Mode perencanaan Mealflow"
              className="mb-4 grid grid-cols-3 gap-1 rounded-full border border-(--border-subtle) bg-(--glass-card-subtle) p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'grocery'}
                onClick={() => navigateToSection('dashboard')}
                className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-extrabold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 ${activeTab === 'grocery'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
                  }`}
              >
                <CheckSquare
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden truncate sm:inline">
                  Dashboard & Kasir
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'planner'}
                onClick={() => navigateToSection('planner')}
                className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-extrabold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 ${activeTab === 'planner'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
                  }`}
              >
                <TableProperties
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="sm:hidden">Rencana</span>
                <span className="hidden truncate sm:inline">
                  Perencana Bulanan
                </span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'calendar'}
                onClick={() => navigateToSection('calendar')}
                className={`flex min-h-11 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-extrabold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand/40 ${activeTab === 'calendar'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
                  }`}
              >
                <CalendarDays
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="sm:hidden">Kalender</span>
                <span className="hidden truncate sm:inline">
                  Kalender 31 Hari
                </span>
              </button>
            </div>

            {activeTab === 'grocery' && (
              <OngoingDashboardView
                summary={budgetSummary}
                checkedItemIds={checkedItemIds}
                onToggleChecked={toggleCheckedItem}
                onClearChecked={clearCheckedItems}
                onSwitchToPlanner={() => navigateToSection('planner')}
                onExportJson={exportProfileJson}
                onImportJson={importProfileJson}
              />
            )}

            {activeTab === 'planner' && (
              <MonthlyFrequencyPlanner
                catalog={catalog}
                catalogMap={catalogMap}
                bundles={bundles}
                summary={budgetSummary}
                onSetPortions={setItemMonthlyPortions}
                onAdjustPortions={adjustItemMonthlyPortions}
                onSaveBundle={saveMealBundle}
                onDistributeToCalendar={distributeUnscheduledToCalendar}
                onRequestConfirm={setConfirmConfig}
              />
            )}

            {activeTab === 'calendar' && (
              <WeeklyCalendarGrid
                schedule={schedule}
                catalogMap={catalogMap}
                activeWeek={activeWeek}
                pendingItem={pendingItem}
                unscheduledCount={budgetSummary.totalUnscheduledPortions}
                onRequestConfirm={setConfirmConfig}
                onCancelPendingItem={() => setPendingItem(null)}
                onChangeWeek={setActiveWeek}
                onOpenSlotPicker={handleOpenSlotPicker}
                onDropItem={(day, period, itemId) =>
                  assignItemToSlot(day, period, itemId, 1)
                }
                onUpdatePortion={updateSlotPortion}
                onClearDay={clearDaySchedule}
                onCopyWeekToNext={copyWeekToNext}
                onDuplicateWeekToMonth={duplicateWeekToMonth}
                onDistributeUnscheduled={distributeUnscheduledToCalendar}
              />
            )}
          </section>

          {/* Kolom 3: Daftar Belanja Kemasan */}
          <aside
            className={`${mobileTab === 'dashboard' ? 'block' : 'hidden'
              } mf-glass-panel p-4 xl:sticky xl:top-20 xl:block`}
          >
            <GrocerySummaryPanel
              summary={budgetSummary}
              checkedItemIds={checkedItemIds}
              onToggleChecked={toggleCheckedItem}
              onSwitchToCatalog={() => navigateToSection('catalog')}
            />
          </aside>
        </div>
      </main>

      <FloatingGuideWidget
        onJumpToFeature={(workspaceTab, nextMobileTab) => {
          if (workspaceTab) setActiveTab(workspaceTab);
          if (nextMobileTab) setMobileTab(nextMobileTab);
        }}
      />

      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        plannedItemsCount={budgetSummary.lineItems.length}
        pendingShoppingCount={pendingShoppingCount}
      />

      <SlotMenuPickerModal
        target={slotPickerTarget}
        catalog={catalog}
        onClose={() => setSlotPickerTarget(null)}
        onAssignMenu={(day, period, itemId, portions) =>
          assignItemToSlot(day, period, itemId, portions)
        }
      />

      <ConfirmDialog
        config={confirmConfig}
        onClose={() => setConfirmConfig(null)}
      />
    </div>
  );
}

export default App;