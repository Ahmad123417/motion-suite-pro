# Motion Suite Pro

> **Official Production Release v1.0.4** — Prompt-to-Code Motion Graphics Suite

[![Version](https://img.shields.io/badge/version-1.0.4-blue.svg)](https://github.com/Ahmad123417/motion-studio-release)
[![License](https://img.shields.io/badge/license-Flexible%20Tiered%20%7C%20Lifetime-emerald.svg)](https://lynk.id)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011%20(64--bit)-lightgrey.svg)](#kebutuhan-spesifikasi-sistem)
[![Engine](https://img.shields.io/badge/engine-Remotion%20%2B%20React%2019-violet.svg)](https://remotion.dev)

---

## 💡 Posisi Produk: Bukan Video AI Generatif Biasa

**Motion Suite Pro** bukanlah generator video berbasis model difusi visual (*generative AI video*) yang sering mengalami halusinasi, teks buram/rusak, distorsi fisik, dan tidak bisa diedit ulang.

Sebaliknya, **Motion Suite Pro adalah Prompt-to-Code Motion Graphics Workstation** yang memadukan kekuatan **Remotion (React 19 + TypeScript)** dengan kecerdasan **Google Gemini AI**:

* **Presisi Piksel & Teks Tajam**: Seluruh teks judul, label, dan elemen grafis dirender secara vektor/SVG dan kode CSS murni—bebas artefak kompresi atau teks palsu.
* **Animasi Matematis Murni**: Pergerakan didasarkan pada fungsi interpolasi matematis (`spring`, `interpolate`, `Easing`), menghasilkan kelancaran absolut pada 30 hingga 60 FPS.
* **Dapat Dimodifikasi Bebas (Parametrik)**: Warna, tipografi, posisi, skala, dan kecepatan dapat diubah kapan saja melalui *Visual Tweaker Drawer* tanpa perlu melakukan *re-prompt* dari nol.
* **Transparansi Asli (True Alpha Channel)**: Menghasilkan video berlatar transparan murni untuk compositing di software pengeditan profesional atau penjualan di pasar microstock.

---

## 🚀 Fitur Utama

### 1. Render Resolusi 4K Ultra HD & 60 FPS
* Mendukung rendering fisik resolusi tinggi dari **Full HD 1080p**, **2K Quad HD**, hingga **4K Ultra HD (3840 &times; 2160)**.
* Pilihan frame rate **30 FPS** (standar video digital) dan **60 FPS** (gerakan animasi ultra-halus untuk grafis kinetik siaran).
* Pilihan multi-rasio: **16:9 (Landscape/Widescreen)**, **9:16 (Vertical Reels/Shorts/TikTok)**, dan **1:1 (Square Feed)**.

### 2. Format Ekspor: Apple ProRes 4444 (Alpha Transparan) & MP4
* **Apple ProRes 4444 (.MOV)**: Standar emas industri penyiaran dengan format piksel `yuva444p10le` dan rendering frame PNG murni. Menyediakan **10-bit True Alpha Channel** (transparansi tembus pandang tanpa latar hitam) untuk compositing di *Adobe Premiere Pro*, *After Effects*, *DaVinci Resolve*, *Final Cut Pro*, serta siap jual di pasar microstock premium (*Envato*, *Motion Array*, *Pond5*, *Shutterstock*).
* **MPEG-4 H.264 (.MP4)**: Format universal yang ringkas, cepat, dan kompatibel langsung dengan pemutar media, YouTube, media sosial, dan web.

### 3. Integrasi Mandiri Google Gemini API (BYOK - 100% Gratis)
* Menerapkan prinsip **BYOK (Bring Your Own Key)**: Pengguna menggunakan API Key resmi gratis dari [Google AI Studio](https://aistudio.google.com).
* **Tanpa Biaya Langganan Bulanan Engine**: Kuota *Free-Tier* Google (hingga 15 RPM dan 1.500 permintaan harian) sangat leluasa untuk ratusan generasi animasi setiap hari.
* AI bertindak sebagai *Creative Coding Architect* yang merancang kode TypeScript dan auto-healing.

### 4. Flexible Tiered Licensing System
* **Mendukung aktivasi lisensi berbasis durasi dinamis (harian, mingguan, bulanan) hingga akses penuh seumur hidup (lifetime).**
* Otentikasi kriptografi RSA-2048 yang terikat aman dengan *Machine ID* perangkat.
* Indikator status di aplikasi secara otomatis menampilkan durasi aktif dan masa kedaluwarsa lisensi secara dinamis dan *real-time*.

### 5. Collapsible Visual Tweaker Drawer
* Panel *slide-in* samping kanan (tema Dark Cyber Pro) tanpa memotong ruang kanvas preview (100% full viewport).
* Pengaturan instan: **Teks** (Judul, Subjudul, Badge), **Warna & Latar** (Warna aksen utama, sekunder, mode solid vs alpha), **Transformasi** (Posisi X/Y, Skala 50%–200%, Tombol Reset), dan **Efek FX** (Neon Glow, Speed Multiplier 0.5x–2.0x).
* Dilengkapi *Live Hot-Sync* yang mencerminkan pergeseran kontrol ke kanvas preview secara seketika.

### 6. Sistem Undo Berurutan & Revert to Initial State
* Riwayat *Undo Stack* pintar berkapasitas 20 langkah terakhir.
* Tombol **"Kembalikan ke Asli" (Revert)** untuk mereset seluruh parameter kembali ke wujud asli template dengan satu klik.

### 7. AI Self-Healing & Auto-Fix Error
* Fitur auto-koreksi pintar seketika: Jika terjadi galat sintaks TypeScript saat manipulasi kode manual, cukup klik tombol **`⚡ Auto-Fix Error`** untuk perbaikan kode otomatis oleh AI dalam hitungan detik.

### 8. In-App Auto-Update System
* Sistem pembaruan pop-up modern bergaya OBS Studio.
* Menampilkan catatan rilis versi baru, progress unduhan di latar belakang, dan tombol instalasi instan.

---

## 📝 Catatan Rilis: Changelog v1.0.4

Pembaruan **v1.0.4** berfokus pada stabilitas engine render fisik, keandalan kanvas preview, dan penyempurnaan kontrol ekspor video:

### ⚙️ 1. Optimalisasi Remotion Engine di Latar Belakang
* **Background Worker & Compilation Pipeline**: Mengoptimalkan inisialisasi compiler TypeScript lokal dan proses *bundling* Remotion di latar belakang, mengurangi penggunaan CPU saat *idle*.
* **Manajemen Alokasi Memori**: Pengurangan *memory footprint* saat melakukan rendering animasi beresolusi 4K dengan durasi panjang.
* **Render Pipeline Berjenjang**: Sinkronisasi proses render media fisik dengan pelaporan progress akurat (alokasi progress 25% – 100%) langsung ke *status bar* aplikasi.

### 🖥️ 2. Perbaikan Stabilitas Canvas Preview
* **Resiliensi Koneksi Port Lokal**: Memperbaiki isu transien saat engine pertama kali dimuat (*Port 10871 Offline / Initializing*) dengan *auto-reconnect* pintar dan penambahan kontrol manual **Sync Canvas**.
* **Zero-Lag State Synchronization**: Perbaikan sinkronisasi data parameter visual antara Visual Tweaker Drawer dan Remotion Player tanpa kedipan (*flicker-free hot reload*).
* **Frame 0 Safe Guarantee**: Menjamin komposisi selalu terlihat jelas pada Frame 0 tanpa efek layar hitam sesaat (*blank initial frame*).

### 🎬 3. Penyesuaian Kontrol Ekspor Video
* **Lockdown Apple ProRes 4444 Alpha**: Konfigurasi ketat flag rendering Remotion dengan format piksel `yuva444p10le` dan format gambar frame `png` murni—mencegah galat degradasi warna atau transparansi hitam yang sebelumnya dipicu oleh format JPEG default.
* **Penyesuaian Preset Resolusi & Rasio**: Antarmuka kontrol ekspor kini menyajikan pemilih rasio aspek (16:9, 9:16, 1:1) dan preset resolusi (1080p, 2K, 4K) yang lebih intuitif dan presisi.
* **Auto-Updater Integration**: Penambahan modal dialog pembaruan interaktif dengan pemantauan unduhan *real-time*.

---

## 💻 Kebutuhan Spesifikasi Sistem

| Komponen | Spesifikasi Minimum | Spesifikasi Rekomendasi (4K Rendering) |
| :--- | :--- | :--- |
| **Sistem Operasi** | Windows 10 64-bit (Build 1909+) | Windows 11 64-bit (Update Terbaru) |
| **Processor (CPU)** | 4 Core / 8 Thread (Intel i5 Gen 8 / AMD Ryzen 3) | 6 Core / 12 Thread+ (Intel i7 Gen 10+ / Ryzen 5 5000+) |
| **Memori (RAM)** | 8 GB DDR4 | 16 GB – 32 GB DDR4/DDR5 |
| **Kartu Grafis (GPU)** | Intel UHD 620 / AMD Vega (OpenGL 4.5) | NVIDIA GeForce GTX 1650 / RTX 3060 / 4000 series |
| **Penyimpanan** | 5 GB ruang kosong (SSD disarankan) | 20 GB+ ruang kosong (NVMe SSD M.2) |
| **Layar** | Resolusi 1280 &times; 720 (Scaling 125%/150%) | Resolusi 1920 &times; 1080 (Full HD) atau 2K/4K |

---

## 🏁 Panduan Singkat Memulai (Quick Start)

1. **Jalankan Installer**: Pasang `Motion-Suite-Pro.Setup.1.0.4.exe` pada sistem Windows Anda.
2. **Aktivasi Lisensi**: Buka aplikasi, cari panel **Status Lisensi** di pojok kiri atas, masukkan Kunci Lisensi resmi dari nota pembelian Lynk.id, lalu klik **Validasi** hingga status menjadi **"Aktif"** sesuai paket lisensi Anda (Hijau).
3. **Masukkan Gemini API Key**: Ambil API Key gratis di [Google AI Studio](https://aistudio.google.com), masukkan ke panel **Gemini API Key** di sidebar kiri, lalu klik **Simpan**.
4. **Rancang Animasi**: Masukkan prompt konsep Anda, sesuaikan teks/warna/posisi di **Visual Tweaker Drawer**, dan tonton preview seketika.
5. **Ekspor Video**: Pilih format **Apple ProRes 4444 (.MOV)** untuk Alpha transparan murni atau **MP4** untuk video solid, atur resolusi hingga **4K**, lalu klik **🚀 Ekspor / Render Video**.

> 📖 **Panduan Cetak Lengkap**: Lihat berkas [user-guide.html](file:///user-guide.html) (atau cetak ke format PDF A4) dan [PETUNJUK_AKTIVASI.txt](file:///PETUNJUK_AKTIVASI.txt) untuk panduan instalasi visual langkah demi langkah.

---

## 🛠️ Pengembangan & Build (Developer Guide)

Bagi pengembang atau tim teknis yang membangun aplikasi dari sumber:

```bash
# Masuk ke direktori aplikasi desktop
cd remotion-motion-desktop

# Jalankan pemeriksaan tipe TypeScript
npm run typecheck

# Jalankan lingkungan pengembangan lokal
npm run dev

# Bangun berkas bundle aplikasi
npm run build

# Bangun installer Windows NSIS (.exe)
npm run build:win
```

---

## 📄 Lisensi & Dukungan Resmi

* **Produk**: Motion Suite Pro (v1.0.4 Production Release)
* **Distribusi & Lisensi**: Official Lynk.id Store & GitHub Release
* **Hak Cipta**: &copy; 2026 Motion Suite Pro Team. Seluruh hak cipta dilindungi undang-undang.
