================================================================================
                 MOTION SUITE PRO — SPESIFIKASI & PANDUAN SISTEM
================================================================================
Versi     : 1.0.5 (Official Production Release)
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
1. FITUR UTAMA & SISTEM LISENSI FLEKSIBEL (V1.0.5)
--------------------------------------------------------------------------------

A. DUAL-ENGINE AI PRODUCER & REFINEMENT
   - Prompt-to-Motion Generator bertenaga Gemini 2.5 Flash / Pro.
   - Smart Refinement Chat Assistant: Revisi spesifik tanpa merusak struktur visual lainnya.

B. UNIVERSAL DYNAMIC TIMELINE & NEVER-FREEZE ENGINE
   - Dukungan penuh opsi durasi fleksibel: 5 Detik, 10 Detik, 15 Detik, dan 20 Detik (600f/1200f).
   - Animasi dihitung secara dinamis (% of durationInFrames) sehingga bebas dari freeze di durasi berapa pun.
   - Micro-motion kontinu: Oscillating floating, breathing glow, camera zoom drift, dan data ticks.

C. 4-CATEGORY VISUAL TWEAKER LIVE HOT-SYNC
   - Kontrol parametrik manual instan tanpa perlu memanggil AI:
     * Konten Teks: titleText, subtitleText, badgeText
     * Skema Warna: accentColor, secondaryColor, backgroundColor, isTransparent (Alpha)
     * Transform: Posisi X, Posisi Y, Scale (50% - 200%), Reset Transform
     * Efek & Ritme: Neon Glow Intensity, Speed Multiplier
   - Terintegrasi penuh ke kanvas preview dan pipeline ekspor (MP4 H.264 & ProRes 4444).

D. AUTOMATED ERROR CAPTURE & SELF-HEALING RECOVERY
   - Deteksi runtime error otomatis dari compiler dan canvas Remotion.
   - Tombol "Auto-Fix Bug" interaktif untuk pemulihan kode cerdas satu kali klik.

E. STUDIO CANVAS LIVE PREVIEW
   - Live Player Remotion dengan dukungan Play/Pause, scrubber timeline, hot-reload instan.

F. PHYSICAL EXPORT PIPELINE
   - MP4 (H.264 CRF 18) untuk web/sosial media standar broadcast.
   - MOV ProRes 4444 Alpha Channel (yuva444p10le) untuk Adobe Premiere, After Effects, CapCut, DaVinci Resolve.

G. TIERED MACHINE-LOCKED LICENSING & ANTI-CLOCK ROLLBACK GUARD
   - Kriptografi Asimetris RSA-SHA256 (2048-bit): Mengikat lisensi ke Hardware Machine ID fisik perangkat.
   - Proteksi Anti-Clock Rollback: Stempel waktu lokal tersimpan secara terenkripsi AES-256-CBC (clock_sync.dat) di direktori userData.
   - Deteksi Desync Jam & Toleransi 3 Menit: Pemunduran waktu di atas 180.000 ms otomatis memicu status CLOCK_DESYNC dan memblokir fitur generator & render.
   - Pemulihan Waktu Internet 1-Klik: Sinkronisasi waktu instan via query HTTP HEAD ke Google / Cloudflare memulihkan akses tanpa mengubah setelan jam Windows.
   - Multi-Tier Duration: Mendukung masa berlaku dinamis (1 Hari, 3 Hari, 7 Hari, 30 Hari, dan Lifetime Access permanen).

H. IN-APP AUTO-UPDATE SYSTEM
   - Notifikasi pembaruan aplikasi modern model OBS Studio dengan pemantauan unduhan di latar belakang.

--------------------------------------------------------------------------------
2. CATATAN RILIS (CHANGELOG V1.0.5)
--------------------------------------------------------------------------------

Pembaruan v1.0.5 menghadirkan penyempurnaan menyeluruh pada alur kerja motion graphics:

1. Fungsionalisasi Penuh Visual Tweaker 4-Kategori:
   - Standarisasi kontrak props VibeGraphicProps pada semua prompt AI.
   - Kontrol manual real-time untuk Teks, Warna, Transformasi (Offset X/Y, Scale), dan Efek (Glow, Speed).
   - Dukungan Undo history, Revert to Original, dan sinkronisasi otomatis ke pipeline render.

2. Universal Dynamic Timeline & Anti-Freeze Engine:
   - Penambahan opsi durasi 20 Detik (600 frames @ 30fps / 1200 frames @ 60fps).
   - Seluruh logika animasi menggunakan formula persentase durasi dinamis tanpa hardcoded frames.
   - Gerakan mikro kontinu memastikan visual tidak pernah membeku di detik mana pun.

3. Automated Error Capture & Self-Healing Pipeline:
   - Penangkapan error runtime instan dari Remotion Studio IPC tanpa copy-paste manual.
   - Auto-Fix terpandu dengan jeda buffer aman dan pencegahan race condition bundler.

4. Enhanced Licensing & Anti-Clock Rollback Engine:
   - Penambahan verifikasi masa aktif dinamis (1 Hari, 3 Hari, 7 Hari, 30 Hari, dan Lifetime Access) berbasis parameter expiresAt.
   - Penerapan Anti-Clock Desync Lockout berbasis stempel waktu lokal terenkripsi AES-256-CBC (clock_sync.dat) dengan batas toleransi mundur 3 menit (180.000 ms).
   - Tombol pemulihan instan "Sinkronkan Waktu via Internet (1-Klik)" via query HTTP HEAD waktu global (Google / Cloudflare) serta proteksi render IPC main process jika lisensi kedaluwarsa atau jam desinkron.

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
- Jalankan "Motion Suite Pro Setup v1.0.5.exe" sampai aplikasi terbuka.
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
