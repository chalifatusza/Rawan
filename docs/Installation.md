# Panduan Instalasi & Deployment (Installation Guide)

Dokumen ini menjelaskan langkah-langkah instalasi, konfigurasi lingkungan (*environment setup*), prosedur *build*, serta panduan penerapan (*deployment*) platform **RAWAN (Ruang Antisipasi Waspada Anak Nusantara)** ke berbagai platform hosting.

---

## 📋 1. Kebutuhan Sistem (System Prerequisites)

Sebelum memulai instalasi, pastikan perangkat komputer atau server Anda memenuhi spesifikasi berikut:

### Kebutuhan Perangkat Lunak:
- **Node.js**: Versi `18.0.0` atau yang lebih baru (disarankan menggunakan versi LTS `v20.x`).
- **Package Manager**: `npm` (versi 9.x atau terbaru) / `pnpm` / `yarn`.
- **Git**: Versi 2.x ke atas.
- **Web Browser**: Peramban modern dengan dukungan **WebGL 2.0** (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari 15+).

### Kebutuhan Perangkat Keras:
- **RAM**: Minimal 4 GB (disarankan 8 GB ke atas untuk rendering 3D mulus).
- **GPU**: Mendukung akselerasi grafis perangkat keras (*Hardware Acceleration*).

---

## 🛠️ 2. Langkah Instalasi Lokal (Local Setup)

### Langkah 1: Kloning Repositori
Buka terminal atau command prompt, lalu kloning repositori proyek:

```bash
git clone https://github.com/TegarAkhsan/Rawan.git
cd Rawan
```

### Langkah 2: Pemasangan Dependensi
Pasang semua paket pustaka yang dibutuhkan menggunakan npm:

```bash
npm install
```

> **Catatan:** Jika menggunakan `pnpm` atau `yarn`, Anda dapat menjalankan `pnpm install` atau `yarn install`.

### Langkah 3: Menjalankan Server Pengembangan (Dev Server)
Jalankan perintah berikut untuk mengaktifkan dev server lokal:

```bash
npm run dev
```

Output terminal akan menampilkan alamat lokal:
```text
  VITE v5.2.11  ready in 420 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Buka peramban dan navigasikan ke `http://localhost:5173`. Aplikasi akan langsung memuat tampilan Beranda dan simulasi bumi 3D interaktif.

---

## 📦 3. Perintah Skrip yang Tersedia (NPM Scripts)

Di dalam file `package.json`, tersedia beberapa perintah utama:

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Vite development server dengan Hot Module Replacement (HMR). |
| `npm run build` | Menjalankan validasi tipe TypeScript (`tsc`) dan meng-compile bundle produksi ke folder `dist/`. |
| `npm run preview` | Menjalankan server lokal untuk menguji (*preview*) hasil bundle folder `dist/` sebelum di-deploy. |

---

## 🚀 4. Panduan Deployment Produksi

### Opsi A: Deployment ke Vercel (Disarankan)

Vercel adalah platform ideal untuk aplikasi berbasis Vite dan React SPA.

#### Metode 1 Melalui Dashboard Vercel (Git Integration):
1. Masuk ke akun Anda di [vercel.com](https://vercel.com).
2. Klik tombol **"Add New..."** > pilih **"Project"**.
3. Hubungkan akun GitHub Anda dan pilih repositori `Rawan`.
4. Vercel akan otomatis mengenali konfigurasi:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Klik **"Deploy"**. Dalam beberapa detik website akan aktif secara publik.

#### Metode 2 Melalui Vercel CLI (Terminal):
1. Buka terminal di direktori proyek dan jalankan:
   ```bash
   npx vercel
   ```
2. Ikuti instruksi login dan pilih opsi default.
3. Untuk mempublikasikan versi produksi:
   ```bash
   npx vercel --prod
   ```

---

### Opsi B: Deployment ke Netlify

1. Masuk ke [netlify.com](https://netlify.com) dan klik **"Add new site"** > **"Import an existing project"**.
2. Pilih penyedia Git (GitHub) dan pilih repositori `Rawan`.
3. Masukkan konfigurasi build:
   - **Base directory**: *(kosongkan)*
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Pastikan file `public/_redirects` atau konfigurasi rewrite SPA tersedia agar routing URL tidak menghasilkan error 404:
   ```text
   /*    /index.html   200
   ```
5. Klik **"Deploy Site"**.

---

### Opsi C: Deployment ke Server Statis Sendiri (Nginx / Apache)

Jika Anda memiliki VPS atau server mandiri:

1. Jalankan kompilasi produksi di lokal atau server CI/CD:
   ```bash
   npm run build
   ```
2. Seluruh aset siap saji akan berada di dalam direktori `dist/`.
3. Salin isi folder `dist/` ke direktori web server (misalnya: `/var/www/html/rawan`).
4. Konfigurasikan file virtual host Nginx:
   ```nginx
   server {
       listen 80;
       server_name rawan.domainanda.com;
       root /var/www/html/rawan;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache control untuk aset statis 3D & media
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```
5. Muat ulang Nginx: `sudo systemctl reload nginx`.

---

## 🔍 5. Pemecahan Masalah Umum (Troubleshooting)

### 1. `WebGL: CONTEXT_LOST_WEBGL` pada Browser Lama
- **Penyebab**: Browser menonaktifkan akselerasi GPU atau kapasitas memori grafis habis.
- **Solusi**: Pastikan opsi *"Use hardware acceleration when available"* aktif di pengaturan browser (*Settings > System*).

### 2. Peringatan CSS `@tailwind` / `@apply` di VS Code
- **Penyebab**: CSS Linter bawaan VS Code belum mengenali direktif Tailwind CSS.
- **Solusi**: File `.vscode/settings.json` telah disediakan dengan konfigurasi `"css.lint.unknownAtRules": "ignore"`.

### 3. Port `5173` Sedang Digunakan
- Jika port default 5173 telah terpakai oleh aplikasi lain, Anda dapat menentukan port khusus:
  ```bash
  npm run dev -- --port 3000
  ```
