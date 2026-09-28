================================================================================
             MOTION SUITE PRO — SPESIFIKASI, ARSITEKTUR & PANDUAN SISTEM
================================================================================
Versi     : 1.0.5 (Official Cross-Platform Production Release)
Produk    : Motion Suite Pro
Pengembang: Motion Suite Pro Team
Platform  : Windows 10 & 11 (64-bit) & Apple macOS 11+ (Apple Silicon & Intel)
Dukungan  : ahmadmuslihfarhany46@gmail.com | Telegram: @ahmadmuslihfarhany
Repository: https://github.com/Ahmad123417/motion-suite-pro
Lisensi   : Flexible Tiered Licensing (Harian, Mingguan, Bulanan, s/d Lifetime)
================================================================================

Terima kasih telah menggunakan Motion Suite Pro! Motion Suite Pro adalah workstation 
kreatif desktop modern berbasis "Creative Coding & AI Motion Graphics" yang memadukan 
kekuatan Dynamic Code-to-Video Engine (React 19 + TypeScript) dan Google Gemini AI 
untuk memproduksi video animasi berkecepatan tinggi dengan presisi matematis, 
aset siaran resolusi 4K 60FPS, dan video transparan berkualitas studio broadcast.

--------------------------------------------------------------------------------
💡 POSISI PRODUK: MENGAPA BUKAN VIDEO AI DIFUSI BIASA?
--------------------------------------------------------------------------------

Motion Suite Pro BUKAN generator video berbasis model difusi visual (generative AI 
video seperti Runway, Kling, atau Sora) yang sering mengalami halusinasi visual, 
teks buram/rusak tak terbaca, distorsi bentuk yang tidak terkendali, serta tidak bisa diedit ulang.

Sebaliknya, Motion Suite Pro adalah "Prompt-to-Code Motion Graphics Workstation":
1. Presisi Piksel & Tipografi Tajam: Seluruh tipografi dan elemen grafis dirender 
   secara programatis (vektor SVG murni dan CSS teroptimasi), menghasilkan teks yang 100% 
   tajam pada resolusi apa pun tanpa artefak kompresi atau teks acak palsu.
2. Animasi Matematis Murni: Pergerakan didasarkan pada rumus interpolasi dinamis dan 
   spring physics, menjamin gerakan ultra-mulus pada 30 hingga 60 FPS tanpa jeda patah-patah.
3. Kontrol Parametrik Penuh: Seluruh warna, teks, posisi, skala, dan kecepatan 
   dapat disesuaikan secara instan lewat Visual Tweaker 4-Kategori tanpa perlu memanggil ulang AI.
4. Transparansi Murni (True Alpha Channel): Menghasilkan video berlatar transparan 
   murni (tanpa latar belakang hitam pekat) yang siap langsung ditumpuk (compositing) 
   di software editing video profesional apa pun.

--------------------------------------------------------------------------------
1. PANDUAN PEMILIHAN INSTALLER (WINDOWS & macOS)
--------------------------------------------------------------------------------

Untuk memastikan performa optimal dan kompatibilitas hardware penuh, pilih file installer 
yang sesuai dengan sistem operasi dan arsitektur prosesor komputer Anda:

A. PENGGUNA WINDOWS:
   * Pilih berkas: "Motion Suite Pro.Setup.1.0.5.exe" (atau format .exe lainnya)
   * Kompatibilitas: Windows 10 & Windows 11 (64-bit)

B. PENGGUNA MAC APPLE SILICON (CHIP M1, M2, M3, M4):
   * Pilih berkas: "Motion Suite Pro-1.0.5-mac-arm64.dmg"
   * Kompatibilitas: MacBook Air, MacBook Pro, Mac mini, Mac Studio, iMac dengan chip Apple Silicon M-Series
   * Arsitektur: Native ARM64 (Performa rendering maksimal, hemat daya, tanpa emulasi Rosetta)

C. PENGGUNA MAC INTEL:
   * Pilih berkas: "Motion Suite Pro-1.0.5-mac-x64.dmg"
   * Kompatibilitas: Seluruh lini komputer Mac berbasis prosesor Intel 64-bit

--------------------------------------------------------------------------------
2. SPESIFIKASI SISTEM MINIMUM & REKOMENDASI
--------------------------------------------------------------------------------

[ SPESIFIKASI MINIMUM ]
- Sistem Operasi : 
  * Windows: Windows 10 / Windows 11 (64-bit, Build 1909+)
  * macOS  : macOS 11 (Big Sur) atau versi lebih baru (Monterey, Ventura, Sonoma, Sequoia)
