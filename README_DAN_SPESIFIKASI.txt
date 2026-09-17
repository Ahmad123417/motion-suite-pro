================================================================================
                 MOTION SUITE PRO — SPESIFIKASI & PANDUAN SISTEM
================================================================================
Versi     : 1.0.0 (Official Production Release)
Produk    : Motion Suite Pro
Pengembang: Motion Suite Pro Team
Repository: https://github.com/Ahmad123417/motion-studio-release
================================================================================

Terima kasih telah menggunakan Motion Suite Pro! Aplikasi ini adalah Creative Coding 
& AI Motion Graphics Workstation modern berbasis Remotion & Google Gemini AI 
untuk memproduksi video animasi dan aset microstock berkualitas studio.

--------------------------------------------------------------------------------
1. FITUR UTAMA & INOVASI SISTEM V1.0.0
--------------------------------------------------------------------------------

A. COLLAPSIBLE VISUAL TWEAKER DRAWER (INSPECTOR PANEL)
   - Tombol Toggle `[ 🎛️ Visual Tweaker ]` di bilah atas kanvas sejajar dengan 
     Sync Canvas dan Cinema Mode.
   - Tampil sebagai Collapsible Right Drawer (slide-in overlay) bertema Dark Cyber Pro 
     tanpa memotong tinggi kanvas preview (kanvas tetap lega 100% full viewport).
   - Tab/Group Teks:
     * `titleText`    : Mengubah Judul Utama video.
     * `subtitleText` : Mengubah Sub-judul / Informasi Sekunder.
     * `badgeText`    : Mengubah Label Atas / Kategori.
   - Tab/Group Warna & Latar:
     * `accentColor`    : Color picker warna aksen utama.
     * `secondaryColor` : Color picker warna aksen sekunder.
     * Mode Latar       : Toggle instan antara ⬛ Solid dan 🏁 Alpha (Transparan).
     * `backgroundColor`: Color picker warna latar solid.
   - Tab/Group Transformasi:
     * Slider Posisi X  : -500 px hingga +500 px (Horizontal).
     * Slider Posisi Y  : -500 px hingga +500 px (Vertikal).
     * Slider Skala     : 50% hingga 200% (Scale dinamis).
     * Tombol Reset     : `↺ Reset Transform` mengembalikan X/Y ke 0 dan skala ke 100%.
   - Tab/Group Efek (FX):
     * Slider Neon Glow : 0 hingga 40 px (Intensitas glow aksen).
     * Slider Speed     : 0.5x hingga 2.0x (Kecepatan tempo animasi).
   - Live Hot-Sync Engine:
     Setiap pergeseran slider disinkronkan langsung ke video preview secara realtime 
     dan dipertahankan saat proses render video fisik berlangsung.

B. SISTEM UNDO BERURUTAN & REVERT TO INITIAL STATE
   - Snapshot Nilai Asli (Baseline):
     Merekam nilai parameter asli saat template dimuat atau video baru digenerate oleh AI.
   - Tombol "↺ Kembalikan ke Asli" (Revert):
     Terletak di bilah header panel Visual Tweaker (di sebelah tombol tutup ✕). Sekali klik 
     mengembalikan seluruh slider transformasi, warna, dan teks ke nilai awal secara instan 
     dengan pembaruan langsung (immediate IPC flush) ke kanvas.
   - Riwayat Undo Berurutan ("↶ Undo"):
     Stack riwayat pintar berkapasitas 20 langkah terakhir. Snapshot disimpan secara otomatis 
     sebelum pergeseran slider dimulai atau teks difokuskan, memungkinkan pengguna membatalkan 
     perubahan langkah demi langkah.

C. EKSPOR VIDEO PROFESIONAL & PRORES 4444 ALPHA
   - MP4 (H.264):
     Format standar universal yang ringkas, cepat, dan kompatibel luas untuk web dan media sosial.
   - Apple ProRes 4444 (.MOV):
     Standar emas industri penyiaran dan motion design yang mendukung transparansi 
     Alpha Channel penuh (tanpa latar belakang hitam). Sangat ideal untuk compositing di 
     Adobe After Effects, Premiere Pro, DaVinci Resolve, Final Cut Pro, serta penjualan aset 
     transparan bernilai tinggi di pasar microstock (Envato, Motion Array, Pond5, Shutterstock).

D. AI CODING ENGINE (GOOGLE GEMINI FLASH) & SELF-HEALING
   - Menerjemahkan konsep bahasa alami Anda menjadi kode programatis TypeScript + React (Remotion).
   - Dilengkapi fitur Auto-Fix Error otomatis dan Safe Rollback jika terjadi galat sintaks.
   - Dilengkapi Master Prompt Architect untuk merancang motion grafik bersama AI eksternal.

--------------------------------------------------------------------------------
2. SPESIFIKASI SISTEM MINIMUM & REKOMENDASI
--------------------------------------------------------------------------------

[ SPESIFIKASI MINIMUM ]
- Sistem Operasi : Windows 10 / Windows 11 (64-bit)
- Processor (CPU): Multi-core x64 Processor (Minimal 4 Core / 8 Thread, e.g. Intel Core i5 Gen 8+ / AMD Ryzen 3+)
- Memori (RAM)   : 8 GB RAM
- Grafis (GPU)   : Intel UHD Graphics 620 / AMD Radeon Vega terintegrasi (Mendukung OpenGL & DirectX 11)
- Ruang Harddisk : 5 GB ruang kosong (SSD sangat disarankan untuk performa rendering)
- Resolusi Layar : 1280 x 720 (Mendukung scaling Windows 125% dan 150%)

