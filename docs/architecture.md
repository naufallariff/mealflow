# Arsitektur Sistem Mealflow

Dokumen ini menjelaskan arsitektur teknis, aliran data (*state flow*), mesin kalkulasi domain, penyimpanan lokal (*local-first*), dan mekanisme *offline* pada aplikasi web **Mealflow**.

## 1. Filosofi Desain & Pendekatan Teknis

Mealflow dibangun sebagai aplikasi **Local-First & Zero-Backend**:

- **Tanpa Ketergantungan Server**: Seluruh perhitungan porsi, pembulatan kemasan ritel, estimasi gizi, dan pencatatan status belanja dijalankan langsung di peramban pengguna.
- **Consumption-First Input, Retail-Pack Output**: Pengguna memasukkan kebutuhan berdasarkan satuan konsumsi harian (`consumptionUnit`), sedangkan sistem mengonversinya menjadi kebutuhan kemasan utuh di pasar (`packUnit`) beserta sisa porsi (`leftoverPortions`).
- **Sinkronisasi Dua Arah (*Bi-Directional Sync*)**: Perubahan pada frekuensi porsi bulanan maupun jadwal kalender 31 hari bermuara pada satu sumber kebenaran yang dihitung ulang secara reaktif menggunakan `useMemo`.
- **Entry Standar Berbasis Dashboard**: Titik masuk awal aplikasi dan hasil reset workspace diarahkan ke tampilan `grocery` (**Dashboard**), sementara **Rencana** dan **Kalender** diakses melalui navigasi tab yang tersinkronisasi.

## 2. Lapisan Sistem (*System Layers*)

### A. Presentation Layer (`src/components/`)

Terbagi menjadi beberapa modul berbasis tanggung jawab fitur:

- **`brand/` (`MealflowBrandMark.tsx`)**: Menampilkan monogram geometris `M`, garis aliran, dan *wordmark* Mealflow yang aman digunakan berulang dengan ID gradien unik (`useId`).
- **`layout/` (`FloatingNavbar.tsx`, `MobileBottomNav.tsx`, `FloatingGuideWidget.tsx`)**: Navigasi utama desktop dan seluler, sakelar tema terang/gelap, aksi reset workspace, serta panduan singkat kontekstual.
- **`summary/` (`BudgetTargetCard.tsx`, `GrocerySummaryPanel.tsx`)**: Kartu target anggaran dan metrik serapan bulanan, rincian kemasan kasir, peringatan sisa stok `< 50%`, saran minyak/bumbu otomatis, penyalinan daftar belanja ke clipboard, serta akordeon estimasi gizi harian opsional.
- **`planner/` (`MonthlyFrequencyPlanner.tsx`, `InteractiveEmptyState.tsx`, `MealBundleModal.tsx`)**: Tabel frekuensi konsumsi 31 hari dengan kontrol `+/-` dan input angka, templat awal cepat (*Pola Hemat Anak Kos* dan *Pola Dapur Harian*) dengan konfirmasi sebelum diterapkan, serta editor paket masakan yang memecah paket menjadi komponen bahan baku.
- **`dashboard/` (`OngoingDashboardView.tsx`, `WorkspaceBackupBar.tsx`)**: Pemantauan serapan anggaran, proporsi biaya per kategori, *checklist* eksekusi kasir, serta ekspor/impor profil JSON.
- **`calendar/` (`WeeklyCalendarGrid.tsx`, `MealSlotCard.tsx`, `SlotMenuPickerModal.tsx`)**: Jadwal opsional 31 hari terbagi dalam 5 rentang minggu (`M1` s.d. `M5`) dan tiga waktu makan (`breakfast`, `lunch`, `dinner`), mendukung penyebaran porsi otomatis, *drag-and-drop*, *Tap-to-Place*, serta pemilihan menu langsung per slot melalui `SlotMenuPickerModal`.
- **`ui/` (`ConfirmDialog.tsx`)**: Dialog konfirmasi terpusat untuk tindakan destruktif atau berpotensi menimpa rencana, seperti reset data, penghapusan item, duplikasi pola bulanan, dan penerapan templat pola awal.