- Processor (CPU):
  * Mac    : Chip Apple Silicon M1 (atau Intel Core i5 Dual-Core 64-bit ke atas)
  * Windows: Multi-core x64 Processor (Minimal 4 Core / 8 Thread, e.g. Intel Core i5 Gen 8+ / AMD Ryzen 3+)
- Memori (RAM)   : 8 GB RAM (Unified Memory pada Mac / DDR4 pada PC)
- Kartu Grafis   : 
  * Mac    : Integrated Apple GPU / Intel Iris Plus Graphics
  * Windows: Intel UHD Graphics 620 / AMD Radeon Vega terintegrasi (Mendukung OpenGL & DirectX 11)
- Ruang Penyimpanan: 5 GB ruang kosong (SSD disarankan)
- Resolusi Layar : 1280 x 720 (Mendukung Retina Display Mac & display scaling Windows)

[ SPESIFIKASI REKOMENDASI (PERFORMA 4K 60FPS MAKSIMAL) ]
- Sistem Operasi :
  * Windows: Windows 11 64-bit (Update Terbaru)
  * macOS  : macOS 13 (Ventura) / macOS 14 (Sonoma) / macOS 15 (Sequoia)
- Processor (CPU):
  * Mac    : Apple Silicon M1 Pro/Max, M2 Pro/Max, M3 Pro/Max, M4 Pro/Max (atau M-Series standar)
  * Windows: 6 Core / 12 Thread atau lebih tinggi (Intel Core i7/i9 Gen 10+, AMD Ryzen 5/7/9 3000 Series+)
- Memori (RAM)   : 16 GB - 32 GB RAM (Unified Memory pada Mac / DDR4/DDR5 pada PC)
- Kartu Grafis (GPU):
  * Mac    : 10-Core GPU Apple Silicon atau lebih tinggi
  * Windows: Dedicated GPU NVIDIA GeForce GTX 1650 / RTX 2060 / 3060 / 4000 series atau AMD Radeon RX 6000+
- Ruang Penyimpanan: NVMe SSD dengan sisa ruang 20 GB+
- Resolusi Layar : 1920 x 1080 (Full HD), 2K, atau 4K Ultra HD

--------------------------------------------------------------------------------
3. INFORMASI FITUR UTAMA & OUTPUT RENDER
--------------------------------------------------------------------------------

A. DUAL FORMAT OUTPUT RENDER:
   1. MP4 Video (H.264 / CRF 18):
      - Format standar internasional dengan rasio kompresi tinggi dan kompatibilitas universal.
      - Sangat cocok untuk upload langsung ke YouTube, Instagram Reels, TikTok, LinkedIn, dan website.
      - Render cepat dengan pemanfaatan hardware acceleration (NVENC pada Windows & VideoToolbox pada Mac).
   
   2. Apple ProRes 4444 (.MOV) dengan Alpha Channel (yuva444p10le):
      - Format standar broadcast video profesional yang mempertahankan latar belakang transparan (True Alpha).
      - Menghasilkan aset motion graphics transparan tanpa background hitam, siap langsung ditumpuk 
        (drag & drop compositing) di Adobe Premiere Pro, After Effects, DaVinci Resolve, Final Cut Pro, CapCut.
      - Bernilai komersial tinggi untuk penjualan aset stok grafis di marketplace (Envato, Motion Array, Pond5).

B. 4-CATEGORY VISUAL TWEAKER LIVE HOT-SYNC:
   - Panel kontrol parametrik instan tanpa perlu memanggil ulang AI:
     * Teks Konten : Judul (titleText), Subjudul (subtitleText), Badge (badgeText)
     * Warna       : Warna Utama (accentColor), Warna Sekunder, Background Color, Transparent Toggle
     * Transformasi: Offset X, Offset Y, Scale Slider (50% hingga 200%), Reset Position
     * Efek & Ritme: Neon Glow Intensity, Speed Multiplier
   - Live Hot-Sync: Mengubah slider langsung memperbarui kanvas preview dan terhubung ke render pipeline.

C. UNIVERSAL DYNAMIC TIMELINE & NEVER-FREEZE ENGINE:
   - Pilihan durasi fleksibel: 5 Detik, 10 Detik, 15 Detik, dan 20 Detik (600f/1200f).
   - Seluruh animasi dihitung secara proporsional (% dari total durasi frame), bebas freeze di detik berapa pun.
   - Micro-motion kontinu: Floating loop, breathing glow, camera zoom drift, dan dynamic indicators.

