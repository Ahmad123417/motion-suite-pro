================================================================================
                 MOTION SUITE PRO — SPESIFIKASI & PANDUAN SISTEM
================================================================================
Versi     : 1.0.4 (Official Production Release)
Produk    : Motion Suite Pro
Pengembang: Motion Suite Pro Team
Platform  : Windows 10 & 11 (64-bit)
WA Admin  : 085161180423
Repository: https://github.com/Ahmad123417/motion-studio-release
Lisensi   : Flexible Tiered Licensing (Harian, Mingguan, Bulanan, s/d Lifetime)
================================================================================

Terima kasih telah menggunakan Motion Suite Pro! Aplikasi ini adalah Creative Coding 
& AI Motion Graphics Workstation modern yang memadukan kekuatan Remotion (React 19 
+ TypeScript) dan Google Gemini AI untuk memproduksi video animasi presisi matematis, 
aset siaran beresolusi 4K, dan video transparan berkualitas studio.

--------------------------------------------------------------------------------
💡 POSISI PRODUK: BUKAN VIDEO AI GENERATIF BIASA
--------------------------------------------------------------------------------

Motion Suite Pro BUKAN generator video berbasis model difusi visual (generative AI 
video) yang sering mengalami halusinasi visual, teks buram/rusak tak terbaca, 
distorsi bentuk yang tidak terkendali, serta tidak bisa diedit ulang.

Sebaliknya, Motion Suite Pro adalah "Prompt-to-Code Motion Graphics Workstation":
1. Presisi Piksel & Teks Tajam: Seluruh tipografi dan elemen grafis dirender 
   secara programatis (vektor/SVG dan CSS murni), menghasilkan teks yang 100% 
   tajam tanpa artefak kompresi atau teks palsu.
2. Animasi Matematis Murni: Pergerakan didasarkan pada rumus interpolasi dan 
   spring physics, menjamin gerakan ultra-mulus pada 30 hingga 60 FPS.
3. Kontrol Parametrik Penuh: Seluruh warna, teks, posisi, skala, dan kecepatan 
   dapat disesuaikan kapan saja lewat Visual Tweaker tanpa perlu generate ulang.
4. Transparansi Asli (True Alpha Channel): Menghasilkan video berlatar transparan 
   murni (tanpa background hitam) yang siap ditumpuk (compositing) di software 
   editing video profesional mana pun.

--------------------------------------------------------------------------------
1. FITUR UTAMA & SISTEM LISENSI FLEKSIBEL (V1.0.4)
--------------------------------------------------------------------------------

A. FLEXIBLE TIERED LICENSING SYSTEM
   - Mendukung aktivasi lisensi berbasis durasi dinamis sesuai paket pembelian 
     resmi di Lynk.id (misal: 1 Hari, 3 Hari, 7 Hari, 14 Hari, 30 Hari, 60 Hari) 
     hingga akses penuh seumur hidup (Lifetime).
   - Otentikasi kriptografi RSA-2048 yang terikat aman dengan Machine ID perangkat.
   - Indikator status di pojok kiri atas aplikasi secara otomatis menampilkan 
     durasi aktif dan masa kedaluwarsa lisensi secara dinamis dan real-time.

B. RENDER RESOLUSI HINGGA 4K ULTRA HD & 60 FPS
   - Mendukung output resolusi Full HD (1080p), 2K Quad HD (1440p), hingga 
     4K Ultra HD (3840 x 2160 piksel).
   - Opsi Frame Rate: 30 FPS (standar video digital) dan 60 FPS (ultra-smooth).
   - Opsi Multi-Rasio: 16:9 (Landscape/Widescreen), 9:16 (Vertical Story/Reels/TikTok), 
     dan 1:1 (Square Feed Instagram).

C. FORMAT EKSPOR PROFESIONAL: PRORES 4444 ALPHA & MP4
   - Apple ProRes 4444 (.MOV):
     Standar emas industri broadcast dan motion design. Mendukung 10-bit True 
     Alpha Channel (transparansi tembus pandang tanpa latar hitam) dengan format 
     piksel `yuva444p10le` dan format gambar PNG murni. Sangat ideal untuk compositing 
     di Adobe Premiere Pro, After Effects, DaVinci Resolve, Final Cut Pro, serta 
     penjualan aset video bernilai tinggi di pasar microstock (Envato, Motion Array, 
     Pond5, Shutterstock).
   - MPEG-4 H.264 (.MP4):
     Format standar universal yang ringkas, cepat, dan kompatibel 100% dengan semua 
     pemutar video, YouTube, WhatsApp, dan platform media sosial.

