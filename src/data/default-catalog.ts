// src/data/default-catalog.ts

import type { CatalogCategory, CatalogItem, MealPeriod } from '../types/meal';

export const CATEGORY_META: Record<
    CatalogCategory,
    { readonly label: string; readonly badgeBg: string; readonly badgeText: string; readonly dotColor: string }
> = {
    'raw-ingredient': {
        label: 'Bahan Mentah',
        badgeBg: 'bg-emerald-50 border-emerald-200',
        badgeText: 'text-emerald-700',
        dotColor: 'bg-emerald-500',
    },
    'seasoning-pantry': {
        label: 'Bumbu & Pantry',
        badgeBg: 'bg-amber-50 border-amber-200',
        badgeText: 'text-amber-700',
        dotColor: 'bg-amber-500',
    },
    'street-food': {
        label: 'Warung & Kaki Lima',
        badgeBg: 'bg-rose-50 border-rose-200',
        badgeText: 'text-rose-700',
        dotColor: 'bg-rose-500',
    },
    'fancy-mall': {
        label: 'Fancy & Mall',
        badgeBg: 'bg-purple-50 border-purple-200',
        badgeText: 'text-purple-700',
        dotColor: 'bg-purple-500',
    },
    'home-brew': {
        label: 'Seduh Sendiri',
        badgeBg: 'bg-sky-50 border-sky-200',
        badgeText: 'text-sky-700',
        dotColor: 'bg-sky-500',
    },
    'street-drink': {
        label: 'Warung & Gerobak',
        badgeBg: 'bg-teal-50 border-teal-200',
        badgeText: 'text-teal-700',
        dotColor: 'bg-teal-500',
    },
    'cafe-mall': {
        label: 'Cafe & Mall',
        badgeBg: 'bg-indigo-50 border-indigo-200',
        badgeText: 'text-indigo-700',
        dotColor: 'bg-indigo-500',
    },
};

