# 🍱 Mealflow

**Perencana Anggaran Belanja Pokok Bulanan, Pembulatan Kemasan Ritel & Jadwal Makan 31 Hari**

*Hitung kebutuhan bahan pokok dari takaran konsumsi harian, biarkan sistem membulatkannya ke kemasan pasar utuh, memantau risiko sisa stok, serta menyusun jadwal makan 31 hari secara presisi.*

## 💡 Latar Belakang & Tujuan

Merencanakan anggaran makan bulanan sering kali meleset karena perbedaan antara **takaran yang dikonsumsi** dan **satuan kemasan yang dijual di pasaran**. Kita tidak bisa membeli 2 butir telur, 1 potong ayam, atau 100 gram beras secara terpisah di kasir—pembelian selalu terikat pada satuan kemasan seperti 1 kg telur (±16 butir), 5 kg beras (50 porsi), atau 1 galon air minum.

**Mealflow** hadir sebagai aplikasi web terbuka (*open-source*) yang dirancang dengan pendekatan **Consumption-First Input, Retail-Pack Output** untuk membantu mahasiswa, anak kos, pekerja perantau, maupun pengelola rumah tangga menyusun anggaran belanja pokok bulanan secara realistis, menghindari pembelian kemasan berlebih yang berisiko mubazir, dan secara opsional menyebarkan porsi tersebut ke jadwal makan **31 hari penuh**.

## ✨ Fitur Utama

* 🧩 **Katalog Bahan Pokok & Taksonomi v2**
  Terbagi dalam kategori pokok yang jelas untuk Makanan (*Karbohidrat Pokok*, *Protein Hewani*, *Protein Nabati & Sayur*, *Minyak & Bumbu Dapur*) dan Minuman (*Minuman Pokok Harian*). Setiap item mendefinisikan satuan konsumsi terkecil (`consumptionUnit`), kemasan pasar (`packUnit`), harga kemasan (`packPrice`), dan jumlah porsi per kemasan (`portionsPerPack`), serta mendukung penambahan bahan kustom maupun penyesuaian harga lokal.

* 📊 **Perencana Frekuensi Bulanan & Paket Masakan Cepat**
  Susun porsi bulanan secara langsung menggunakan kontrol langkah (`+/-`) atau input angka cepat, pilih templat awal (*Pola Hemat Anak Kos* atau *Pola Dapur Harian*), serta gunakan **Paket Masakan** (*Editable Meal Bundles*) yang otomatis memecah paket menu menjadi kebutuhan bahan mentah di daftar belanja.

* 🗓️ **Kalender 31 Hari Interaktif (M1–M5) & Distribusi Otomatis**
  Tersedia sebagai lapisan penjadwalan opsional yang terhubung dua arah dengan frekuensi bulanan. Mendukung penyebaran porsi otomatis ke 31 hari (`Sebar Porsi ke Kalender`), *drag-and-drop* di desktop maupun **Tap-to-Place** di layar sentuh, salin antar-minggu, dan duplikasi pola ke 31 hari.

* 🛒 **Kalkulasi Pembulatan Kemasan, Sisa Stok & Saran Minyak/Bumbu**
  Menghitung jumlah kemasan ritel yang wajib dibeli (`Math.ceil(usedPortions / portionsPerPack)`), biaya porsi terpakai vs total bayar kasir, nilai sisa stok akhir bulan, peringatan otomatis jika utilisasi kemasan `< 50%`, serta **Smart Pantry Auto-Suggest** untuk kebutuhan minyak goreng dan bumbu dasar berdasarkan jumlah sesi masak bahan mentah.

* ✅ **Dashboard Berjalan, Checklist Kasir, Ekspor Teks & Cadangan JSON**
  Pantau persentase serapan anggaran, proporsi biaya per kategori, centang item belanja saat di pasar/minimarket, salin ringkasan belanja siap kirim ke WhatsApp atau catatan ponsel, buka lapisan estimasi gizi harian rata-rata 31 hari secara opsional, serta cadangkan atau pulihkan profil data dalam format JSON.

* 🌓 **Mode Terang & Gelap + Dukungan Offline (PWA)**
  Transisi tema mulus berbasis *View Transitions API* dan penyimpanan lokal otomatis di peramban (`localStorage` + *Service Worker* & *Web App Manifest*) tanpa memerlukan akun atau koneksi server.

## 🏗️ Arsitektur Sistem

Mealflow dirancang dengan pendekatan **Local-First & Zero-Backend**, sehingga seluruh komputasi berjalan instan di sisi klien (*client-side*) dengan latensi nol dan privasi penuh.

```
+-------------------------------------------------------------------+
|                        PRESENTATION LAYER                         |
|  FloatingNavbar      |  BudgetTargetCard     |  FloatingGuideWidget|
|  CatalogPanel        |  MonthlyFrequencyPlanner (Templates & Bundles)|
|  OngoingDashboardView|  WeeklyCalendarGrid   |  GrocerySummaryPanel|
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                     STATE & PERSISTENCE LAYER                     |
|     useMealflowStore (Bi-Directional Sync + Memoized Selectors)   |
|     storage-engine.ts (LocalStorage v3 + JSON Backup/Restore)     |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                        CORE DOMAIN ENGINE                         |
|   budget-engine.ts  --->  Agregasi Frekuensi Bulanan & 31 Hari    |
|                     --->  Unit Inversion & Pembulatan Kemasan     |
|                     --->  Sisa Stok (<50% Alert) & Smart Pantry   |
|   export-and-nutrition.ts ---> Ekspor Teks Belanja & Rata-Rata Gizi|
+-------------------------------------------------------------------+

```