D. AUTOMATED ERROR CAPTURE & SELF-HEALING RECOVERY:
   - Menangkap galat kompilasi atau runtime visual secara otomatis tanpa copy-paste manual.
   - Tombol "Auto-Fix Bug" satu-klik menginstruksikan AI untuk memperbaiki galat dalam hitungan detik.

E. CROSS-PLATFORM RSA-SHA256 LICENSING & ANTI-CLOCK ROLLBACK GUARD:
   - Hardware-Locked Machine ID: Mengikat lisensi ke Hardware ID fisik perangkat 
     (IOPlatformUUID pada macOS & Hardware GUID pada Windows) yang tersimpan aman di direktori 
     userData ('~/Library/Application Support/Motion Suite Pro' di macOS dan '%APPDATA%' di Windows).
   - Sistem Lisensi Bersih: 100% TIDAK menggunakan Windows Registry (Bebas reg.exe / HKCU), menjamin 
     stabilitas lintas platform dan bebas crash pada macOS.
   - Proteksi Anti-Clock Rollback: Enkripsi AES-256-CBC stempel waktu lokal untuk mencegah pemunduran jam.
   - Pemulihan Waktu Internet 1-Klik: Sinkronisasi waktu instan via query HTTP HEAD ke Google / Cloudflare.
   - Multi-Tier Duration: Mendukung masa aktif fleksibel (1 Hari Trial, 3 Hari, 7 Hari, 30 Hari, hingga Lifetime).

F. IN-APP AUTO-UPDATE SYSTEM:
   - Pembaruan aplikasi modern dengan deteksi rilis GitHub dan unduhan di latar belakang.

--------------------------------------------------------------------------------
4. PANDUAN RINGKAS MEMULAI (QUICK START)
--------------------------------------------------------------------------------

Langkah 1: PASANG APLIKASI
- Windows: Jalankan installer .exe. Jika muncul SmartScreen, klik "More info" -> "Run anyway".
- macOS  : Buka file .dmg, seret "Motion Suite Pro" ke folder Applications. 
           Jika terhalang Gatekeeper, klik kanan file aplikasi di Applications -> pilih "Open", 
           atau izinkan lewat System Settings > Privacy & Security, atau jalankan perintah Terminal:
           xattr -cr "/Applications/Motion Suite Pro.app"

Langkah 2: SALIN MACHINE ID
- Buka aplikasi Motion Suite Pro.
- Pada panel kiri atas atau dialog aktivasi, salin 16-karakter Machine ID unik perangkat Anda.

Langkah 3: KLAIM KUNCI LISENSI RESMI
- Buka browser dan akses formulir aktivasi resmi:
  https://motionsuite-act.duckdns.org/form/c1dc1a25-386b-4780-9e60-454b6201969e
- Isi data pembelian Anda (Email, Nomor Invoice Lynk.id, Machine ID, dan Bukti Transaksi).
- Kunci lisensi resmi RSA-SHA256 akan otomatis terkirim ke email Anda.

Langkah 4: AKTIVASI DI APLIKASI
- Salin seluruh teks Kunci Lisensi dari email, tempelkan ke kolom Lisensi di aplikasi, lalu klik "Validasi".
- Status lisensi berubah menjadi aktif hijau.

Langkah 5: HUBUNGKAN GOOGLE GEMINI API KEY (GRATIS)
- Buka https://aistudio.google.com -> klik "Get API key" -> "Create API key in new project".
- Salin token (diawali AIzaSy...) dan tempelkan ke kolom Gemini API Key di aplikasi -> klik "Simpan".

Langkah 6: SELESAI & MULAI MERANCANG MOTION GRAPHIC
- Masukkan ide animasi pada prompt AI atau sesuaikan langsung via Visual Tweaker.
- Tonton preview langsung di Studio Canvas, lalu klik "🚀 Ekspor / Render Video".

--------------------------------------------------------------------------------
5. LOKASI FOLDER EKSPOR DEFAULT
--------------------------------------------------------------------------------
- Windows: C:\Users\<NamaUser>\Downloads\Motion Studio Exports
- macOS  : /Users/<NamaUser>/Downloads/Motion Studio Exports
(Lokasi folder dapat diubah kapan saja melalui dialog pemilih folder sebelum proses render).

================================================================================
LAYANAN BANTUAN & KONTAK DUKUNGAN TEKNIS:
- Panduan Visual & Cetak A4: Buka file "user-guide.html" di folder aplikasi.
- Email Dukungan   : ahmadmuslihfarhany46@gmail.com
- Telegram Resmi   : @ahmadmuslihfarhany
================================================================================
           Selamat Berkarya dengan Motion Suite Pro — Studio in a Box!
================================================================================