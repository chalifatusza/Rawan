# Dokumentasi Teknis Sistem (Technical Documentation)

Dokumen ini menyediakan spesifikasi teknis mendalam mengenai arsitektur internal, alur data (*data flow*), mesin simulasi 3D (*simulation engine*), sistem integrasi API BMKG, serta modul audio prosedural pada platform **RAWAN (Ruang Antisipasi Waspada Anak Nusantara)**.

---

## 🏛️ 1. Arsitektur State & Alur Navigasi (State Management & View Routing)

Platform RAWAN menggunakan state sentral di dalam [`src/App.tsx`](../src/App.tsx) untuk mengatur perutean tampilan (*view routing*) tanpa ketergantungan pada hash URL luar yang rentan reload.

### Diagram Alur Status Tampilan (`currentView`):

```
                        +------------------+
                        |      'HOME'      |  <-- Beranda (Earth 3D & Hero)
                        +--------+---------+
                                 |
         +-----------------------+-----------------------+
         |                       |                       |
+--------v---------+    +--------v---------+    +--------v---------+
|    'MODULES'     |    |      'MAP'       |    |   'CHECKLIST'    |
| (Katalog Modul)  |    | (Geoportal BMKG) |    | (Tas Siaga 72 Jam|
+--------+---------+    +------------------+    +------------------+
         |
+--------v---------+
|   'SIMULATION'   |  <-- 3D Interactive Simulation Arena
+--------+---------+
         |
+--------v---------+
|      'QUIZ'      |  <-- Evaluasi & Gamifikasi
+------------------+
```

### Definisi State Global:
- `currentView`: `'HOME' | 'MODULES' | 'SIMULATION' | 'MAP' | 'CHECKLIST' | 'QUIZ'`
- `activeDisaster`: `'EARTHQUAKE' | 'TSUNAMI' | 'VOLCANO' | 'FLOOD' | 'LANDSLIDE' | 'TORNADO'`
- `userXp`: Skor pengalaman akumulatif pemain yang tersimpan secara persisten di `localStorage (dv3d_user_xp)`.
- `soundEnabled`: Pengaturan status audio aktif/bisu yang tersimpan di `localStorage (dv3d_sound_enabled)`.
- `fontSize`, `highContrast`, `reducedMotion`, `voiceNarrationEnabled`: Pengaturan preferensi aksesibilitas.

---

## 🎮 2. Mesin Simulasi Bencana 3D & State Machine 7 Tahap

Setiap modul bencana 3D mengimplementasikan *State Machine* 7 tahap yang meniru dinamika eskalasi bencana sebenarnya:

### Tabel Fase Bencana Prosedural (7 Tahap):

| Indeks Tahap | Kategori Fase | Karakteristik Visual 3D & Fisika |
| :---: | :--- | :--- |
| **0** | `NORMAL` | Lingkungan pemukiman tenang, aktivitas seismik/vulkanik nol, pencahayaan stabil. |
| **1** | `UNREST / INFLOW` | Terdeteksi anomali awal (tremor gempa mikro, awan cumulonimbus, atau hujan deras). |
| **2** | `PRECURSOR / WARNING` | Tanda peringatan jelas (kubah lava tumbuh, air laut surut, retakan tanah lereng). |
| **3** | `IMMINENT ESCALATION` | Tekanan mencapai ambang batas kritis (corong pusaran turun, tanggul jebol). |
| **4** | `VIOLENT CLIMAX` | Letusan puncak plinian, touchdown tornado, hantaman gelombang tsunami M > 7.0. |
| **5** | `MITIGATION / ACTION` | Titik keputusan aksi penyelamatan diri (*Drop Cover Hold*, evakuasi bukit, dll.). |
| **6** | `AFTERMATH & RECOVERY` | Fase pemulihan, penanganan tim SAR BNPB, dan bahaya susulan (*aftershocks/lahar*). |

### Sistem Tampilan Potongan Lapisan Bumi (*Cutaway View*)
Komponen scene 3D (seperti [`VolcanoScene.tsx`](../src/scenes/VolcanoScene.tsx) dan [`EarthquakeScene.tsx`](../src/scenes/EarthquakeScene.tsx)) dilengkapi properti boolean `showCutaway`. Saat aktif, mesh permukaan tanah bagian depan dipotong untuk memperlihatkan:
- Kantong dapur magma (*magma chamber*) dan pipa intrusi vulkanik.
- Bidang gelincir sesar tektonik (*fault plane*) dan titik hiposentrum gempa.
- Lapisan jenuh air tanah (*groundwater saturation zone*) pada lereng bukit.