export const DEFAULT_CATALOG: readonly CatalogItem[] = [
    // ================= RAW INGREDIENTS (40 ITEMS) =================
    { id: 'f-rice-5kg', name: 'Beras Medium 5 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Karung 5kg', packPrice: 72000, portionsPerPack: 50, note: '100g beras per porsi matang' },
    { id: 'f-rice-red', name: 'Beras Merah Organik 2 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Pack 2kg', packPrice: 38000, portionsPerPack: 20 },
    { id: 'f-oat-1kg', name: 'Rolled Oats / Oatmeal 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Pack 1kg', packPrice: 36000, portionsPerPack: 20, note: '50g kering per mangkuk' },
    { id: 'f-sweet-potato', name: 'Ubi Jalar Cilembu / Madu 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg', packPrice: 12000, portionsPerPack: 5, note: '200g per porsi kukus' },
    { id: 'f-potato', name: 'Kentang Dieng 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg', packPrice: 18000, portionsPerPack: 5 },
    { id: 'f-cassava', name: 'Singkong Mentega 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg', packPrice: 8000, portionsPerPack: 5 },
    { id: 'f-corn', name: 'Jagung Manis Kupas 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg (3-4 bonggol)', packPrice: 11000, portionsPerPack: 4 },
    { id: 'f-bread-plain', name: 'Roti Tawar Kupas (12 lbr)', kind: 'food', category: 'raw-ingredient', packUnit: '1 Bungkus', packPrice: 16000, portionsPerPack: 6, note: '2 lembar per sarapan' },
    { id: 'f-bread-wheat', name: 'Roti Gandum Utuh (10 lbr)', kind: 'food', category: 'raw-ingredient', packUnit: '1 Bungkus', packPrice: 21000, portionsPerPack: 5 },
    { id: 'f-chicken-whole', name: 'Ayam 1 Ekor Utuh (~1.2kg)', kind: 'food', category: 'raw-ingredient', packUnit: '1 Ekor (potong 10)', packPrice: 38000, portionsPerPack: 10 },
    { id: 'f-chicken-breast', name: 'Dada Ayam Fillet 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg', packPrice: 48000, portionsPerPack: 10, note: '100g protein bersih/porsi' },
    { id: 'f-chicken-thigh', name: 'Paha Ayam Bawah 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg (8-9 ptg)', packPrice: 39000, portionsPerPack: 8 },
    { id: 'f-chicken-wing', name: 'Sayap Ayam 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg (10-12 ptg)', packPrice: 34000, portionsPerPack: 6 },
    { id: 'f-chicken-liver', name: 'Ati Ampela Ayam (5 pasang)', kind: 'food', category: 'raw-ingredient', packUnit: '1 Pack', packPrice: 15000, portionsPerPack: 5 },
    { id: 'f-egg-1kg', name: 'Telur Ayam Negeri 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg (~16 butir)', packPrice: 27000, portionsPerPack: 16 },
    { id: 'f-egg-omega', name: 'Telur Omega-3 (10 butir)', kind: 'food', category: 'raw-ingredient', packUnit: '1 Tray', packPrice: 26000, portionsPerPack: 10 },
    { id: 'f-quail-egg', name: 'Telur Puyuh Mentah 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500g (~45 butir)', packPrice: 19000, portionsPerPack: 9 },
    { id: 'f-catfish', name: 'Ikan Lele Segar 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg (7-8 ekor)', packPrice: 26000, portionsPerPack: 8 },
    { id: 'f-mackerel', name: 'Ikan Kembung Banjar 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg (8-10 ekor)', packPrice: 36000, portionsPerPack: 9 },
    { id: 'f-tuna', name: 'Ikan Tongkol Segar 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg (potong 8)', packPrice: 32000, portionsPerPack: 8 },
    { id: 'f-tilapia', name: 'Ikan Nila Merah 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg (3-4 ekor)', packPrice: 34000, portionsPerPack: 4 },
    { id: 'f-squid', name: 'Cumi Basah Segar 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500 Gram', packPrice: 35000, portionsPerPack: 5 },
    { id: 'f-shrimp', name: 'Udang Kupas / Segar 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500 Gram', packPrice: 42000, portionsPerPack: 5 },
    { id: 'f-beef-slice', name: 'Daging Sapi Shortplate 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500 Gram', packPrice: 58000, portionsPerPack: 5 },
    { id: 'f-tofu', name: 'Tahu Putih / Kuning (10 bh)', kind: 'food', category: 'raw-ingredient', packUnit: '1 Bungkus', packPrice: 8000, portionsPerPack: 5, note: '2 potong per porsi' },
    { id: 'f-tempeh', name: 'Tempe Papan Besar', kind: 'food', category: 'raw-ingredient', packUnit: '1 Papan', packPrice: 7000, portionsPerPack: 5 },
    { id: 'f-spinach', name: 'Bayam Hijau Segar', kind: 'food', category: 'raw-ingredient', packUnit: '1 Ikat Besar', packPrice: 4000, portionsPerPack: 2 },
    { id: 'f-kangkung', name: 'Kangkung Akar Segar', kind: 'food', category: 'raw-ingredient', packUnit: '1 Ikat Besar', packPrice: 4000, portionsPerPack: 2 },
    { id: 'f-jackfruit', name: 'Nangka Muda / Tewel Potong', kind: 'food', category: 'raw-ingredient', packUnit: '1 Pack 500g', packPrice: 8000, portionsPerPack: 4 },
    { id: 'f-carrot', name: 'Wortel Berastagi 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500 Gram', packPrice: 7000, portionsPerPack: 5 },
    { id: 'f-green-beans', name: 'Buncis Baby 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500 Gram', packPrice: 8000, portionsPerPack: 5 },
    { id: 'f-broccoli', name: 'Brokoli Hijau 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500 Gram', packPrice: 16000, portionsPerPack: 4 },
    { id: 'f-pakcoy', name: 'Pakcoy / Sawi Sendok 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500 Gram', packPrice: 7000, portionsPerPack: 4 },
    { id: 'f-cabbage', name: 'Kol Putih / Kubis 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500 Gram', packPrice: 6000, portionsPerPack: 5 },
    { id: 'f-tomato', name: 'Tomat Merah 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500 Gram', packPrice: 8000, portionsPerPack: 6 },
    { id: 'f-cucumber', name: 'Timun Lalap 500g', kind: 'food', category: 'raw-ingredient', packUnit: '500 Gram', packPrice: 6000, portionsPerPack: 5 },
    { id: 'f-banana', name: 'Pisang Sunpride / Cavendish 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Sisir (~1kg)', packPrice: 20000, portionsPerPack: 7 },
    { id: 'f-orange', name: 'Jeruk Medan / Santang 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg (~10 bh)', packPrice: 22000, portionsPerPack: 5 },
    { id: 'f-apple', name: 'Apel Fuji / Malang 1 Kg', kind: 'food', category: 'raw-ingredient', packUnit: '1 Kg (~6 bh)', packPrice: 28000, portionsPerPack: 6 },
    { id: 'f-papaya', name: 'Pepaya California 1 Buah', kind: 'food', category: 'raw-ingredient', packUnit: '1 Buah (~1.3kg)', packPrice: 14000, portionsPerPack: 6 },

    // ================= SEASONING & PANTRY (20 ITEMS) =================
    { id: 's-oil-1l', name: 'Minyak Goreng Pouch 1 Liter', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Pouch 1L', packPrice: 18500, portionsPerPack: 40, note: '1-2 sdm per masak' },
    { id: 's-shallot', name: 'Bawang Merah Brebes 500g', kind: 'food', category: 'seasoning-pantry', packUnit: '500 Gram', packPrice: 20000, portionsPerPack: 25 },
    { id: 's-garlic', name: 'Bawang Putih Kating 500g', kind: 'food', category: 'seasoning-pantry', packUnit: '500 Gram', packPrice: 21000, portionsPerPack: 30 },
    { id: 's-chili', name: 'Cabai Merah & Rawit Mix 250g', kind: 'food', category: 'seasoning-pantry', packUnit: '250 Gram', packPrice: 15000, portionsPerPack: 20 },
    { id: 's-broth', name: 'Kaldu Jamur / Ayam Bubuk 200g', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Pouch 200g', packPrice: 14000, portionsPerPack: 40 },
    { id: 's-salt-sugar', name: 'Garam & Gula Pasir 1 Kg', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Paket', packPrice: 22000, portionsPerPack: 50 },
    { id: 's-sweet-soy', name: 'Kecap Manis Pouch 520ml', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Pouch', packPrice: 19000, portionsPerPack: 35 },
    { id: 's-oyster-sauce', name: 'Saus Tiram Botol 270ml', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Botol', packPrice: 16000, portionsPerPack: 25 },
    { id: 's-chili-sauce', name: 'Saus Sambal / Tomat 335ml', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Botol', packPrice: 14000, portionsPerPack: 25 },
    { id: 's-coconut-milk', name: 'Santan Instan 65ml (5 pcs)', kind: 'food', category: 'seasoning-pantry', packUnit: '5 Bungkus', packPrice: 17500, portionsPerPack: 10 },
    { id: 's-marinade', name: 'Bumbu Racik Goreng/Sayur (5 bks)', kind: 'food', category: 'seasoning-pantry', packUnit: '5 Sachet', packPrice: 10000, portionsPerPack: 15 },
    { id: 's-flour', name: 'Tepung Bumbu Serbaguna 500g', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Pack', packPrice: 12000, portionsPerPack: 12 },
    { id: 's-margarine', name: 'Margarin Sachet 200g', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Pack 200g', packPrice: 8500, portionsPerPack: 15 },
    { id: 's-jam-kaya', name: 'Selai Srikaya Jar 250g', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Jar', packPrice: 16000, portionsPerPack: 12 },
    { id: 's-jam-choco', name: 'Selai Coklat / Hazelnut 250g', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Jar', packPrice: 22000, portionsPerPack: 12 },
    { id: 's-cheese-spread', name: 'Keju Oles / Cheddar 160g', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Box', packPrice: 15000, portionsPerPack: 10 },
    { id: 's-peanut-butter', name: 'Selai Kacang Creamy 250g', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Jar', packPrice: 24000, portionsPerPack: 12 },
    { id: 's-instant-noodle', name: 'Mie Instan Goreng/Kuah (5 bks)', kind: 'food', category: 'seasoning-pantry', packUnit: '5 Bungkus', packPrice: 15500, portionsPerPack: 5 },
    { id: 's-sardine', name: 'Sarden Kaleng 425g', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Kaleng Besar', packPrice: 24000, portionsPerPack: 4 },
    { id: 's-nugget', name: 'Chicken Nugget 500g', kind: 'food', category: 'seasoning-pantry', packUnit: '1 Pack 500g', packPrice: 36000, portionsPerPack: 8 },

    // ================= STREET FOOD & WARUNG (23 ITEMS) =================
    { id: 'w-nasi-uduk', name: 'Nasi Uduk Komplit Pagi', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 12000, portionsPerPack: 1 },
    { id: 'w-nasi-kuning', name: 'Nasi Kuning + Telur & Orek', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 13000, portionsPerPack: 1 },
    { id: 'w-bubur-ayam', name: 'Bubur Ayam Gerobak', kind: 'food', category: 'street-food', packUnit: '1 Mangkuk', packPrice: 12000, portionsPerPack: 1 },
    { id: 'w-lontong-sayur', name: 'Lontong Sayur Betawi/Padang', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 13000, portionsPerPack: 1 },
    { id: 'w-ketoprak', name: 'Ketoprak / Gado-Gado', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 15000, portionsPerPack: 1 },
    { id: 'w-warteg-hemat', name: 'Nasi Warteg (Telur + 2 Sayur)', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 14000, portionsPerPack: 1 },
    { id: 'w-warteg-ayam', name: 'Nasi Warteg (Ayam + Sayur)', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 18000, portionsPerPack: 1 },
    { id: 'w-padang-telur', name: 'Nasi Padang Bungkus (Telur)', kind: 'food', category: 'street-food', packUnit: '1 Bungkus', packPrice: 16000, portionsPerPack: 1 },
    { id: 'w-padang-ayam', name: 'Nasi Padang (Ayam Bakar/Gulai)', kind: 'food', category: 'street-food', packUnit: '1 Bungkus', packPrice: 23000, portionsPerPack: 1 },
    { id: 'w-padang-rendang', name: 'Nasi Padang Rendang', kind: 'food', category: 'street-food', packUnit: '1 Bungkus', packPrice: 26000, portionsPerPack: 1 },
    { id: 'w-mie-ayam', name: 'Mie Ayam Pangsit Gerobak', kind: 'food', category: 'street-food', packUnit: '1 Mangkuk', packPrice: 15000, portionsPerPack: 1 },
    { id: 'w-bakso', name: 'Bakso Sapi Urat / Halus', kind: 'food', category: 'street-food', packUnit: '1 Mangkuk', packPrice: 17000, portionsPerPack: 1 },
    { id: 'w-soto-ayam', name: 'Soto Ayam Lamongan + Nasi', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 16000, portionsPerPack: 1 },
    { id: 'w-pecel-lele', name: 'Pecel Lele + Nasi + Lalap', kind: 'food', category: 'street-food', packUnit: '1 Paket', packPrice: 18000, portionsPerPack: 1 },
    { id: 'w-ayam-geprek', name: 'Ayam Geprek + Nasi', kind: 'food', category: 'street-food', packUnit: '1 Paket', packPrice: 16000, portionsPerPack: 1 },
    { id: 'w-nasgor-tek', name: 'Nasi Goreng Tek-Tek Malam', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 16000, portionsPerPack: 1 },
    { id: 'w-kwetiau', name: 'Kwetiau / Mie Goreng Tek-Tek', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 17000, portionsPerPack: 1 },
    { id: 'w-sate-ayam', name: 'Sate Ayam Madura (10 tusuk)', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 22000, portionsPerPack: 1 },
    { id: 'w-cilok', name: 'Cilok Bumbu Kacang / Kuah', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 8000, portionsPerPack: 1 },
    { id: 'w-batagor', name: 'Batagor / Siomay Bandung', kind: 'food', category: 'street-food', packUnit: '1 Porsi', packPrice: 12000, portionsPerPack: 1 },
    { id: 'w-seblak', name: 'Seblak Komplit Level Pedas', kind: 'food', category: 'street-food', packUnit: '1 Mangkuk', packPrice: 15000, portionsPerPack: 1 },
    { id: 'w-gorengan', name: 'Paket Gorengan (4 pcs)', kind: 'food', category: 'street-food', packUnit: '1 Paket', packPrice: 6000, portionsPerPack: 1 },
    { id: 'w-martabak-manis', name: 'Martabak Manis / Terang Bulan', kind: 'food', category: 'street-food', packUnit: '1 Loyang (bagi 4)', packPrice: 32000, portionsPerPack: 4 },

    // ================= FANCY & MALL FOOD (12 ITEMS) =================
    { id: 'm-kfc-mcd', name: 'Paket Ayam Crispy KFC / McD', kind: 'food', category: 'fancy-mall', packUnit: '1 Paket', packPrice: 42000, portionsPerPack: 1 },
    { id: 'm-burger', name: 'Burger Meal + Kentang Goreng', kind: 'food', category: 'fancy-mall', packUnit: '1 Set', packPrice: 48000, portionsPerPack: 1 },
    { id: 'm-ricebowl', name: 'Chicken Katsu / Teriyaki Rice Bowl', kind: 'food', category: 'fancy-mall', packUnit: '1 Bowl', packPrice: 38000, portionsPerPack: 1 },
    { id: 'm-hokben', name: 'Paket Bento HokBen / Yoshinoya', kind: 'food', category: 'fancy-mall', packUnit: '1 Paket', packPrice: 52000, portionsPerPack: 1 },
    { id: 'm-ramen', name: 'Japanese Ramen Mall', kind: 'food', category: 'fancy-mall', packUnit: '1 Mangkuk', packPrice: 65000, portionsPerPack: 1 },
    { id: 'm-sushi', name: 'Sushi Platter / Roll Set', kind: 'food', category: 'fancy-mall', packUnit: '1 Set', packPrice: 68000, portionsPerPack: 1 },
    { id: 'm-pizza', name: 'Pizza Pan Regular (6 Slice)', kind: 'food', category: 'fancy-mall', packUnit: '1 Loyang (bagi 3)', packPrice: 96000, portionsPerPack: 3 },
    { id: 'm-pasta', name: 'Spaghetti Carbonara / Bolognese', kind: 'food', category: 'fancy-mall', packUnit: '1 Piring', packPrice: 55000, portionsPerPack: 1 },
    { id: 'm-steak', name: 'Chicken / Sirloin Steak Cafe', kind: 'food', category: 'fancy-mall', packUnit: '1 Porsi', packPrice: 78000, portionsPerPack: 1 },
    { id: 'm-dimsum', name: 'Dimsum Platter (4 Porsi)', kind: 'food', category: 'fancy-mall', packUnit: '1 Set', packPrice: 64000, portionsPerPack: 2 },
    { id: 'm-korean-bbq', name: 'Korean Chicken Wings / Bibimbap', kind: 'food', category: 'fancy-mall', packUnit: '1 Porsi', packPrice: 58000, portionsPerPack: 1 },
    { id: 'm-croissant', name: 'Artisan Croissant / Pastry Bakery', kind: 'food', category: 'fancy-mall', packUnit: '1 Pcs', packPrice: 32000, portionsPerPack: 1 },

    // ================= DRINKS: HOME BREW (14 ITEMS) =================
    { id: 'd-galon-refill', name: 'Air Galon Isi Ulang 19L', kind: 'drink', category: 'home-brew', packUnit: '1 Galon', packPrice: 7000, portionsPerPack: 60, note: 'Air minum harian' },
    { id: 'd-galon-brand', name: 'Air Galon Branded (Aqua/Le Minerale)', kind: 'drink', category: 'home-brew', packUnit: '1 Galon', packPrice: 21000, portionsPerPack: 60 },
    { id: 'd-tea-bag', name: 'Teh Celup 1 Box (isi 25)', kind: 'drink', category: 'home-brew', packUnit: '1 Box', packPrice: 8500, portionsPerPack: 25 },
    { id: 'd-tea-tubruk', name: 'Teh Tubruk Melati 2 Pack', kind: 'drink', category: 'home-brew', packUnit: '2 Pack', packPrice: 12000, portionsPerPack: 30 },
    { id: 'd-black-coffee', name: 'Kopi Hitam Bubuk 165g', kind: 'drink', category: 'home-brew', packUnit: '1 Pack', packPrice: 16000, portionsPerPack: 20 },
    { id: 'd-sachet-mix', name: 'Kopi Sachet 3-in-1 (1 Renceng)', kind: 'drink', category: 'home-brew', packUnit: '10 Sachet', packPrice: 16000, portionsPerPack: 10 },
    { id: 'd-cappuccino-sachet', name: 'Kopi Cappuccino Sachet (1 Renceng)', kind: 'drink', category: 'home-brew', packUnit: '10 Sachet', packPrice: 22000, portionsPerPack: 10 },
    { id: 'd-tehtarik-sachet', name: 'Teh Tarik Sachet (1 Renceng)', kind: 'drink', category: 'home-brew', packUnit: '10 Sachet', packPrice: 20000, portionsPerPack: 10 },
    { id: 'd-energen', name: 'Energen Sereal (1 Renceng)', kind: 'drink', category: 'home-brew', packUnit: '10 Sachet', packPrice: 22000, portionsPerPack: 10 },
    { id: 'd-milo', name: 'Milo / Susu Coklat Sachet (10 pcs)', kind: 'drink', category: 'home-brew', packUnit: '10 Sachet', packPrice: 24000, portionsPerPack: 10 },
    { id: 'd-uht-1l', name: 'Susu UHT Full Cream / Low Fat 1L', kind: 'drink', category: 'home-brew', packUnit: '1 Kotak 1L', packPrice: 21000, portionsPerPack: 5, note: '200ml per gelas' },
    { id: 'd-soy-milk', name: 'Susu Kedelai / Oat Milk 1L', kind: 'drink', category: 'home-brew', packUnit: '1 Kotak 1L', packPrice: 28000, portionsPerPack: 5 },
    { id: 'd-honey-lemon', name: 'Madu Murni Botol 250ml', kind: 'drink', category: 'home-brew', packUnit: '1 Botol', packPrice: 35000, portionsPerPack: 25 },
    { id: 'd-syrup', name: 'Sirup Cocopandan / Jeruk 460ml', kind: 'drink', category: 'home-brew', packUnit: '1 Botol', packPrice: 21000, portionsPerPack: 20 },

    // ================= DRINKS: STREET & WARUNG (8 ITEMS) =================
    { id: 'ds-es-teh', name: 'Es Teh Manis Warung', kind: 'drink', category: 'street-drink', packUnit: '1 Gelas', packPrice: 4000, portionsPerPack: 1 },
    { id: 'ds-es-jeruk', name: 'Es Jeruk Peras Murni', kind: 'drink', category: 'street-drink', packUnit: '1 Gelas', packPrice: 7000, portionsPerPack: 1 },
    { id: 'ds-jus-buah', name: 'Jus Alpukat / Mangga Gerobak', kind: 'drink', category: 'street-drink', packUnit: '1 Cup', packPrice: 12000, portionsPerPack: 1 },
    { id: 'ds-es-kelapa', name: 'Es Kelapa Muda Murni', kind: 'drink', category: 'street-drink', packUnit: '1 Bungkus', packPrice: 10000, portionsPerPack: 1 },
    { id: 'ds-stmj', name: 'STMJ / Wedang Jahe Hangat', kind: 'drink', category: 'street-drink', packUnit: '1 Gelas', packPrice: 12000, portionsPerPack: 1 },
    { id: 'ds-es-cendol', name: 'Es Cendol / Dawet Gula Aren', kind: 'drink', category: 'street-drink', packUnit: '1 Cup', packPrice: 8000, portionsPerPack: 1 },
    { id: 'ds-thaitea-street', name: 'Thai Tea / Green Tea Gerobak', kind: 'drink', category: 'street-drink', packUnit: '1 Cup', packPrice: 10000, portionsPerPack: 1 },
    { id: 'ds-mineral-botol', name: 'Air Mineral / Teh Botol Minimarket', kind: 'drink', category: 'street-drink', packUnit: '1 Botol', packPrice: 5000, portionsPerPack: 1 },

    // ================= DRINKS: CAFE & MALL (8 ITEMS) =================
    { id: 'dc-kopsu-aren', name: 'Es Kopi Susu Gula Aren', kind: 'drink', category: 'cafe-mall', packUnit: '1 Cup', packPrice: 22000, portionsPerPack: 1 },
    { id: 'dc-americano', name: 'Iced Americano / Long Black', kind: 'drink', category: 'cafe-mall', packUnit: '1 Cup', packPrice: 24000, portionsPerPack: 1 },
    { id: 'dc-latte', name: 'Cafe Latte / Cappuccino Cafe', kind: 'drink', category: 'cafe-mall', packUnit: '1 Cup', packPrice: 28000, portionsPerPack: 1 },
    { id: 'dc-matcha', name: 'Iced Matcha Latte', kind: 'drink', category: 'cafe-mall', packUnit: '1 Cup', packPrice: 30000, portionsPerPack: 1 },
    { id: 'dc-boba', name: 'Brown Sugar Boba Milk Tea', kind: 'drink', category: 'cafe-mall', packUnit: '1 Cup', packPrice: 28000, portionsPerPack: 1 },
    { id: 'dc-choco-cafe', name: 'Signature Iced Chocolate', kind: 'drink', category: 'cafe-mall', packUnit: '1 Cup', packPrice: 29000, portionsPerPack: 1 },
    { id: 'dc-smoothie', name: 'Berry / Mango Smoothie Mall', kind: 'drink', category: 'cafe-mall', packUnit: '1 Cup', packPrice: 35000, portionsPerPack: 1 },
    { id: 'dc-starbucks', name: 'Specialty Coffee Frappe Mall', kind: 'drink', category: 'cafe-mall', packUnit: '1 Cup', packPrice: 55000, portionsPerPack: 1 },
];

export interface WeeklyPatternPreset {
    readonly id: string;
    readonly name: string;
    readonly subtitle: string;
    readonly pattern: Record<number, Record<MealPeriod, readonly { readonly itemId: string; readonly portions: number }[]>>;
}

export const WEEKLY_PRESETS: readonly WeeklyPatternPreset[] = [
    {
        id: 'super-hemat',
        name: 'Preset Super Hemat',
        subtitle: 'Masak rumahan efisien (~Rp 480rb/bln)',
        pattern: {
            1: {
                breakfast: [{ itemId: 'f-oat-1kg', portions: 1 }, { itemId: 'f-egg-1kg', portions: 1 }, { itemId: 'd-tea-bag', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-chicken-whole', portions: 1 }, { itemId: 'f-spinach', portions: 1 }, { itemId: 's-garlic', portions: 1 }],
                dinner: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-tempeh', portions: 1 }, { itemId: 's-sweet-soy', portions: 1 }, { itemId: 'd-galon-refill', portions: 1 }],
            },
            2: {
                breakfast: [{ itemId: 'f-sweet-potato', portions: 1 }, { itemId: 'd-black-coffee', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-catfish', portions: 1 }, { itemId: 'f-kangkung', portions: 1 }, { itemId: 's-oil-1l', portions: 1 }],
                dinner: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-tofu', portions: 1 }, { itemId: 'f-carrot', portions: 1 }, { itemId: 's-broth', portions: 1 }],
            },
            3: {
                breakfast: [{ itemId: 'f-bread-plain', portions: 1 }, { itemId: 's-jam-kaya', portions: 1 }, { itemId: 'd-tea-bag', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-egg-1kg', portions: 1 }, { itemId: 'f-green-beans', portions: 1 }, { itemId: 's-shallot', portions: 1 }],
                dinner: [{ itemId: 'f-sweet-potato', portions: 1 }, { itemId: 'f-tempeh', portions: 1 }, { itemId: 'd-galon-refill', portions: 1 }],
            },
            4: {
                breakfast: [{ itemId: 'f-oat-1kg', portions: 1 }, { itemId: 'f-banana', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-chicken-whole', portions: 1 }, { itemId: 'f-jackfruit', portions: 1 }, { itemId: 's-garlic', portions: 1 }],
                dinner: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-egg-1kg', portions: 1 }, { itemId: 's-sweet-soy', portions: 1 }],
            },
            5: {
                breakfast: [{ itemId: 'f-bread-plain', portions: 1 }, { itemId: 's-cheese-spread', portions: 1 }, { itemId: 'd-uht-1l', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-mackerel', portions: 1 }, { itemId: 'f-spinach', portions: 1 }, { itemId: 's-marinade', portions: 1 }],
                dinner: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-tofu', portions: 1 }, { itemId: 'f-tempeh', portions: 1 }],
            },
            6: {
                breakfast: [{ itemId: 'f-sweet-potato', portions: 1 }, { itemId: 'f-egg-1kg', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-chicken-whole', portions: 1 }, { itemId: 'f-carrot', portions: 1 }, { itemId: 's-oyster-sauce', portions: 1 }],
                dinner: [{ itemId: 'w-nasi-uduk', portions: 1 }, { itemId: 'd-tea-bag', portions: 1 }],
            },
            7: {
                breakfast: [{ itemId: 'f-bread-plain', portions: 1 }, { itemId: 's-jam-choco', portions: 1 }, { itemId: 'd-uht-1l', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-catfish', portions: 1 }, { itemId: 'f-tempeh', portions: 1 }, { itemId: 's-oil-1l', portions: 1 }],
                dinner: [{ itemId: 'f-oat-1kg', portions: 1 }, { itemId: 'f-egg-1kg', portions: 1 }, { itemId: 'd-galon-refill', portions: 1 }],
            },
        },
    },
    {
        id: 'genz-mix',
        name: 'Preset Gen-Z Mix',
        subtitle: 'Meal-prep weekday + jajan weekend (~Rp 790rb/bln)',
        pattern: {
            1: {
                breakfast: [{ itemId: 'f-oat-1kg', portions: 1 }, { itemId: 'd-uht-1l', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-chicken-breast', portions: 1 }, { itemId: 'f-pakcoy', portions: 1 }, { itemId: 's-oyster-sauce', portions: 1 }],
                dinner: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-egg-1kg', portions: 1 }, { itemId: 'f-tempeh', portions: 1 }],
            },
            2: {
                breakfast: [{ itemId: 'f-bread-wheat', portions: 1 }, { itemId: 's-peanut-butter', portions: 1 }, { itemId: 'd-black-coffee', portions: 1 }],
                lunch: [{ itemId: 'w-warteg-ayam', portions: 1 }, { itemId: 'ds-es-teh', portions: 1 }],
                dinner: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-tofu', portions: 1 }, { itemId: 'f-carrot', portions: 1 }],
            },
            3: {
                breakfast: [{ itemId: 'd-energen', portions: 1 }, { itemId: 'f-banana', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-chicken-breast', portions: 1 }, { itemId: 'f-broccoli', portions: 1 }, { itemId: 's-garlic', portions: 1 }],
                dinner: [{ itemId: 'w-mie-ayam', portions: 1 }, { itemId: 'd-galon-brand', portions: 1 }],
            },
            4: {
                breakfast: [{ itemId: 'f-sweet-potato', portions: 1 }, { itemId: 'f-egg-1kg', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-squid', portions: 1 }, { itemId: 'f-green-beans', portions: 1 }, { itemId: 's-sweet-soy', portions: 1 }],
                dinner: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-tempeh', portions: 1 }, { itemId: 's-broth', portions: 1 }],
            },
            5: {
                breakfast: [{ itemId: 'f-bread-wheat', portions: 1 }, { itemId: 's-cheese-spread', portions: 1 }, { itemId: 'dc-kopsu-aren', portions: 1 }],
                lunch: [{ itemId: 'w-padang-ayam', portions: 1 }],
                dinner: [{ itemId: 'f-oat-1kg', portions: 1 }, { itemId: 'f-egg-1kg', portions: 1 }],
            },
            6: {
                breakfast: [{ itemId: 'w-bubur-ayam', portions: 1 }, { itemId: 'd-tea-bag', portions: 1 }],
                lunch: [{ itemId: 'm-ricebowl', portions: 1 }, { itemId: 'dc-matcha', portions: 1 }],
                dinner: [{ itemId: 'w-batagor', portions: 1 }, { itemId: 'd-galon-brand', portions: 1 }],
            },
            7: {
                breakfast: [{ itemId: 'f-bread-wheat', portions: 1 }, { itemId: 's-jam-choco', portions: 1 }, { itemId: 'd-uht-1l', portions: 1 }],
                lunch: [{ itemId: 'f-rice-5kg', portions: 1 }, { itemId: 'f-chicken-breast', portions: 1 }, { itemId: 'f-carrot', portions: 1 }],
                dinner: [{ itemId: 'w-nasgor-tek', portions: 1 }, { itemId: 'ds-es-jeruk', portions: 1 }],
            },
        },
    },
];