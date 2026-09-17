================================================================================
                    MOTION STUDIO — SPESIFIKASI & PANDUAN SISTEM
================================================================================
Versi: 1.0.0 (Pro Desktop Edition)
Pengembang: Motion Studio Team
Website: https://motionstudio.app
================================================================================

Terima kasih telah menggunakan Motion Studio! Aplikasi ini adalah Creative Coding 
& AI Motion Graphics Workstation modern berbasis Remotion & Google Gemini AI 
untuk memproduksi video animasi dan aset microstock berkualitas studio.

--------------------------------------------------------------------------------
1. SPESIFIKASI SISTEM MINIMUM & REKOMENDASI
--------------------------------------------------------------------------------

[ SPESIFIKASI MINIMUM ]
- Sistem Operasi : Windows 10 / Windows 11 (64-bit)
- Processor (CPU): Multi-core x64 Processor (Minimal 4 Core / 8 Thread, e.g. Intel Core i5 Gen 8+ / AMD Ryzen 3+)
- Memori (RAM)   : 8 GB RAM
- Grafis (GPU)   : Intel UHD Graphics 620 / AMD Radeon Vega terintegrasi (Mendukung OpenGL & DirectX 11)
- Ruang Penyimpanan: 5 GB ruang kosong (SSD sangat disarankan untuk performa rendering)
- Resolusi Layar : 1280 x 720 (Mendukung scaling Windows 125% dan 150%)

[ SPESIFIKASI REKOMENDASI (PERFORMA MAKSIMAL) ]
- Sistem Operasi : Windows 11 64-bit (Update Terbaru)
- Processor (CPU): 6 Core / 12 Thread atau lebih tinggi (Intel Core i7/i9 Gen 10+, AMD Ryzen 5/7/9 3000 Series+)
- Memori (RAM)   : 16 GB - 32 GB RAM DDR4/DDR5
- Grafis (GPU)   : Dedicated GPU NVIDIA GeForce GTX 1650 / RTX 2060 / 3060 / 4000 series atau AMD Radeon RX 6000+
- Ruang Penyimpanan: NVMe SSD dengan sisa ruang 20 GB+
- Resolusi Layar : 1920 x 1080 (Full HD) atau resolusi 2K/4K

--------------------------------------------------------------------------------
2. REKOMENDASI PENGATURAN RENDER & HARDWARE
--------------------------------------------------------------------------------

Motion Studio dilengkapi dengan engine rendering FFmpeg & Chromium hardware acceleration. 
Pilihlah pengaturan berikut sesuai kemampuan spesifikasi perangkat Anda:

A. LAPTOP STANDAR / PC OFFICE (RAM 8 GB, GPU Terintegrasi):
   - Format Ekspor   : MP4 (H.264)
   - Resolusi        : 1080p Full HD (1920x1080 atau 1080x1920 untuk Reels/Shorts)
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
     (Adobe After Effects, Premiere Pro, DaVinci Resolve, Final Cut Pro) dan 
     penjualan aset video transparan di pasar microstock.

--------------------------------------------------------------------------------
3. PANDUAN RINGKAS MEMULAI (QUICK START)
--------------------------------------------------------------------------------

Langkah 1: VALIDASI LISENSI
- Saat pertama kali membuka aplikasi, masukkan Kunci Lisensi resmi Anda di 
  panel "Status Lisensi" pada sidebar kiri.
- Klik "Validasi". Lisensi terikat pada Machine ID perangkat Anda secara aman.

Langkah 2: MENDAPATKAN & MEMASUKKAN GOOGLE GEMINI API KEY (GRATIS)
- Filosofi & Arsitektur Engine:
  Google Gemini (Gemini Flash) di dalam Motion Studio digunakan murni sebagai 
  "Coding Engine" yang menerjemahkan instruksi, alur cerita, dan konsep spesifik Anda 
  secara realtime menjadi kode animasi murni TypeScript & React (Remotion).
- Jalan pikiran, alur cerita, durasi, komposisi tata letak, dan konsep video 
  sepenuhnya ditentukan oleh Anda sebagai kreator. Hasil akhirnya adalah 
  Programmatic Motion Graphics beresolusi tajam presisi piksel dengan komputasi matematis, 
  BUKAN video AI generatif yang acak, buram, tidak konsisten, atau penuh halusinasi.
- Dapatkan API Key resmi gratis dari Google AI Studio melalui tautan resmi:
  👉 https://aistudio.google.com/app/apikey
- Anda cukup login dengan akun Google, buat API Key baru (AIzaSy...), lalu salin.
- Di Motion Studio: Buka panel "Gemini API Key" pada sidebar kiri, tempel kunci 
  API Anda, lalu klik "Simpan".
- Tombol pintasan langsung "🔑 Dapatkan API Key Gratis ↗" juga tersedia di aplikasi 
  untuk membuka halaman Google AI Studio dengan sekali klik.

Langkah 3: MEMBUAT & MERENDER VIDEO PERTAMA
1. Ketik konsep video animasi di kolom "AI Video Generator" (contoh: "HUD Countdown 
   futuristik neon cyan dengan partikel dan lingkaran putar 5 detik").
2. Anda juga dapat mengunggah gambar logo/referensi (PNG transparan/SVG).
3. Klik "⚡ Generate Video TSX".
4. Pratinjau animasi akan langsung tampil secara interaktif di layar Studio Preview.
5. Gunakan fitur "Edit Video dengan AI" jika ingin melakukan revisi warna/kecepatan.
6. Pilih format yang diinginkan (MP4 / ProRes 4444), tentukan folder ekspor, lalu 
   klik tombol hijau "🚀 Ekspor / Render Video".
7. Setelah proses selesai, notifikasi Windows Toast dan nada lonceng sukses 
   akan berbunyi, dan video siap Anda gunakan!

--------------------------------------------------------------------------------
4. TROUBLESHOOTING & DUKUNGAN TEKNIS
--------------------------------------------------------------------------------
- Jika preview menampilkan peringatan "Port 10871 Offline": 
  Klik tombol "⚡ Restart Server" di bagian atas bar preview.
- Jika terjadi kesalahan kode animasi saat eksperimen:
  Gunakan tombol "⚡ Auto-Fix Error" atau "↩ Kembalikan ke Versi Sebelumnya" 
  untuk pemulihan otomatis seketika.
- File ekspor default disimpan di:
  C:\Users\<NamaUser>\Downloads\Motion Studio Exports

================================================================================
           Selamat Berkarya & Menghasilkan Aset Motion Berkualitas Tinggi!
================================================================================