[ SPESIFIKASI REKOMENDASI (PERFORMA MAKSIMAL) ]
- Sistem Operasi : Windows 11 64-bit (Update Terbaru)
- Processor (CPU): 6 Core / 12 Thread atau lebih tinggi (Intel Core i7/i9 Gen 10+, AMD Ryzen 5/7/9 3000 Series+)
- Memori (RAM)   : 16 GB - 32 GB RAM DDR4/DDR5
- Grafis (GPU)   : Dedicated GPU NVIDIA GeForce GTX 1650 / RTX 2060 / 3060 / 4000 series atau AMD Radeon RX 6000+
- Ruang Harddisk : NVMe SSD dengan sisa ruang 20 GB+
- Resolusi Layar : 1920 x 1080 (Full HD) atau resolusi 2K/4K

--------------------------------------------------------------------------------
3. REKOMENDASI PENGATURAN RENDER & HARDWARE
--------------------------------------------------------------------------------

Motion Suite Pro dilengkapi dengan engine rendering FFmpeg & Chromium hardware acceleration. 
Pilihlah pengaturan berikut sesuai kemampuan spesifikasi perangkat Anda:

A. LAPTOP STANDAR / PC OFFICE (RAM 8 GB, GPU Terintegrasi):
   - Format Ekspor   : MP4 (H.264)
   - Resolusi        : 1080p Full HD (1920x1080 atau 1080x1920 untuk Reels/Shorts/TikTok)
   - Frame Rate (FPS): 30 FPS (Standar Media Sosial & Web)
   - Durasi Rekomendasi: 5 detik - 10 detik (Looping mulus)
   - Mode Render     : Auto atau GPU (Akselerasi)
   * Catatan: Format MP4 menghasilkan ukuran file ringkas, kompatibilitas luas, 
     dan proses encoding yang sangat cepat serta stabil.

B. WORKSTATION TINGGI / PC EDITING (RAM 16 GB+, Dedicated GPU NVIDIA/AMD):
   - Format Ekspor   : Apple ProRes 4444 (.MOV)
   - Background      : Transparan (Alpha Channel) atau Solid
   - Resolusi        : 2K QHD atau 4K Ultra HD (3840x2160)
   - Frame Rate (FPS): 60 FPS (Ultra Smooth)
   - Mode Render     : GPU (Akselerasi)
   * Catatan: Format ProRes 4444 ideal untuk kebutuhan compositing profesional 
     dan penjualan aset video transparan di pasar microstock.

--------------------------------------------------------------------------------
4. PANDUAN RINGKAS MEMULAI (QUICK START)
--------------------------------------------------------------------------------

Langkah 1: VALIDASI LISENSI
- Saat pertama kali membuka aplikasi, masukkan Kunci Lisensi resmi Anda di 
  panel "Status Lisensi" pada sidebar kiri.
- Klik "Validasi". Lisensi terikat pada Machine ID perangkat Anda secara aman (RSA-2048).

Langkah 2: MENDAPATKAN & MEMASUKKAN GOOGLE GEMINI API KEY (GRATIS)
- Google Gemini di dalam Motion Suite Pro digunakan murni sebagai "Coding Engine" 
  yang menerjemahkan instruksi Anda menjadi kode animasi murni TypeScript & React.
- BUKAN video generatif AI acak yang buram, melainkan animasi matematis presisi piksel.
- Dapatkan API Key resmi gratis dari Google AI Studio:
  👉 https://aistudio.google.com/app/apikey
- Masukkan kunci API pada panel "Gemini API Key" di sidebar kiri, lalu klik "Simpan".

Langkah 3: MERANCANG & MENGATUR PARAMETER VISUAL
1. Ketik konsep animasi di kolom AI atau gunakan template yang tersedia.
2. Buka panel `[ 🎛️ Visual Tweaker ]` di bilah atas kanvas.
3. Ubah teks (Judul Utama, Sub-judul, Label Badge), sesuaikan skema warna aksen, 
   dan geser slider posisi serta skala sesuai kebutuhan komposisi Anda.
4. Gunakan tombol "↶ Undo" jika ingin membatalkan pergeseran terakhir, atau 
   "↺ Kembalikan ke Asli" untuk kembali ke wujud awal template seketika.

Langkah 4: EKSPOR & RENDER VIDEO
1. Tentukan format: MP4 (H.264) atau ProRes 4444 (Alpha Transparan).
2. Tentukan folder penyimpanan tujuan.
3. Klik tombol hijau "🚀 Ekspor / Render Video".
4. Setelah selesai, notifikasi Windows Toast dan nada lonceng sukses akan berbunyi!

--------------------------------------------------------------------------------
5. TROUBLESHOOTING & DUKUNGAN TEKNIS
--------------------------------------------------------------------------------
- Jika preview menampilkan peringatan "Port 10871 Offline": 
  Klik tombol "Sync Canvas" di bagian atas bar preview untuk memuat ulang kanvas.
- Jika terjadi kesalahan kode animasi saat eksperimen manual:
  Gunakan tombol "⚡ Auto-Fix Error" untuk pemulihan otomatis seketika oleh AI.
- Folder ekspor bawaan (default):
  C:\Users\<NamaUser>\Downloads\Motion Studio Exports
- Repository & Dokumentasi Resmi:
  https://github.com/Ahmad123417/motion-studio-release

================================================================================
           Selamat Berkarya dengan Motion Suite Pro — Studio in a Box!
================================================================================
