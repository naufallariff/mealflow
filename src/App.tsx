// src/App.tsx

import { useCallback, useMemo, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import type { CatalogItem, MealPeriod, MonthlySchedule } from './types/meal';
import { DEFAULT_CATALOG, WEEKLY_PRESETS } from './data/default-catalog';
import { calculateBudgetSummary, createEmptyMonthlySchedule } from './utils/budget-engine';
import { useLocalStorage } from './hooks/use-local-storage';
import { FloatingNavbar } from './components/layout/FloatingNavbar';
import { MobileBottomNav, type MobileTab } from './components/layout/MobileBottomNav';
import { BudgetTargetCard } from './components/summary/BudgetTargetCard';
import { GrocerySummaryPanel } from './components/summary/GrocerySummaryPanel';
import { CatalogPanel } from './components/catalog/CatalogPanel';
import { WeeklyCalendarGrid } from './components/calendar/WeeklyCalendarGrid';

export function App() {
  const [schedule, setSchedule] = useLocalStorage<MonthlySchedule>(
    'mealflow:schedule:v1',
    () => createEmptyMonthlySchedule(31),
  );
  const [customItems, setCustomItems] = useLocalStorage<CatalogItem[]>(
    'mealflow:custom-items:v1',
    [],
  );
  const [targetBudget, setTargetBudget] = useLocalStorage<number>(
    'mealflow:target-budget:v1',
    0,
  );
  const [showGuide, setShowGuide] = useLocalStorage<boolean>('mealflow:show-guide:v1', true);

  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<MobileTab>('calendar');

  // Quick-Schedule Bottom Sheet State (Mobile & Fast Desktop Tap)
  const [sheetItem, setSheetItem] = useState<CatalogItem | null>(null);
  const [sheetDay, setSheetDay] = useState<number>(1);
  const [sheetPeriod, setSheetPeriod] = useState<MealPeriod>('lunch');
  const [sheetPortions, setSheetPortions] = useState<number>(1);

  const allCatalog = useMemo(
    () => [...customItems, ...DEFAULT_CATALOG],
    [customItems],
  );

  const catalogMap = useMemo(() => {
    const map = new Map<string, CatalogItem>();
    for (const item of allCatalog) {
      map.set(item.id, item);
    }
    return map;
  }, [allCatalog]);

  const summary = useMemo(
    () => calculateBudgetSummary(schedule, catalogMap, targetBudget),
    [schedule, catalogMap, targetBudget],
  );

  const usageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const line of summary.lineItems) {
      counts.set(line.item.id, line.usedPortions);
    }
    return counts;
  }, [summary.lineItems]);

  const addEntryToSlot = useCallback(
    (day: number, period: MealPeriod, itemId: string, portionsToAdd = 1) => {
      setSchedule((prev) => {
        const dayPlan = prev[day] ?? { breakfast: [], lunch: [], dinner: [] };
        const currentList = dayPlan[period];
        const existingIndex = currentList.findIndex((e) => e.itemId === itemId);

        const nextList =
          existingIndex >= 0
            ? currentList.map((entry, idx) =>
              idx === existingIndex
                ? { ...entry, portions: entry.portions + portionsToAdd }
                : entry,
            )
            : [...currentList, { itemId, portions: portionsToAdd }];

        return {
          ...prev,
          [day]: {
            ...dayPlan,
            [period]: nextList,
          },
        };
      });
    },
    [setSchedule],
  );

  const updatePortionInSlot = useCallback(
    (day: number, period: MealPeriod, itemId: string, delta: number) => {
      setSchedule((prev) => {
        const dayPlan = prev[day];
        if (!dayPlan) return prev;

        const nextList = dayPlan[period]
          .map((entry) =>
            entry.itemId === itemId
              ? { ...entry, portions: entry.portions + delta }
              : entry,
          )
          .filter((entry) => entry.portions > 0);

        return {
          ...prev,
          [day]: {
            ...dayPlan,
            [period]: nextList,
          },
        };
      });
    },
    [setSchedule],
  );

  const clearDay = useCallback(
    (day: number) => {
      setSchedule((prev) => ({
        ...prev,
        [day]: { breakfast: [], lunch: [], dinner: [] },
      }));
    },
    [setSchedule],
  );

  const copyWeekToNext = useCallback(() => {
    if (activeWeek >= 5) return;
    setSchedule((prev) => {
      const next = { ...prev };
      const srcStart = (activeWeek - 1) * 7 + 1;
      const dstStart = activeWeek * 7 + 1;

      for (let offset = 0; offset < 7; offset += 1) {
        const dstDay = dstStart + offset;
        if (dstDay > 31) break;
        const srcPlan = prev[srcStart + offset] ?? { breakfast: [], lunch: [], dinner: [] };
        next[dstDay] = {
          breakfast: srcPlan.breakfast.map((e) => ({ ...e })),
          lunch: srcPlan.lunch.map((e) => ({ ...e })),
          dinner: srcPlan.dinner.map((e) => ({ ...e })),
        };
      }
      return next;
    });
    setActiveWeek((w) => Math.min(5, w + 1));
  }, [activeWeek, setSchedule]);

  const duplicateWeekToMonth = useCallback(() => {
    setSchedule((prev) => {
      const next = createEmptyMonthlySchedule(31);
      const srcStart = (activeWeek - 1) * 7 + 1;

      for (let day = 1; day <= 31; day += 1) {
        const offset = (day - 1) % 7;
        const srcDay = Math.min(31, srcStart + offset);
        const srcPlan = prev[srcDay] ?? { breakfast: [], lunch: [], dinner: [] };
        next[day] = {
          breakfast: srcPlan.breakfast.map((e) => ({ ...e })),
          lunch: srcPlan.lunch.map((e) => ({ ...e })),
          dinner: srcPlan.dinner.map((e) => ({ ...e })),
        };
      }
      return next;
    });
  }, [activeWeek, setSchedule]);

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
      setSchedule(next);
      setActiveWeek(1);
    },
    [setSchedule],
  );

  const resetAll = useCallback(() => {
    setSchedule(createEmptyMonthlySchedule(31));
    setTargetBudget(0);
    setActiveWeek(1);
  }, [setSchedule, setTargetBudget]);

  const handleOpenQuickSchedule = useCallback(
    (item: CatalogItem) => {
      setSheetItem(item);
      setSheetDay((activeWeek - 1) * 7 + 1);
      setSheetPeriod(item.kind === 'drink' ? 'breakfast' : 'lunch');
      setSheetPortions(1);
    },
    [activeWeek],
  );

  const confirmQuickSchedule = () => {
    if (!sheetItem) return;
    addEntryToSlot(sheetDay, sheetPeriod, sheetItem.id, sheetPortions);
    setSheetItem(null);
  };

  return (
    <div className="min-h-dvh bg-[#F2F2F7] pb-24 text-[#1C1C1E] lg:pb-10">
      <FloatingNavbar
        showGuide={showGuide}
        onToggleGuide={() => setShowGuide((v) => !v)}
        onApplyPreset={applyPreset}
        onResetAll={resetAll}
      />

      <main className="w-full space-y-4 px-3 pt-4 sm:px-5 lg:px-7">
        {/* Optional Quick-Start Guide Banner */}
        {showGuide && (
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#007AFF]/25 bg-white p-3.5 shadow-2xs">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#1C1C1E]">
                Cara Cepat Menggunakan Mealflow
              </p>
              <p className="text-xs text-[#636366]">
                1. Klik <strong>+ Pasang</strong> (atau drag) item dari Katalog ke slot{' '}
                <strong>Pagi / Siang / Malam</strong>. 2. Gunakan tombol{' '}
                <strong>− 1x +</strong> untuk mengatur porsi (misal 2x untuk berdua). 3. Cek pembulatan kemasan & sisa stok otomatis di panel Belanja.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {WEEKLY_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-2.5 py-1.5 text-xs font-medium text-[#007AFF] hover:bg-[#F2F2F7]"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>{preset.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Tutup panduan"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F2F2F7] text-[#636366]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* Top KPI & Budget Target Bar */}
        <BudgetTargetCard
          summary={summary}
          targetBudget={targetBudget}
          onChangeTarget={setTargetBudget}
        />

        {/* 3-Column Full-Width Desktop Workspace / Tabbed Mobile View */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)_330px] xl:grid-cols-[340px_minmax(0,1fr)_350px]">
          <div className={mobileTab === 'catalog' ? 'block' : 'hidden lg:block'}>
            <CatalogPanel
              items={allCatalog}
              usageCounts={usageCounts}
              onQuickSchedule={handleOpenQuickSchedule}
              onAddCustomItem={(item) => setCustomItems((prev) => [item, ...prev])}
              onDeleteCustomItem={(id) =>
                setCustomItems((prev) => prev.filter((item) => item.id !== id))
              }
            />
          </div>

          <div className={mobileTab === 'calendar' ? 'block' : 'hidden lg:block'}>
            <WeeklyCalendarGrid
              schedule={schedule}
              catalogMap={catalogMap}
              activeWeek={activeWeek}
              onChangeWeek={setActiveWeek}
              onDropItem={(day, period, itemId) => addEntryToSlot(day, period, itemId, 1)}
              onUpdatePortion={updatePortionInSlot}
              onClearDay={clearDay}
              onCopyWeekToNext={copyWeekToNext}
              onDuplicateWeekToMonth={duplicateWeekToMonth}
            />
          </div>

          <div className={mobileTab === 'summary' ? 'block' : 'hidden lg:block'}>
            <GrocerySummaryPanel summary={summary} />
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={mobileTab}
        onChangeTab={setMobileTab}
        scheduledCount={summary.totalUsedPortions}
        groceryItemCount={summary.lineItems.length}
      />

      {/* iOS Quick-Schedule Bottom Sheet */}
      {sheetItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
        >
          <div className="w-full max-w-md rounded-t-3xl border border-[#E5E5EA] bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-semibold text-[#007AFF] uppercase">
                  Pasang ke Jadwal
                </span>
                <h3 className="text-base font-semibold text-[#1C1C1E]">{sheetItem.name}</h3>
                <p className="text-xs text-[#636366]">{sheetItem.packUnit}</p>
              </div>
              <button
                type="button"
                onClick={() => setSheetItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] text-[#636366]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#636366]">
                  Pilih Hari (1 – 31)
                </label>
                <select
                  value={sheetDay}
                  onChange={(e) => setSheetDay(Number(e.target.value))}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E5E5EA] bg-[#F8F9FB] px-3 text-sm font-medium text-[#1C1C1E]"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Hari ke-{d} (Minggu {Math.ceil(d / 7)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#636366]">Waktu Makan</label>
                <div className="mt-1 grid grid-cols-3 gap-1.5 rounded-xl bg-[#F2F2F7] p-1">
                  {(
                    [
                      { key: 'breakfast', label: 'Pagi' },
                      { key: 'lunch', label: 'Siang' },
                      { key: 'dinner', label: 'Malam' },
                    ] as const
                  ).map((slot) => (
                    <button
                      key={slot.key}
                      type="button"
                      onClick={() => setSheetPeriod(slot.key)}
                      className={`rounded-lg py-2 text-xs font-semibold ${sheetPeriod === slot.key
                          ? 'bg-white text-[#1C1C1E] shadow-2xs'
                          : 'text-[#636366]'
                        }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#636366]">
                  Jumlah Porsi (1x = sendiri, 2x = berdua)
                </label>
                <div className="mt-1 grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setSheetPortions(qty)}
                      className={`tabular-nums rounded-xl border py-2 text-xs font-bold ${sheetPortions === qty
                          ? 'border-[#007AFF] bg-[#007AFF] text-white'
                          : 'border-[#E5E5EA] bg-[#F8F9FB] text-[#1C1C1E]'
                        }`}
                    >
                      {qty}x
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={confirmQuickSchedule}
                className="mt-2 h-11 w-full rounded-xl bg-[#007AFF] text-sm font-semibold text-white shadow-xs hover:bg-[#0066D6] active:scale-[0.98]"
              >
                Terapkan ke Hari ke-{sheetDay}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;