### Struktur Direktori

```
mealflow/
├── public/
│   ├── favicon.svg                      # Ikon vektor aplikasi & PWA
│   ├── manifest.webmanifest             # Web App Manifest untuk instalasi PWA
│   └── sw.js                            # Service Worker offline aset & navigasi
├── src/
│   ├── components/
│   │   ├── brand/                       # Identitas visual & monogram MealflowBrandMark
│   │   ├── calendar/                    # Grid mingguan (M1–M5) & kartu slot Pagi/Siang/Malam
│   │   ├── catalog/                     # Panel katalog, kartu item, & modal bahan kustom
│   │   ├── dashboard/                   # Dashboard berjalan, checklist kasir, & backup JSON
│   │   ├── layout/                      # Floating navbar, mobile dock, & panduan ringkas
│   │   ├── planner/                     # Perencana frekuensi bulanan, empty state, & bundle modal
│   │   ├── summary/                     # Kartu target anggaran & rincian daftar belanja
│   │   └── ui/                          # Komponen reusable (ConfirmDialog)
│   ├── data/
│   │   ├── catalog-items.json           # Dataset bahan pokok & minuman bawaan
│   │   └── default-catalog.ts           # Metadata kategori v2, pemetaan katalog, & bundle awal
│   ├── hooks/
│   │   ├── use-mealflow-store.ts        # Pusat manajemen state bulanan, kalender, & katalog
│   │   ├── use-theme.ts                 # Pengelola tema terang/gelap dengan view transition
│   │   └── use-debounced-value.ts       # Optimasi pencarian katalog
│   ├── services/
│   │   └── storage-engine.ts            # Persistensi localStorage v3 & parser impor/ekspor JSON
│   ├── styles/
│   │   ├── tokens.css                   # Design tokens warna, elevasi, & permukaan kaca
│   │   ├── components.css               # Utilitas komponen bento, modal, & responsif
│   │   └── index.css                    # Konfigurasi Tailwind CSS v4 & view transitions
│   ├── types/
│   │   └── meal.ts                      # Definisi kontrak tipe TypeScript
│   └── utils/
│       ├── budget-engine.ts             # Mesin kalkulasi porsi, kemasan, sisa stok, & pantry
│       ├── export-and-nutrition.ts      # Format teks daftar belanja & rata-rata gizi harian
│       └── format.ts                    # Pemformatan mata uang Rupiah (format & ringkas)
├── index.html
├── package.json
└── vite.config.ts

```

## 🛠️ Tumpukan Teknologi

| Lapisan | Teknologi | Peran dalam Sistem | 
| ----- | ----- | ----- | 
| **Framework UI** | React 19 + TypeScript | Komponen deklaratif dengan keamanan tipe ketat (`verbatimModuleSyntax`) | 
| **Build Tool** | Vite | Kompilasi cepat, bundling aset produksi, dan pratinjau lokal | 
| **Styling** | Tailwind CSS v4 | Sistem desain responsif berbasis CSS variables, token kaca, & bento grid | 
| **Ikonografi** | Lucide React | Ikon vektor ringan dan konsisten | 
| **PWA & Offline** | Web Manifest + Service Worker | Penyimpanan aset statis & navigasi offline tanpa dependensi berat | 
| **Linter / Cek** | TypeScript (`tsc`) & Oxlint | Pengecekan tipe ketat dan analisis statis kode | 

## 🚀 Panduan Instalasi & Pengembangan Lokal

### Prasyarat

* **Node.js** versi 18 atau lebih baru (disarankan LTS terbaru)

* **npm** (atau *package manager* yang kompatibel seperti `pnpm` / `yarn`)

### Langkah Menjalankan Proyek

1. **Masuk ke direktori proyek**

   ```
   cd mealflow
   
   ```

2. **Instal dependensi**

   ```
   npm install
   
   ```

3. **Jalankan server pengembangan lokal**

   ```
   npm run dev
   
   ```

4. **Periksa tipe TypeScript dan bangun berkas produksi**

   ```
   npx tsc --noEmit && npm run build
   
   ```

5. **Pratinjau hasil build produksi secara lokal (termasuk pengujian Service Worker / PWA)**

   ```
   npm run preview
   
   ```

## 🤝 Kontribusi

Proyek ini bersifat terbuka dan bebas digunakan untuk keperluan pribadi maupun pengembangan lebih lanjut. Jika Anda menemukan *bug*, memiliki ide penambahan dataset bahan makanan pokok lokal, atau ingin meningkatkan pengalaman pengguna, silakan ajukan *Issue* atau *Pull Request*.

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT**. Lihat berkas [LICENSE](https://www.google.com/search?q=./LICENSE) untuk informasi selengkapnya.