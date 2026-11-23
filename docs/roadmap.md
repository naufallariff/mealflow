# Roadmap Pengembangan Mealflow

Dokumen ini merangkum tahapan pengembangan **Mealflow** dari fondasi mesin kalkulasi hingga fitur ekspor, dukungan *offline*, dan *checklist* verifikasi rilis.

## Ringkasan Fase Pengembangan

| Fase | Fokus Utama | Status | Catatan Implementasi |
| :--- | :--- | :--- | :--- |
| **Fase 1: Core Engine & Skema** | *Unit inversion*, pembulatan kemasan ritel, *Smart Pantry Auto-Suggest*, dan skema `CatalogItem` + `macros` | Selesai | Diimplementasikan pada `src/types/meal.ts` dan `src/utils/budget-engine.ts` |
| **Fase 2: Hybrid Dual-Mode UI** | *Interactive Empty State*, *Perencana Frekuensi Bulanan*, *Dashboard & Kasir*, *Kalender 31 Hari*, *Editor Paket Masakan*, dan backup JSON | Selesai | Diimplementasikan pada `src/components/planner/`, `src/components/dashboard/`, dan `src/services/storage-engine.ts` |
| **Fase 3: Kurasi Data, Mobile & PWA** | Kurasi 15 bahan pokok Indonesia, penyesuaian tata letak layar sempit (`375px`), serta *Manifest* & *Service Worker* | Selesai | Diimplementasikan pada `src/data/catalog-items.json`, `src/App.tsx`, `public/manifest.webmanifest`, dan `public/sw.js` |
| **Fase 4: Ekspor & Nutrisi Harian** | Salin daftar belanja siap pakai ke WhatsApp/catatan dan lapisan estimasi gizi harian opsional | Selesai | Diimplementasikan pada `src/utils/export-and-nutrition.ts` dan `src/components/summary/GrocerySummaryPanel.tsx` |
| **Fase 5: Pengujian & Penyempurnaan Lanjutan** | Pengujian end-to-end menyeluruh, optimasi performa pencarian/render besar, dan peningkatan pengalaman paket masakan | Berjalan | Fokus pada validasi pengguna nyata dan stabilitas rilis |

## Detail Tahapan

### Fase 1 — Core Engine & Skema
* Menetapkan tipe data domain (`CatalogItem`, `MealBundle`, `MonthlySchedule`, `GroceryLineItem`, `BudgetSummary`).
* Menghitung pembulatan kemasan utuh (`Math.ceil`), nilai sisa stok, dan peringatan utilisasi kemasan di bawah `50%`.
* Menambahkan saran otomatis minyak goreng dan bumbu dasar berdasarkan intensitas sesi masak bahan segar.

### Fase 2 — Hybrid Dual-Mode UI
* Memprioritaskan pengisian frekuensi bulanan dan kontrol belanja sebelum jadwal kalender 31 hari.
* Menyediakan templat awal cepat untuk anak kos dan rumah tangga, serta modal pembuatan/pengeditan paket masakan.
* Menghubungkan *checklist* belanja kasir dan ekspor/impor profil JSON ke state aplikasi.

### Fase 3 — Kurasi Data, Mobile & PWA
* Menyelaraskan `src/data/catalog-items.json` dengan kategori v2 (`staple-carb`, `animal-protein`, `plant-protein-veg`, `pantry-seasoning`, `home-brew`) dan ID yang dipakai oleh templat awal serta paket masakan.
* Menyesuaikan label tab agar tetap ringkas pada lebar layar `375px` dan memberi ruang bawah yang cukup untuk navigasi seluler.
* Menambahkan `public/manifest.webmanifest` dan `public/sw.js` dengan registrasi *Service Worker* pada build produksi.

### Fase 4 — Ekspor & Nutrisi Harian
* Menambahkan fungsi penyalinan daftar belanja terformat teks ke clipboard dari panel ringkasan dan tampilan dashboard kasir.
* Menambahkan panel estimasi rata-rata gizi harian (energi, protein, karbohidrat, lemak) yang dapat dibuka secara opsional tanpa mengganggu fokus anggaran utama.

### Fase 5 — Pengujian & Penyempurnaan Lanjutan
* Melakukan pengujian alur penuh di peramban desktop dan seluler termasuk mode luring (*offline*) setelah build produksi.
* Meninjau masukan pengguna terkait akurasi takaran kemasan, paket masakan lokal, dan kenyamanan navigasi.

## Checklist Verifikasi Sebelum Rilis

* [ ] **Kompilasi & Build Bersih**: Menjalankan `npx tsc --noEmit` dan `npm run build` tanpa error maupun peringatan kritis.
* [ ] **Konsistensi ID Katalog**: Memastikan seluruh `itemId` pada templat awal dan paket masakan cocok dengan entri di `src/data/catalog-items.json`.
* [ ] **Alur Frekuensi & Pembulatan Kemasan**: Mengubah porsi bahan di *Perencana Bulanan* dan memverifikasi perubahan jumlah kemasan, biaya kasir, serta status sisa stok di *Daftar Belanja*.
* [ ] **Distribusi ke Kalender 31 Hari**: Menekan tombol penyebaran porsi ke kalender dan memastikan jadwal terisi di rentang `M1`–`M5` tanpa menggandakan total porsi.
* [ ] **Persistensi & Cadangan JSON**: Mencadangkan profil ke file JSON, melakukan reset atau perubahan data, lalu memulihkan kembali file JSON tersebut.
* [ ] **Mode Offline & Responsivitas (`375px`)**: Menguji tampilan pada lebar `375px`, tema terang/gelap, serta membuka aplikasi dalam kondisi *offline* melalui `npm run preview`.