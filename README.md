# Motion Suite Pro

> **Official Production Release v1.0.5** — Prompt-to-Code Motion Graphics Suite

[![Version](https://img.shields.io/badge/version-1.0.5-blue.svg)](https://github.com/Ahmad123417/motion-studio-release)
[![License](https://img.shields.io/badge/license-Flexible%20Tiered%20%7C%20Lifetime-emerald.svg)](https://lynk.id)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011%20(64--bit)-lightgrey.svg)](#kebutuhan-spesifikasi-sistem)
[![Engine](https://img.shields.io/badge/engine-Motion%20Suite%20Core%20Engine-violet.svg)](#)

---

## 💡 Posisi Produk: Bukan Video AI Generatif Biasa

**Motion Suite Pro** bukanlah generator video berbasis model difusi visual (*generative AI video*) yang sering mengalami halusinasi, teks buram/rusak, distorsi fisik, dan tidak bisa diedit ulang.

Sebaliknya, **Motion Suite Pro adalah Prompt-to-Code Motion Graphics Workstation** yang memadukan kekuatan **Dynamic Code-to-Video Engine (React 19 + TypeScript)** dengan kecerdasan **Google Gemini AI**:

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
* **Transparansi Asli (True Alpha Channel)**: Menghasilkan video berlatar transparan murni (*Apple ProRes 4444*) tanpa latar hitam, siap pakai untuk video overlay di Premiere Pro, After Effects, CapCut, DaVinci Resolve, dan Final Cut Pro.

---

## 🌟 Fitur Utama & Keunggulan

### 1. 🎛️ 4-Category Visual Tweaker Live Hot-Sync
* **Kontrol Parametrik Instan**: Mengubah teks (`titleText`, `subtitleText`, `badgeText`), warna (`accentColor`, `secondaryColor`, `backgroundColor`), posisi (`offsetX`, `offsetY`), skala (`scale`), intensitas glow (`glowIntensity`), dan ritme animasi (`speedMultiplier`) secara langsung.
* **Undo History & Revert to Initial**: Riwayat perubahan berurutan hingga 20 langkah dan tombol sekali klik untuk mengembalikan ke nilai awal template.
* **Terintegrasi Penuh ke Render**: Nilai kontrol langsung disinkronkan ke kanvas preview dan file `render_props.json` untuk ekspor fisik.

### 2. ⚡ Universal Dynamic Timeline & Anti-Freeze Engine
* **Pilihan Durasi Fleksibel**: 5 Detik, 10 Detik, 15 Detik, dan 20 Detik (600 frames @ 30 FPS / 1200 frames @ 60 FPS).
* **Perhitungan Timeline Dinamis**: AI menggunakan persentase durasi (`durationInFrames`), menghilangkan pembekuan visual di detik akhir.
* **Continuous Micro-Motions**: Osilasi mengambang (*floating*), *breathing glow*, *camera zoom drift*, dan denyut data terus aktif sepanjang durasi.

### 3. 🛡️ Automated Error Capture & Self-Healing Pipeline
* **Zero Manual Copy-Paste**: Error runtime engine ditangkap langsung oleh IPC backend.
* **Tombol Auto-Fix Interaktif**: Memperbaiki galat kompilasi secara cerdas dengan satu kali klik.

### 4. 🤖 Prompt-to-Motion AI Generator & Refinement Assistant
* Terhubung langsung dengan Google Gemini Flash/Pro dengan integrasi BYOK (*Bring Your Own Key*) 100% gratis.
* Chat revisi cerdas untuk memperbarui motion graphic tanpa menghancurkan tata letak yang sudah bagus.

### 5. 🎬 Pipeline Ekspor Fisik Resolusi 4K & True Alpha Channel
* **MP4 (H.264)** untuk media sosial dan web.
* **Apple ProRes 4444 (.MOV)** dengan format piksel `yuva444p10le` untuk transparansi 10-bit berkualitas studio.

### 6. 🔐 Tiered Machine-Locked Licensing & Anti-Clock Rollback Guard
* **Kriptografi RSA-SHA256**: Mengikat lisensi ke perangkat keras fisik (*Hardware Machine ID*) dengan perlindungan tanda tangan digital asimetris 2048-bit.
* **Anti-Clock Rollback Protection**: Mencegah eksploitasi pemunduran tanggal/jam sistem lokal melalui penyimpanan stempel waktu terenkripsi AES-256-CBC (`clock_sync.dat`) di direktori `userData`.
* **Auto-Lockout & Pemulihan Internet 1-Klik**: Sistem secara otomatis mengunci fitur render dan generator jika jam lokal dimundurkan melebihi 3 menit, dan menyediakan pemulihan instan satu kali klik via HTTP HEAD ke server waktu publik (Google / Cloudflare).
* **Multi-Tier Duration Support**: Mendukung masa aktif berdurasi dinamis (1 Hari Trial, 3 Hari, 7 Hari Mingguan, 30 Hari Bulanan, dan Lifetime Access permanen).

---

## 📝 Catatan Rilis: Changelog v1.0.5

Pembaruan **v1.0.5** menghadirkan fungsionalitas penuh Visual Tweaker, durasi baru 20 detik, pipeline self-healing, dan proteksi lisensi mutakhir:

### 🎛️ 1. Fungsionalisasi Penuh Panel Visual Tweaker 4-Kategori
* Standarisasi kontrak props `VibeGraphicProps` (Teks, Warna, Transform, Efek) di semua template prompt AI.
* Integrasi dua arah slider Visual Tweaker ke visual canvas internal (hot-sync 120ms) dan pipeline ekspor fisik.
* Parser cerdas `parseTsxDefaultProps` untuk mendeteksi nilai default prop dari kode TSX secara otomatis.

### ⏱️ 2. Universal Dynamic Timeline & Anti-Freeze Engine
* Penambahan opsi durasi **20 Detik (600f @ 30fps / 1200f @ 60fps)** pada panel kontrol dan Live Player Motion Suite Core Engine.
* Aturan AI ketat: Melarang frame statis hardcoded, wajib menggunakan persentase dinamis dari `durationInFrames`.
* Micro-motion kontinu dari frame 0 hingga akhir untuk menjaga animasi tetap hidup (*never-freeze*).

### ⚡ 3. Automated Error Capture & Self-Healing
* Penangkapan error runtime compiler dan visual canvas internal secara otomatis melalui IPC channel `studio:error`.
* Pemulihan kode instan dengan proteksi jeda buffer untuk menghindari race condition file bundler.

### 🔐 4. Enhanced Licensing & Anti-Clock Rollback Engine
* Penambahan verifikasi masa aktif dinamis (1 Hari, 3 Hari, 7 Hari, 30 Hari, dan Lifetime Access) berbasis parameter `expiresAt`.
* Penerapan Anti-Clock Desync Lockout berbasis stempel waktu lokal terenkripsi AES-256-CBC (`clock_sync.dat`) dengan batas toleransi mundur 3 menit (180.000 ms).
* Tombol pemulihan instan *"🔄 Sinkronkan Waktu via Internet (1-Klik)"* via query HTTP HEAD waktu global (Google / Cloudflare) serta proteksi render IPC main process jika lisensi kedaluwarsa atau jam desinkron.

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

1. **Jalankan Installer**: Pasang `Motion-Suite-Pro.Setup.1.0.5.exe` pada sistem Windows Anda.
2. **Klaim & Aktivasi Lisensi**: Buka aplikasi, salin **Machine ID** Anda di pojok kiri atas. Kunjungi [Formulir Aktivasi Resmi](https://motionsuite-act.duckdns.org/form/c1dc1a25-386b-4780-9e60-454b6201969e) untuk memasukkan nomor invoice Lynk.id dan Machine ID Anda. Masukkan Kunci Lisensi resmi yang dikirim ke email, lalu klik **Validasi** hingga status menjadi **"Aktif"** (Hijau).
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

* **Produk**: Motion Suite Pro (v1.0.5 Production Release)
* **Distribusi & Lisensi**: Official Lynk.id Store & GitHub Release
* **Formulir Aktivasi Web**: [https://motionsuite-act.duckdns.org/form/c1dc1a25-386b-4780-9e60-454b6201969e](https://motionsuite-act.duckdns.org/form/c1dc1a25-386b-4780-9e60-454b6201969e)
* **Bantuan & Layanan Pelanggan**:
  - Email Resmi: [ahmadmuslihfarhany46@gmail.com](mailto:ahmadmuslihfarhany46@gmail.com)
  - Telegram Personal: [@ahmadmuslihfarhany](https://t.me/ahmadmuslihfarhany)
* **Hak Cipta**: &copy; 2026 Motion Suite Pro Team. Seluruh hak cipta dilindungi undang-undang.
