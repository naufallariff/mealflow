// src/App.tsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Sparkles, Utensils, X } from 'lucide-react';
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

const MEAL_PERIOD_OPTIONS = [
  {
    key: 'breakfast',
    label: 'Pagi',
    dotClass: 'bg-amber-500',
    activeClass:
      'bg-amber-500/18 text-amber-800 border-amber-500/40 dark:text-amber-300',
  },
  {
    key: 'lunch',
    label: 'Siang',
    dotClass: 'bg-emerald-500',
    activeClass:
      'bg-emerald-500/18 text-emerald-800 border-emerald-500/40 dark:text-emerald-300',
  },
  {
    key: 'dinner',
    label: 'Malam',
    dotClass: 'bg-indigo-500',
    activeClass:
      'bg-indigo-500/18 text-indigo-800 border-indigo-500/40 dark:text-indigo-300',
  },
] as const;

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
  const [showGuide, setShowGuide] = useLocalStorage<boolean>(
    'mealflow:show-guide:v1',
    true,
  );

  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [mobileTab, setMobileTab] = useState<MobileTab>('calendar');

  // Quick-Schedule Bottom Sheet State (Mobile & Fast Desktop Tap)
  const [sheetItem, setSheetItem] = useState<CatalogItem | null>(null);
  const [sheetDay, setSheetDay] = useState<number>(1);
  const [sheetPeriod, setSheetPeriod] = useState<MealPeriod>('lunch');
  const [sheetPortions, setSheetPortions] = useState<number>(1);

  // Tutup sheet dengan tombol Escape (Apple HIG Keyboard Accessibility)
  useEffect(() => {
    if (!sheetItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sheetItem]);

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
        const srcPlan = prev[srcStart + offset] ?? {
          breakfast: [],
          lunch: [],
          dinner: [],
        };
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
        const srcPlan = prev[srcDay] ?? {
          breakfast: [],
          lunch: [],
          dinner: [],
        };
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
    <div className="mf-liquid-canvas">
      {/* Sticky Translucent Liquid Navbar */}
      <FloatingNavbar
        showGuide={showGuide}
        onToggleGuide={() => setShowGuide((v) => !v)}
        onApplyPreset={applyPreset}
        onResetAll={resetAll}
      />

      {/* Full-Width Fluid Workspace */}
      <main className="mf-fluid-container space-y-5 pt-4 sm:pt-5">
        {/* Optional Quick-Start Liquid Glass Guide Banner */}
        {showGuide && (
          <section
            aria-label="Panduan singkat Mealflow"
            className="mf-glass-panel flex flex-wrap items-center justify-between gap-3.5 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-glass text-brand">
                <Utensils className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold tracking-tight text-ink-primary sm:text-[13px]">
                  Cara Cepat Menggunakan Mealflow
                </p>
                <p className="text-xs leading-relaxed text-ink-secondary">
                  1. Klik <strong className="text-ink-primary">+ Pasang</strong> (atau drag) item
                  dari Katalog ke slot{' '}
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Pagi</span> /{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Siang</span> /{' '}
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Malam</span>.
                  2. Gunakan tombol <strong className="text-ink-primary">− 1x +</strong> untuk atur
                  porsi (misal 2x untuk berdua). 3. Cek pembulatan kemasan & sisa stok otomatis
                  di panel Belanja.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {WEEKLY_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  data-variant="berry"
                  className="mf-liquid-pill text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{preset.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                aria-label="Tutup panduan"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/70 text-ink-secondary transition-transform duration-150 hover:bg-white active:scale-90 dark:border-white/15 dark:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* Top KPI & Honest Budget Target Strip */}
        <BudgetTargetCard
          summary={summary}
          targetBudget={targetBudget}
          onChangeTarget={setTargetBudget}
        />

        {/* 3-Column Full-Width Desktop Workspace / Tabbed Mobile View */}
        <div className="mf-workspace-grid">
          {/* Kolom 1: Katalog Bahan & Menu */}
          <aside
            className={`${mobileTab === 'catalog' ? 'block' : 'hidden'
              } lg:block lg:sticky lg:top-20 mf-glass-panel p-4`}
          >
            <CatalogPanel
              items={allCatalog}
              usageCounts={usageCounts}
              onQuickSchedule={handleOpenQuickSchedule}
              onAddCustomItem={(item) => setCustomItems((prev) => [item, ...prev])}
              onDeleteCustomItem={(id) =>
                setCustomItems((prev) => prev.filter((item) => item.id !== id))
              }
            />
          </aside>

          {/* Kolom 2: Kalender Rencana Makan 31 Hari */}
          <section
            className={`${mobileTab === 'calendar' ? 'block' : 'hidden'
              } lg:block min-w-0 mf-glass-panel p-4 sm:p-5`}
          >
            <WeeklyCalendarGrid
              schedule={schedule}
              catalogMap={catalogMap}
              activeWeek={activeWeek}
              onChangeWeek={setActiveWeek}
              onDropItem={(day, period, itemId) =>
                addEntryToSlot(day, period, itemId, 1)
              }
              onUpdatePortion={updatePortionInSlot}
              onClearDay={clearDay}
              onCopyWeekToNext={copyWeekToNext}
              onDuplicateWeekToMonth={duplicateWeekToMonth}
            />
          </section>

          {/* Kolom 3: Rekap Belanja Realistis */}
          <aside
            className={`${mobileTab === 'summary' ? 'block' : 'hidden'
              } lg:block lg:col-span-2 2xl:col-span-1 2xl:sticky 2xl:top-20 mf-glass-panel p-4`}
          >
            <GrocerySummaryPanel summary={summary} />
          </aside>
        </div>
      </main>

      {/* Mobile Floating Liquid Dock */}
      <MobileBottomNav
        activeTab={mobileTab}
        onChangeTab={setMobileTab}
        scheduledCount={summary.totalUsedPortions}
        groceryItemCount={summary.lineItems.length}
      />

      {/* Apple Liquid Glass Quick-Schedule Sheet */}
      {sheetItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-schedule-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSheetItem(null);
          }}
          className="mf-modal-scrim items-end p-0 sm:items-center sm:p-4"
        >
          <div className="mf-modal-glass rounded-b-none sm:rounded-[1.5rem]">
            {/* Drag Handle Indicator (Mobile Sheet Cue) */}
            <div
              aria-hidden="true"
              className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-400/40 sm:hidden"
            />

            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-glass px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-brand uppercase">
                  <CalendarDays className="h-3 w-3" />
                  Pasang ke Jadwal
                </span>
                <h3
                  id="quick-schedule-title"
                  className="mt-1.5 text-lg font-extrabold tracking-tight text-ink-primary"
                >
                  {sheetItem.name}
                </h3>
                <p className="text-xs font-medium text-ink-muted">
                  Kemasan: {sheetItem.packUnit}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSheetItem(null)}
                aria-label="Tutup modal"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-ink-secondary transition-transform duration-150 hover:bg-white active:scale-90 dark:border-white/15 dark:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Day Selector */}
              <div>
                <label
                  htmlFor="sheet-day-select"
                  className="block text-xs font-semibold text-ink-secondary"
                >
                  Pilih Hari (1 – 31)
                </label>
                <select
                  id="sheet-day-select"
                  value={sheetDay}
                  onChange={(e) => setSheetDay(Number(e.target.value))}
                  className="mt-1.5 h-11 w-full rounded-2xl border border-black/10 bg-white/80 px-3.5 text-sm font-semibold text-ink-primary shadow-2xs outline-none transition-shadow focus:ring-2 focus:ring-brand/30 dark:border-white/15 dark:bg-white/10"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d} className="text-slate-900">
                      Hari ke-{d} (Minggu {Math.ceil(d / 7)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Colorful OS Meal Slot Selector */}
              <div>
                <span className="block text-xs font-semibold text-ink-secondary">
                  Waktu Makan
                </span>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {MEAL_PERIOD_OPTIONS.map((slot) => {
                    const isSelected = sheetPeriod === slot.key;
                    return (
                      <button
                        key={slot.key}
                        type="button"
                        onClick={() => setSheetPeriod(slot.key)}
                        className={`flex items-center justify-center gap-1.5 rounded-2xl border py-2.5 text-xs font-bold transition-all duration-150 active:scale-95 ${isSelected
                            ? `${slot.activeClass} shadow-xs`
                            : 'border-black/8 bg-white/55 text-ink-secondary hover:bg-white/80 dark:border-white/10 dark:bg-white/5'
                          }`}
                      >
                        <span className={`h-2 w-2 rounded-full ${slot.dotClass}`} />
                        <span>{slot.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Portion Multiplier Pills */}
              <div>
                <span className="block text-xs font-semibold text-ink-secondary">
                  Jumlah Porsi (1x = sendiri, 2x = berdua)
                </span>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((qty) => {
                    const isSelected = sheetPortions === qty;
                    return (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setSheetPortions(qty)}
                        data-variant={isSelected ? 'primary' : undefined}
                        className="mf-liquid-pill tabular-nums w-full font-extrabold"
                      >
                        {qty}x
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={confirmQuickSchedule}
                data-variant="primary"
                className="mf-liquid-pill mt-2 h-12 w-full text-sm font-bold"
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