D. INTEGRASI MANDIRI GOOGLE GEMINI API (BYOK - 100% GRATIS)
   - Mengusung model BYOK (Bring Your Own Key): Pengguna menggunakan API Key resmi 
     gratis dari Google AI Studio (aistudio.google.com).
   - Tanpa Biaya Langganan Bulanan: Kuota Free-Tier Google (15 RPM dan 1.500 permintaan 
     harian) sangat leluasa untuk merancang ratusan animasi per hari.
   - Gemini bertindak murni sebagai Creative Coding Engine yang menyusun kode 
     animasi TypeScript/React Remotion secara otomatis.

E. COLLAPSIBLE VISUAL TWEAKER DRAWER (INSPECTOR PANEL)
   - Tombol Toggle `[ 🎛️ Visual Tweaker ]` di bilah atas kanvas preview.
   - Panel Drawer samping kanan (Dark Cyber Pro) tanpa memotong tinggi kanvas (100% full viewport).
   - Tab/Group Teks: `titleText`, `subtitleText`, `badgeText`.
   - Tab/Group Warna: `accentColor`, `secondaryColor`, mode Latar (Solid vs Alpha), `backgroundColor`.
   - Tab/Group Transformasi: Slider Posisi X (-500 s/d +500px), Posisi Y, Skala (50% s/d 200%), tombol Reset.
   - Tab/Group Efek (FX): Slider Neon Glow (0 s/d 40px) dan Slider Speed Multiplier (0.5x s/d 2.0x).
   - Live Hot-Sync Engine: Pergeseran slider disinkronkan langsung ke video preview secara seketika.

F. SISTEM UNDO BERURUTAN & REVERT TO INITIAL STATE
   - Snapshot Nilai Asli: Menyimpan baseline parameter awal template atau hasil generate AI.
   - Tombol "↺ Kembalikan ke Asli" (Revert): Sekali klik mengembalikan seluruh slider dan teks ke kondisi awal.
   - Riwayat Undo Berurutan ("↶ Undo"): Kapasitas 20 langkah riwayat perubahan terakhir.

G. AI SELF-HEALING & AUTO-FIX ERROR
   - Tombol "⚡ Auto-Fix Error": Jika terjadi galat sintaks saat pengeditan kode manual, 
     AI secara otomatis menganalisis stack trace dan memperbaikinya dalam hitungan detik.

H. IN-APP AUTO-UPDATE SYSTEM
   - Notifikasi pembaruan aplikasi modern model OBS Studio dengan pemantauan unduhan di latar belakang.

--------------------------------------------------------------------------------
2. CATATAN RILIS (CHANGELOG V1.0.4)
--------------------------------------------------------------------------------

Pembaruan v1.0.4 menghadirkan peningkatan signifikan pada stabilitas dan kontrol ekspor:

1. Optimalisasi Remotion Engine di Latar Belakang:
   - Peningkatan efisiensi manajemen worker Node.js dan proses compilation pipeline.
   - Optimalisasi konsumsi memori (RAM) saat merender komposisi 4K berdurasi panjang.
   - Sinkronisasi alokasi progress render fisik (25% - 100%) langsung ke status bar.

2. Perbaikan Stabilitas Canvas Preview:
   - Penanganan isu port offline (Port 10871) dengan fitur auto-recovery dan tombol "Sync Canvas".
   - Sinkronisasi visual tweaker tanpa kedipan (flicker-free dynamic state sync).
   - Garansi Frame 0 Safe: Memastikan komposisi langsung terlihat jelas di frame awal tanpa blank screen.

3. Penyesuaian Kontrol Ekspor Video:
   - Penguncian ketat ProRes 4444 Alpha Channel pada format piksel `yuva444p10le` dan 
     format gambar `png` murni untuk menjamin 100% transparansi bebas latar hitam.
   - Antarmuka pemilihan resolusi terpadu (1080p, 2K, 4K) dan rasio aspek (16:9, 9:16, 1:1).
   - Penambahan modal auto-update pop-up untuk kemudahan update ke versi mendatang.

--------------------------------------------------------------------------------
3. SPESIFIKASI SISTEM MINIMUM & REKOMENDASI
--------------------------------------------------------------------------------

