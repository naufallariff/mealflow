# 🍱 Mealflow

**Perencana Jadwal Makan 31 Hari & Simulasi Daftar Belanja Otomatis**

_Susun pola makan sebulan seperti menyusun puzzle, biarkan sistem menghitung kebutuhan kemasan belanja dan sisa stoknya secara presisi._

---

## 💡 Latar Belakang & Tujuan

Merencanakan anggaran makan bulanan sering kali meleset karena perbedaan antara **porsi yang dimakan** dan **satuan kemasan yang dijual di pasaran**. Kita tidak bisa membeli 2 butir telur atau 150 gram beras secara eceran terus-menerus—pembelian selalu terikat pada satuan kemasan seperti 1 kg telur, 5 kg beras, atau 1 botol kecap.

**Mealflow** hadir sebagai aplikasi web terbuka (_open-source_) yang membantu siapa saja—mulai dari mahasiswa, pekerja perantau, hingga pengelola rumah tangga—untuk menyusun jadwal makan selama **31 hari penuh** secara visual sekaligus mensimulasikan realisasi belanja riil di kasir.

---

## ✨ Fitur Utama

- 🧩 **Katalog Bahan & Menu Terstruktur**
  Terbagi dalam taksonomi kategori yang jelas untuk Makanan (_Bahan Segar_, _Bumbu & Pokok_, _Masakan Harian_, _Restoran & Kafe_) dan Minuman (_Seduh Mandiri_, _Minuman Harian_, _Kafe & Kedai_). Mendukung penambahan item kustom maupun penyesuaian harga satuan lokal.
- 🗓️ **Kalender 31 Hari Interaktif (M1–M5)**
  Navigasi per minggu dengan dukungan _drag-and-drop_ di desktop maupun mode cepat **Tap-to-Place** di layar sentuh. Dilengkapi fitur salin antar-minggu, duplikasi pola ke 31 hari, serta template jadwal siap pakai.
- 🛒 **Kalkulasi Pembulatan Kemasan Otomatis**
  Menghitung jumlah kemasan yang wajib dibeli (`Math.ceil(totalPorsi / porsiPerKemasan)`), estimasi biaya belanja makanan vs minuman, nilai konsumsi aktual, serta **sisa stok porsi** di akhir bulan.
- 🎯 **Pemantauan Target Anggaran Real-Time**
  Indikator progres anggaran bulanan dengan batas bebas atau preset nominal cepat untuk mencegah pengeluaran melebihi rencana.
- 🌓 **Mode Terang & Gelap + Dukungan Offline (PWA)**
  Transisi tema mulus berbasis _View Transitions API_ dan penyimpanan lokal otomatis di peramban tanpa memerlukan akun atau koneksi server.

---

## 🏗️ Arsitektur Sistem

Mealflow dirancang dengan pendekatan **Local-First & Zero-Backend**, sehingga seluruh komputasi berjalan instan di sisi klien (_client-side_) dengan latensi nol dan privasi penuh.

```text
+-------------------------------------------------------------------+
|                        PRESENTATION LAYER                         |
|  FloatingNavbar  |  BudgetTargetCard  |  FloatingGuideWidget      |
|  CatalogPanel    |  WeeklyCalendarGrid|  GrocerySummaryPanel      |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                     STATE & PERSISTENCE LAYER                     |
|          useMealflowStore (React State + Memoized Selectors)      |
|          storage-engine.ts (Versioned LocalStorage Sync)          |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                        CORE DOMAIN ENGINE                         |
|   budget-engine.ts  --->  Agregasi Porsi 31 Hari                  |
|                     --->  Pembulatan Kemasan Grosir/Ritel         |
|                     --->  Kalkulasi Konsumsi & Sisa Stok          |
+-------------------------------------------------------------------+

```

### Struktur Direktori

```text
mealflow/
├── public/
│   └── favicon.svg                 # Ikon vektor aplikasi & PWA
├── src/
│   ├── components/
│   │   ├── brand/                  # Identitas visual Mealflow
│   │   ├── calendar/               # Grid mingguan (M1–M5) & kartu slot Pagi/Siang/Malam
│   │   ├── catalog/                # Panel katalog, kartu item, & modal kustomisasi
│   │   ├── layout/                 # Floating navbar, mobile dock, & panduan ringkas
│   │   ├── summary/                # Kartu target anggaran & rincian daftar belanja
│   │   └── ui/                     # Komponen reusable (ConfirmDialog, CustomSelect)
│   ├── data/
│   │   ├── catalog-items.json      # Dataset bahan makanan & minuman bawaan
│   │   ├── weekly-presets.json     # Pola jadwal mingguan opsional
│   │   └── default-catalog.ts      # Metadata kategori & pemetaan katalog
│   ├── hooks/
│   │   ├── use-mealflow-store.ts   # Pusat manajemen state jadwal, katalog, & anggaran
│   │   ├── use-theme.ts            # Pengelola tema terang/gelap dengan radial transition
│   │   └── use-debounced-value.ts  # Optimasi pencarian katalog
│   ├── services/
│   │   └── storage-engine.ts       # Abstraksi penyimpanan lokal aman
│   ├── styles/
│   │   ├── tokens.css              # Design tokens warna, elevasi, & permukaan kaca
│   │   ├── components.css          # Utilitas komponen bento & responsif
│   │   └── index.css               # Konfigurasi Tailwind CSS v4 & view transitions
│   ├── types/
│   │   └── meal.ts                 # Definisi kontrak tipe TypeScript
│   └── utils/
│       ├── budget-engine.ts        # Mesin kalkulasi porsi, kemasan, & sisa stok
│       └── currency.ts             # Pemformatan mata uang Rupiah
├── index.html
├── package.json
└── vite.config.ts

```

---

## 🛠️ Tumpukan Teknologi

| Lapisan           | Teknologi             | Peran dalam Sistem                                                      |
| ----------------- | --------------------- | ----------------------------------------------------------------------- |
| **Framework UI**  | React 19 + TypeScript | Komponen deklaratif dengan keamanan tipe ketat (`verbatimModuleSyntax`) |
| **Build Tool**    | Vite                  | Kompilasi cepat dan bundling aset produksi                              |
| **Styling**       | Tailwind CSS v4       | Sistem desain responsif berbasis CSS variables & bento grid             |
| **Ikonografi**    | Lucide React          | Ikon vektor ringan dan konsisten                                        |
| **PWA & Offline** | Vite Plugin PWA       | _Service worker_ otomatis agar aplikasi tetap berjalan tanpa internet   |
| **Linter**        | Oxlint                | Analisis statis kode berkecepatan tinggi berbasis Rust                  |

---

## 🚀 Panduan Instalasi & Pengembangan Lokal

---

## 🤝 Kontribusi

Proyek ini bersifat terbuka dan bebas digunakan untuk keperluan pribadi maupun pengembangan lebih lanjut. Jika Anda menemukan _bug_, memiliki ide penambahan dataset bahan makanan lokal, atau ingin meningkatkan pengalaman pengguna, silakan ajukan _Issue_ atau _Pull Request_.

---

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT**. Lihat berkas [LICENSE](https://www.google.com/search?q=./LICENSE) untuk informasi selengkapnya.
