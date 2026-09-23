# Informasi Teknologi & Arsitektur (Technology Information)

Dokumen ini menyajikan rincian menyeluruh mengenai tumpukan teknologi (*technology stack*), pustaka pendukung, arsitektur perangkat lunak, serta strategi optimasi performa yang diterapkan dalam platform **RAWAN (Ruang Antisipasi Waspada Anak Nusantara)**.

---

## 🏗️ 1. Ikhtisar Tumpukan Teknologi (Technology Stack Overview)

Platform RAWAN dibangun dengan arsitektur modern berbasis Single Page Application (SPA) yang menggabungkan grafis 3D real-time, sistem informasi geografis (GIS), dan audio prosedural sintetis.

```
+-------------------------------------------------------------------------+
|                              USER INTERFACE                             |
|       (React 18.3 + TypeScript + Tailwind CSS + Lucide Icons)           |
+--------------------+--------------------+-------------------------------+
|      3D GRAPHICS   |     GEOPORTAL      |          AUDIO ENGINE         |
|  Three.js (r165)   |   Leaflet 1.9.4    |         Web Audio API         |
| React Three Fiber  |   React Leaflet    | (Synthesizer & Procedural FX) |
|  React Three Drei  | BMKG TEWS Live API |   Web Speech Synthesis TTS    |
+--------------------+--------------------+-------------------------------+
|                        BUILD & RUNTIME TOOLING                          |
|              Vite 5.2 (ESBuild + Rollup) + PostCSS                      |
+-------------------------------------------------------------------------+
```

---

## 🛠️ 2. Rincian Pustaka & Framework Utama

### A. Core Frontend Framework
- **React 18.3.1**: Library inti untuk manajemen UI deklaratif, pemanfaatan concurrent features, dan pemisahan logika dalam komponen modular yang dapat digunakan kembali (*reusable components*).
- **TypeScript 5.4.5**: Menjamin *type safety* yang ketat, meminimalkan potensi runtime error, dan mempermudah pemeliharaan skenario kebencanaan multi-tahap.
- **Vite 5.2.11**: Build tool dan dev server generasi baru berbasis ES modules yang menawarkan kecepatan *Hot Module Replacement (HMR)* instan dan hasil kompilasi produksi yang teroptimasi.

### B. Rendering Grafis 3D Real-Time
- **Three.js (v0.165.0)**: Mesin rendering WebGL tingkat rendah untuk memproses mesh, geometri, material, pencahayaan, bayangan (*shadows*), partikel, dan animasi fisik kamera.
- **@react-three/fiber (v8.16.8)**: React renderer deklaratif untuk Three.js yang memungkinkan pembuatan scene 3D menggunakan komponen React dengan manajemen siklus hidup objek yang efisien.
- **@react-three/drei (v9.106.0)**: Koleksi helper dan abstraksi tingkat tinggi untuk R3F, termasuk `OrbitControls`, `Stars`, shader materials, dan helper pencahayaan lingkungan.

### C. Pemetaan & Geoportal Geospasial
- **Leaflet (v1.9.4)**: Library pemetaan interaktif open-source yang ringan dan responsif.
- **React-Leaflet (v4.2.1)**: Komponen React binding untuk Leaflet yang mengontrol marker gempa bumi, garis patahan sesar aktif, serta zona subduksi megathrust.
- **BMKG Open Data API**: Terintegrasi langsung dengan sumber data resmi BMKG (*Badan Meteorologi, Klimatologi, dan Geofisika*) untuk pembaruan data gempa bumi real-time di seluruh kepulauan Indonesia.

### D. Audio Prosedural & Sintesis Suara
- **Web Audio API**: Seluruh efek suara atmosferik (gemuruh gempa, suara ombak tsunami, ledakan letusan gunung api, angin tornado, serta feedback klik tombol) disintesis secara dinamis menggunakan *OscillatorNode*, *BiquadFilterNode*, dan *AudioBufferSourceNode* tanpa membebani bandwidth jaringan dengan file `.mp3` besar.
- **Web Speech API (SpeechSynthesis)**: Menyediakan narasi suara berbahasa Indonesia secara otomatis untuk materi modul kebencanaan sebagai fitur aksesibilitas bagi siswa tunanetra atau pembelajar auditori.

### E. Desain & Styling
- **Tailwind CSS 3.4.3**: Framework utility-first CSS untuk membangun antarmuka gelap (*dark mode*) bertema solid emerald/slate dengan sistem token warna yang konsisten, transisi halus, dan dukungan *safe-area insets*.
- **Lucide React (v0.383.0)**: Paket ikon vektor modern yang bersih, tajam, dan fleksibel.
- **Canvas-Confetti (v1.9.3)**: Efek animasi selebrasi partikel konfeti saat siswa menyelesaikan ujian kuis kebencanaan dengan skor tinggi.

---

## ⚡ 3. Strategi Optimasi Performa (Performance Engineering)

Rendering grafis 3D di peramban web memerlukan penanganan efisiensi memori yang disiplin. Platform RAWAN menerapkan sejumlah teknik optimasi:

### 1. Procedural Geometry & Low-Poly Optimization
Model 3D dibangun secara prosedural (*code-generated meshes*) dengan jumlah poligon terkontrol. Ini memastikan waktu muat (*load time*) awal instan tanpa perlu mengunduh file model 3D besar seperti `.gltf` atau `.obj` berukuran puluhan megabyte.

### 2. Selective Texture Resolution & Anisotropy
Peta tekstur planet bumi dioptimalkan dalam format JPEG terkompresi dengan pengaktifan `anisotropy: 16` dan `sRGBColorSpace` hanya pada material yang membutuhkan ketajaman visual fotorealistik.

### 3. Cleanup & Memory Leak Prevention
Semua generator suara Web Audio API dan interval polling data live BMKG mengimplementasikan fungsi pembersihan (*cleanup return function*) pada React `useEffect` untuk mencegah kebocoran memori saat berganti halaman.

### 4. Dynamic Delta-Time Animation Loop
Animasi rotasi bumi, pusaran awan tornado, getaran gempa, dan dinamika partikel awan panas menggunakan pengali waktu `delta` dari Three.js `useFrame`. Hal ini menjamin kecepatan animasi tetap konsisten pada layar 60Hz, 90Hz, maupun 120Hz/144Hz.

---

## 📊 4. Matriks Kompatibilitas Peramban (Browser Support)

| Browser | Versi Minimum | Status Dukungan |
| :--- | :--- | :--- |
| **Google Chrome** | v90+ | Full Support (WebGL 2.0, Web Audio, SpeechSynthesis) |
| **Mozilla Firefox** | v88+ | Full Support (WebGL 2.0, Web Audio, SpeechSynthesis) |
| **Microsoft Edge** | v90+ | Full Support (WebGL 2.0, Web Audio, SpeechSynthesis) |
| **Apple Safari** | v15+ (macOS & iOS) | Full Support (Touch Gesture, WebGL 2.0, Safe Area Insets) |
| **Android Chrome / Samsung Internet** | v90+ | Full Support (Touch OrbitControls, Responsive 100dvh) |