---

## 🛰️ 3. Geoportal & Integrasi Real-Time BMKG TEWS API

Komponen [`src/components/IndonesiaMapView.tsx`](../src/components/IndonesiaMapView.tsx) terhubung langsung dengan endpoint data terbuka BMKG:

### Endpoint yang Digunakan:
1. **Gempa Bumi Terkini (M ≥ 5.0 atau Berpotensi Tsunami)**:
   - URL: `https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json`
2. **Daftar 15 Gempa Bumi Terkini**:
   - URL: `https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json`

### Polling & Error Handling:
- Data di-fetch saat komponen di-mount, dan diperbarui otomatis setiap **60 detik** menggunakan interval timer.
- Jika API eksternal mengalami kendala jaringan atau pembatasan CORS, sistem secara otomatis beralih (*graceful fallback*) ke katalog seismik terintegrasi di [`src/data/mapData.ts`](../src/data/mapData.ts) tanpa menghentikan aplikasi.

---

## 🔊 4. Arsitektur Audio Prosedural (Web Audio Synthesizer)

Seluruh efek suara diimplementasikan di [`src/audio/soundEngine.ts`](../src/audio/soundEngine.ts) menggunakan Web Audio API murni tanpa file eksternal:

### Komponen Sintesis:
1. **White/Pink Noise Generator**:
   - Mengisi `AudioBuffer` dengan nilai acak `Math.random() * 2 - 1` untuk menghasilkan derau dasar.
2. **Filter Resonansi Multi-Tahap**:
   - `BiquadFilterNode` tipe `lowpass` (frekuensi 60Hz - 250Hz) untuk menghasilkan gemuruh getaran gempa bumi bawah tanah.
   - `BiquadFilterNode` tipe `bandpass` (frekuensi 800Hz - 2500Hz) untuk desau angin puting beliung.
3. **Amplifier & Envelope Shaping**:
   - `GainNode` dengan kurva `exponentialRampToValueAtTime` untuk menghasilkan serangan (*attack*), pelepasan (*decay*), dan pantulan ledakan letusan gunung api.
4. **Nada Feedback Interaksi**:
   - Gelombang sinus (*Sine Wave*) frekuensi 523.25 Hz (C5) dan 659.25 Hz (E5) untuk respon jawaban kuis yang tepat.

---

## ♿ 5. Sistem Aksesibilitas & Kompatibilitas Multi-Device

Platform RAWAN dirancang untuk inklusivitas sesuai standar **WCAG 2.1 AA**:

### 1. Skalabilitas Tipografi & Kontras
- Disediakan modifier font dinamis `.font-size-large` (110%) dan `.font-size-xlarge` (125%).
- Mode Kontras Tinggi (*High Contrast Mode*) menerapkan filter kontras 1.25x dan garis tepi hijau emerald `rgba(52, 211, 153, 0.5)` pada seluruh elemen UI interaktif.

### 2. Pengurangan Gerakan (*Reduced Motion*)
- Ketika opsi `reducedMotion` diaktifkan oleh pengguna, rotasi otomatis planet bumi, efek guncangan kamera gempa, dan animasi partikel dinonaktifkan untuk mencegah disorientasi visual pada pengguna vestibular.

### 3. Narator Audio Bahasa Indonesia (*Text-to-Speech*)
- Memanfaatkan antarmuka `window.speechSynthesis` dengan seleksi voice `id-ID` (Bahasa Indonesia) untuk membacakan ringkasan materi mitigasi secara otomatis.

### 4. Responsivitas Layar Penuh (*100dvh & Safe Area*)
- Kompatibel dengan unit viewport modern `100dvh` untuk mencegah pergeseran layout akibat kemunculan keyboard virtual atau address bar pada browser mobile Safari dan Chrome.
- Menggunakan CSS environment variables `env(safe-area-inset-*)` untuk melindungi konten dari potongan notch smartphone.
