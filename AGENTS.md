# AGENTS.md — Mealflow Workspace

## Gambaran Proyek

Mealflow adalah aplikasi web _local-first_ untuk perencanaan anggaran belanja bahan pokok bulanan, pembulatan kemasan ritel, paket masakan, dan jadwal makan 31 hari opsional bagi anak kos dan rumah tangga di Indonesia.

## Stack & Konvensi Teknis

- **Framework & Bahasa**: React 19, TypeScript (`verbatimModuleSyntax`), Vite.
- **Styling**: Tailwind CSS v4 (gunakan sintaks kanonis v4 seperti `outline-hidden`, `ring-3`, `shadow-xs`, `shrink-0`, `size-*`, dan variabel CSS `--*`).
- **Ikon**: `lucide-react`.
- **Bahasa UI**: Bahasa Indonesia yang jelas, ringkas, dan natural, dengan format mata uang `Rp` (`Intl.NumberFormat('id-ID')`).

## Aturan Domain Utama

1. **Unit Inversion**: Input berorientasi satuan konsumsi harian (`consumptionUnit`), sedangkan output belanja berorientasi pembulatan kemasan ritel utuh (`Math.ceil(usedPortions / portionsPerPack)`) beserta sisa porsi (`leftoverPortions`) dan peringatan utilisasi `< 50%`.
2. **Hierarki Nilai & Tab Awal**: Prioritaskan perencana bulanan dan kontrol kemasan/kasir sebelum jadwal kalender 31 hari. Jaga tab default awal dan hasil reset tetap pada `grocery` (**Dashboard**) dan jangan memaksa pengguna mengisi 31 hari kalender hanya untuk melihat anggaran belanja.
3. **Kalkulasi Deterministik & Guardrail Konfirmasi**: Seluruh perhitungan anggaran, kemasan, dan rata-rata gizi harus berada di kode (`src/utils/`), dan tindakan yang berpotensi menimpa rencana/state (seperti menerapkan templat pola awal, menerapkan pola ke 31 hari, atau reset workspace) harus melewati `ConfirmDialog`.
4. **Aksesibilitas & Sentuhan**: Pertahankan target sentuh minimal `44px` pada kontrol interaktif utama, fokus keyboard (`focus-visible`), dan dukungan `tabular-nums` pada angka finansial/kuantitas.

## Struktur Folder Penting

- `src/types/meal.ts` — Kontrak tipe data utama (`CatalogItem`, `MealBundle`, `MonthlySchedule`, `GroceryLineItem`, `BudgetSummary`).
- `src/utils/budget-engine.ts` — Mesin kalkulasi belanja, kemasan ritel, saran minyak/bumbu otomatis, dan distribusi kalender.
- `src/hooks/use-mealflow-store.ts` — State manajemen terpusat dan sinkronisasi dua arah.
- `src/services/storage-engine.ts` — Persistensi `localStorage` serta ekspor/impor JSON.
- `src/data/catalog-items.json` — Katalog bahan pokok bawaan.
- `src/components/` — Komponen UI terpisah per fitur (`brand`, `catalog`, `planner`, `dashboard`, `calendar`, `summary`, `layout`, `ui`).

## Perintah Verifikasi

- Cek tipe: `npx tsc --noEmit`
- Build produksi: `npm run build`