### B. State & Persistence Layer (`src/hooks/` & `src/services/`)

- **`use-mealflow-store.ts`**: Menyimpan state utama (`activeTab`, `targetBudget`, `activeWeek`, `unscheduledPortions`, `schedule`, `checkedItemIds`, `catalogOverrides`, `customItems`, `hiddenItemIds`, `customBundles`), menggabungkan katalog bawaan dengan kustomisasi pengguna, menghasilkan `budgetSummary`, dan mengembalikan `activeTab` ke `'grocery'` saat reset.
- **`storage-engine.ts`**: Mengelola pembacaan dan penyimpanan terdebounce ke `localStorage` (`mealflow.workspace.v3`), *flush* saat `beforeunload`, serta validasi ekspor dan impor snapshot JSON.
- **`use-theme.ts` & `use-debounced-value.ts`**: Mengatur tema terang/gelap dan *debounce* input pencarian katalog.

### C. Core Domain Engine (`src/utils/` & `src/types/`)

- **`types/meal.ts`**: Mendefinisikan tipe inti seperti `CatalogItem`, `MealBundle`, `MonthlySchedule`, `GroceryLineItem`, `NutritionMacro`, dan `BudgetSummary`.
- **`budget-engine.ts`**:
  - Mengagregasi porsi dari jadwal kalender 31 hari (`scheduledPortions`) dan frekuensi bulanan langsung (`unscheduledPortions`), termasuk ekspansi komponen `MealBundle`.
  - Menghitung `unitConsumptionPrice`, `consumedCost`, `packsToBuy` (`Math.ceil(usedPortions / safeYield)`), `retailCheckoutCost`, `leftoverPortions`, `utilizationPercent`, dan penanda `isLowUtilization` (`safeYield > 1 && utilizationPercent < 50`).
  - Menghasilkan saran kebutuhan minyak goreng dan bumbu dasar (`buildSmartPantrySuggestions`) berdasarkan jumlah sesi masak (`requiresCooking`) apabila item kategori `pantry-seasoning` belum dipilih secara eksplisit.
  - Menyediakan `distributePortionsToSchedule` untuk menyebarkan porsi yang belum terjadwal secara merata ke kalender 31 hari.
- **`export-and-nutrition.ts`**: Menghitung rata-rata nutrisi harian (`calculateDailyNutritionAverage`) dan memformat teks daftar belanja (`formatShoppingListPlainText`).
- **`format.ts`**: Memformat nilai angka menjadi format mata uang Rupiah (`formatRupiah` dan `formatCompactRupiah`).

## 3. Alur Data Utama (*Data Flow*)

```text
catalog-items.json + customItems + catalogOverrides
                        │
                        ▼
               catalogMap & bundleMap
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
unscheduledPortions             schedule (Days 1..31)
        │                               │
        └───────────────┬───────────────┘
                        ▼
             calculateBudgetSummary()
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
BudgetTargetCard  GrocerySummary  OngoingDashboard
```

## 4. Persistensi Lokal & PWA Offline

- **Penyimpanan Lokal**: Perubahan state dijadwalkan untuk disimpan ke `localStorage` setelah jeda singkat (`250ms`) guna menjaga responsivitas UI saat pengguna menekan tombol `+/-` berulang kali.
- **Cadangan Portabel**: Pengguna dapat mengunduh snapshot JSON melalui `exportProfileJson()` dan memulihkannya kembali melalui `importProfileJson()`.
- **Dukungan Offline**: Pada mode produksi (`import.meta.env.PROD`), `src/main.tsx` mendaftarkan `public/sw.js` bersama `public/manifest.webmanifest` untuk melakukan *cache* aset aplikasi dan fallback navigasi secara lokal.