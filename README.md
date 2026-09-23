# RAWAN — Ruang Antisipasi Waspada Anak Nusantara

[![React](https://img.shields.io/badge/React-18.3-blue.svg?logo=react&style=flat-square)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r165-black.svg?logo=three.js&style=flat-square)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF.svg?logo=vite&style=flat-square)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css&style=flat-square)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900.svg?logo=leaflet&style=flat-square)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

> **RAWAN (Ruang Antisipasi Waspada Anak Nusantara)** adalah platform pembelajaran interaktif kebencanaan alam berbasis 3D real-time yang dirancang khusus untuk meningkatkan literasi mitigasi, kesiapsiagaan darurat, dan pemahaman sains di kalangan pelajar serta generasi muda Indonesia.

---

## 🌟 Latar Belakang & Tujuan

Indonesia terletak di pertemuan tiga lempeng tektonik utama dunia (*Ring of Fire*) yang menjadikannya salah satu wilayah dengan aktivitas seismik dan vulkanik paling aktif di dunia. Sayangnya, edukasi kebencanaan konvensional sering kali hanya berupa poster statis atau materi teks panjang yang kurang mampu memvisualisasikan fenomena fisik di bawah tanah dan langkah tanggap darurat secara konkret.

**RAWAN** hadir untuk mengubah paradigma tersebut dengan menghadirkan:
1. **Visualisasi 3D Interaktif Real-Time**: Siswa dapat memutar, memperbesar, dan melihat potongan lapisan bumi (*cutaway view*) saat bencana terjadi.
2. **Simulasi Prosedural Multi-Tahap**: Mengikuti 7 fase perkembangan bencana nyata sesuai acuan PVMBG dan BNPB.
3. **Geoportal Seismik Indonesia**: Terintegrasi langsung dengan data gempa terkini dari sensor BMKG.
4. **Evaluasi & Gamifikasi**: Sistem skenario berbasis pilihan respon cepat, skor akurasi, dan perolehan XP.

---

## 🎯 Fitur Unggulan

### 1. 6 Modul Simulasi Bencana Alam 3D
- 🌋 **Gunung Api (*Volcano*)**: Simulasi fase kubah lava, erupsi freatik, kolom letusan plinian, awan panas (*wedhus gembel*), dan aliran lahar.
- 🌊 **Tsunami**: Gempa bawah laut, dislokasi lempeng, surutnya air laut pantai, hingga hantaman gelombang tsunami ke pemukiman.
- 🏚️ **Gempa Bumi (*Earthquake*)**: Pergerakan sesar lempeng, getaran seismik gedung sekolah bertingkat, dan prosedur *Drop, Cover, and Hold On*.
- 🌧️ **Banjir (*Flood*)**: Presipitasi ekstrem, luapan debit air sungai, kenaikan banjir bertahap, dan jalur evakuasi ke tempat tinggi.
- ⛰️ **Tanah Longsor (*Landslide*)**: Penjenuhan air tanah lereng perbukitan, keruntuhan bidang gelincir, debris avalanche, dan evakuasi lateral.
- 🌪️ **Puting Beliung (*Tornado*)**: Badai konvektif awan supercell, rotasi mesosiklon, pembentukan corong pusaran (*funnel cloud*), dan mitigasi ruang aman dalam rumah.

### 2. Geoportal & Peta Bencana Interaktif Indonesia
- Pemetaan titik bahaya seismik nasional berbasis Leaflet & Google Maps Tile.
- **Live Feed BMKG TEWS**: Terhubung langsung dengan data gempa bumi terkini BMKG yang diperbarui secara berkala.
- Visualisasi zona subduksi lempeng megathrust (Sunda Megathrust, Sesar Semangko, Sesar Lembang, Sesar Palu-Koro, Sesar Baribis).
- Katalog gunung api aktif tipe A Indonesia (Gunung Merapi, Sinabung, Semeru, Krakatau, dll.).

### 3. Tas Siaga Bencana (TSB) Digital
- Panduan komprehensif perlengkapan darurat 72 jam pertama sesuai standar BNPB.
- Pengelompokan kebutuhan pokok, pertolongan medis, komunikasi, penerangan, dan dokumen penting.

### 4. Ujian & Kuis Kesiapsiagaan Mandiri
- Desain *dashboard single-screen* yang nyaman dan cepat diakses.
- Dilengkapi penjelasan ilmiah di setiap opsi jawaban.
- Peta matriks soal, sistem streak kombo, dan kalkulasi XP pemain.

### 5. Aksesibilitas & Kompatibilitas Multi-Perangkat
- **Dukungan Layar**: Kompatibel untuk layar smartphone (iOS & Android), tablet, laptop, hingga monitor desktop.
- **Fitur Ramah Disabilitas**: Pilihan ukuran teks (Normal, Besar, Ekstra), mode kontras tinggi, pengurangan animasi gerak (*reduced motion*), dan narator audio berbahasa Indonesia (*Text-to-Speech*).
- **Procedural Sound Engine**: Efek suara sintetis procedur menggunakan Web Audio API tanpa membutuhkan file audio eksternal yang berat.

---

## 📂 Struktur Proyek

```plaintext
DisasterWeb/
├── public/
│   ├── logo_rawan.png          # Asset logo resmi RAWAN
│   └── textures/               # Texture map planet bumi (clouds, diffuse, normal)
├── src/
│   ├── audio/
│   │   └── soundEngine.ts      # Web Audio API Synthesizer (Gempa, Sirine, Lava, Ledakan)
│   ├── components/
│   │   ├── AccessibilityModal.tsx   # Modal kontrol aksesibilitas
│   │   ├── DisasterDetailModal.tsx  # Modal materi literasi & sains lengkap
│   │   ├── EmergencyChecklistView.tsx# Halaman panduan Tas Siaga Bencana BNPB
│   │   ├── Footer.tsx               # Komponen footer informasi
│   │   ├── IndonesiaMapView.tsx     # Geoportal peta bencana & integrasi BMKG
│   │   ├── Navbar.tsx               # Header navigasi responsif & touch-friendly
│   │   ├── QuizView.tsx             # Halaman evaluasi kuis gamified
│   │   └── SimulationOverlay.tsx    # HUD overlay & kontrol interaksi 3D
│   ├── data/
│   │   ├── checklistData.ts    # Data kurasi perlengkapan darurat
│   │   ├── disasterData.ts     # Data ilmiah sains & fase skenario bencana
│   │   ├── mapData.ts          # Koordinat patahan sesar & gunung api Indonesia
│   │   └── quizData.ts         # Bank soal skenario kesiapsiagaan
│   ├── scenes/
│   │   ├── EarthquakeScene.tsx # 3D Scene Simulasi Gempa Bumi
│   │   ├── FloodScene.tsx      # 3D Scene Simulasi Banjir
│   │   ├── HomeEarthScene.tsx  # 3D Scene Planet Bumi Beranda
│   │   ├── LandslideScene.tsx  # 3D Scene Simulasi Tanah Longsor
│   │   ├── TornadoScene.tsx    # 3D Scene Simulasi Puting Beliung
│   │   ├── TsunamiScene.tsx    # 3D Scene Simulasi Tsunami
│   │   └── VolcanoScene.tsx    # 3D Scene Simulasi Erupsi Gunung Api
│   ├── types/
│   │   └── disaster.ts         # TypeScript Interfaces & Model Types
│   ├── App.tsx                 # Root Router & State Controller
│   ├── index.css               # Design System, Tokens, & Safe-Area Insets
│   └── main.tsx                # React DOM Mount Entrypoint
├── docs/
│   ├── Installation.md         # Panduan Instalasi & Deployment
│   ├── Technology.md           # Rincian Teknologi & Arsitektur
│   └── TechnicalDocumentation.md # Dokumentasi Teknis Sistem 3D & State
├── index.html                  # HTML Shell & Meta Viewport
├── package.json                # Dependencies & Scripts
├── tailwind.config.js          # Tailwind Utility Presets
├── tsconfig.json               # TypeScript Compiler Configuration
├── vercel.json                 # Vercel Deployment & SPA Rewrites Config
└── vite.config.ts              # Vite Bundler Settings
```

---

## 🚀 Memulai Cepat (Quickstart)

Pastikan di komputer Anda telah terpasang **Node.js (versi 18.0 atau yang lebih baru)** dan **npm**.

```bash
# 1. Clone repositori ini
git clone https://github.com/TegarAkhsan/Rawan.git

# 2. Masuk ke direktori proyek
cd Rawan

# 3. Pasang seluruh dependensi
npm install

# 4. Jalankan server pengembangan lokal
npm run dev
```

Buka peramban Anda di `http://localhost:5173` untuk melihat website secara langsung.

Untuk panduan instalasi mendalam, konfigurasi build produksi, serta panduan deployment ke server/Vercel, silakan baca [docs/Installation.md](docs/Installation.md).

---

## 📖 Dokumentasi Lengkap

- 🛠️ [**Panduan Instalasi & Deployment**](docs/Installation.md)
- 💻 [**Informasi & Arsitektur Teknologi**](docs/Technology.md)
- 📐 [**Dokumentasi Teknis & Spesifikasi Sistem**](docs/TechnicalDocumentation.md)

---

## 📜 Lisensi & Kontribusi

Proyek ini dikembangkan di bawah lisensi **MIT License**. Kontribusi, laporan bug (*issue*), serta ide fitur baru sangat terbuka untuk mendukung kemajuan literasi kebencanaan anak dan generasi muda Indonesia.