[ SPESIFIKASI MINIMUM ]
- Sistem Operasi : Windows 10 / Windows 11 (64-bit, Build 1909+)
- Processor (CPU): Multi-core x64 Processor (Minimal 4 Core / 8 Thread, e.g. Intel i5 Gen 8+ / AMD Ryzen 3+)
- Memori (RAM)   : 8 GB RAM DDR4
- Grafis (GPU)   : Intel UHD Graphics 620 / AMD Radeon Vega terintegrasi (Mendukung OpenGL & DirectX 11)
- Ruang Harddisk : 5 GB ruang kosong (SSD disarankan)
- Resolusi Layar : 1280 x 720 (Mendukung scaling Windows 125% dan 150%)

[ SPESIFIKASI REKOMENDASI (PERFORMA 4K MAKSIMAL) ]
- Sistem Operasi : Windows 11 64-bit (Update Terbaru)
- Processor (CPU): 6 Core / 12 Thread atau lebih tinggi (Intel Core i7/i9 Gen 10+, AMD Ryzen 5/7/9 3000 Series+)
- Memori (RAM)   : 16 GB - 32 GB RAM DDR4/DDR5
- Grafis (GPU)   : Dedicated GPU NVIDIA GeForce GTX 1650 / RTX 2060 / 3060 / 4000 series atau AMD RX 6000+
- Ruang Harddisk : NVMe SSD M.2 dengan sisa ruang 20 GB+
- Resolusi Layar : 1920 x 1080 (Full HD) atau resolusi 2K/4K

--------------------------------------------------------------------------------
4. PANDUAN RINGKAS MEMULAI (QUICK START)
--------------------------------------------------------------------------------

Langkah 1: BUKA & PASANG APLIKASI
- Jalankan "Motion Suite Pro Setup v1.0.4.exe" sampai aplikasi terbuka.
- Jika muncul peringatan Windows SmartScreen, klik "More info" lalu pilih "Run anyway".

Langkah 2: SALIN MACHINE ID
- Di dalam aplikasi, lihat panel kiri atas pada bagian "Status Lisensi".
- Salin deretan kode "Machine ID" perangkat Anda.

Langkah 3: KLAIM KODE LISENSI KE WHATSAPP ADMIN
- Kirim chat ke WA Admin: 085161180423 dengan format:
  * Bukti Pembayaran / Invoice Lynk.id
  * Machine ID laptop Anda
- Catatan Antrean: Lisensi diproses berurutan dari chat paling bawah (yang masuk lebih awal).
  Mohon TIDAK melakukan spam atau chat berulang-ulang agar posisi antrean tidak tertunda.

Langkah 4: AKTIVASI LISENSI
- Setelah menerima kode lisensi dari admin, tempelkan kodenya ke kolom Lisensi di aplikasi, 
  lalu klik "Validasi".
- Status akan berubah menjadi "Aktif" dengan indikator hijau sesuai paket yang dibeli 
  (misal: 1 Hari, 7 Hari, 30 Hari, atau Lifetime).

Langkah 5: PASANG GEMINI API KEY (GRATIS)
- Buka browser dan kunjungi: https://aistudio.google.com (login dengan akun Google).
- Klik "Get API key" -> "Create API key in new project" -> Salin kode token AIzaSy...
- Tempel ke kolom "Gemini API Key" di aplikasi, lalu klik "Simpan".

Langkah 6: SELESAI & MULAI BERKARYA
- Motion Suite Pro siap digunakan untuk membuat animasi motion graphic 4K!
- Rancang teks dan warna di panel [ 🎛️ Visual Tweaker ], tonton live preview, 
  lalu klik tombol "🚀 Ekspor / Render Video".

--------------------------------------------------------------------------------
5. TROUBLESHOOTING & DUKUNGAN TEKNIS
--------------------------------------------------------------------------------
- Jika kanvas menampilkan "Port 10871 Offline / Initializing":
  Tunggu 3-5 detik saat compiler TypeScript memuat di latar belakang. Jika belum 
  tersinkronisasi, klik tombol "Sync Canvas" pada bilah atas kanvas.
- Jika kuota API habis (HTTP 429 Resource Exhausted):
  Tunggu 30-60 detik hingga Google mereset jendela per-menit, atau buat API Key baru 
  di Google AI Studio dengan membuat project baru.
- Jika terjadi galat kode saat utak-atik manual:
  Gunakan tombol "⚡ Auto-Fix Error" untuk perbaikan otomatis seketika oleh AI.
- Folder ekspor bawaan (default):
  C:\Users\<NamaUser>\Downloads\Motion Studio Exports
- Panduan Lengkap Bergambar (A4 PDF):
  Buka file "user-guide.html" di folder aplikasi untuk panduan visual cetak A4.
- Kontak Admin WhatsApp Resmi:
  085161180423

================================================================================
           Selamat Berkarya dengan Motion Suite Pro — Studio in a Box!
================================================================================
