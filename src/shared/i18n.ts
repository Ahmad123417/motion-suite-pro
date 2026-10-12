// UI text only. Never translate TSX, prompts, user content, credentials or identifiers.
export type UiLanguage = 'id' | 'en'
export const UI_LANGUAGE_KEY = 'ms_ui_language'
export const isUiLanguage = (value: unknown): value is UiLanguage => value === 'id' || value === 'en'

export const UI_MESSAGES = {
  "update.notesTitle": {"id":"Catatan Pembaruan","en":"Release Notes"},
  "update.notesUnavailable": {"id":"Catatan rilis untuk versi ini belum tersedia. Anda dapat memperbarui sekarang atau memilih Nanti Saja.","en":"Release notes for this version are not available. You can update now or choose Later."},
  "update.versionUnknown": {"id":"Versi baru","en":"New version"},
  "update.downloadingTitle": {"id":"Mengunduh Pembaruan","en":"Downloading Update"},
  "update.availableDescription": {"id":"Motion Suite Pro {p0} tersedia. Periksa catatan pembaruan sebelum melanjutkan.","en":"Motion Suite Pro {p0} is available. Review the release notes before continuing."},
  "update.downloadedDescription": {"id":"Paket {p0} selesai diunduh dan diverifikasi. Pilih Pasang & Restart saat Anda siap.","en":"Package {p0} has been downloaded and verified. Choose Install & Restart when you are ready."},
  "update.v107.studio": {"id":"Studio lebih praktis dengan pembaruan tata letak alur pembuatan animasi.","en":"A more practical studio layout for the animation creation workflow."},
  "update.v107.animationTypes": {"id":"Dukungan pilihan animasi 2D, 2.5D, dan 3D.","en":"Support for 2D, 2.5D, and 3D animation choices."},
  "update.v107.validation": {"id":"Peningkatan validasi TSX dan penanganan kesalahan di Code Inspector.","en":"Improved TSX validation and error handling in Code Inspector."},
  "update.v107.stability": {"id":"Peningkatan stabilitas Gemini, pengaturan palet, dan UI bilingual.","en":"Improvements to Gemini stability, palette settings, and the bilingual interface."},
  "Open export folder: {p0}": { "id": "Buka folder ekspor di File Explorer: {p0}", "en": "Open export folder in File Explorer: {p0}" },
  "Export folder: {p0}": { "id": "Folder ekspor: {p0}", "en": "Export folder: {p0}" },
  "Custom folder": { "id": "Folder pilihan", "en": "Custom folder" },
  "Animation brief": { "id": "Konsep animasi", "en": "Animation Brief" },
  "Quality planning notice": { "id": "Dengan perencanaan AI tambahan. Memerlukan lebih banyak waktu dan penggunaan API.", "en": "Includes additional AI planning. Requires more time and API usage." },
  "Additional generation settings": { "id": "Pengaturan tambahan", "en": "Additional Settings" },
  "Reference attached": { "id": "Referensi terpasang", "en": "Reference attached" },
  "Gagal terhubung ke server waktu (Google/Cloudflare). Periksa koneksi internet Anda.": { "id": "Tidak dapat menyinkronkan waktu. Periksa koneksi internet Anda.", "en": "Could not synchronize the time. Check your internet connection." },
  "Sinkronisasi waktu via internet berhasil. Akses fitur dipulihkan.": { "id": "Waktu berhasil disinkronkan. Fitur dapat digunakan kembali.", "en": "Time synchronized. Feature access has been restored." },
  "Waktu server internet masih lebih lampau dari stempel waktu tersimpan terakhir.": { "id": "Waktu internet masih lebih awal dari catatan terakhir. Periksa waktu perangkat Anda.", "en": "The internet time is earlier than the last recorded time. Check your device clock." },
  "Jam sistem terdeteksi dimundurkan sekitar {p0} menit. Harap sinkronkan jam Anda dengan internet.": { "id": "Jam perangkat mundur sekitar {p0} menit. Sinkronkan waktu melalui internet.", "en": "The device clock moved backwards by about {p0} minutes. Synchronize it using the internet." },
  "File Referensi": { "id": "File Referensi", "en": "Reference File" },
  "Menyiapkan render engine...": { "id": "Menyiapkan proses ekspor...", "en": "Preparing export..." },
  "Menyiapkan bundle ({p0}%)...": { "id": "Menyiapkan animasi ({p0}%)...", "en": "Preparing animation ({p0}%)..." },
  "Rendering {p0}% - Frame {p1}/{p2}": { "id": "Memproses {p0}% — Frame {p1}/{p2}", "en": "Rendering {p0}% — Frame {p1}/{p2}" },
  "Encoding video ({p0}%)...": { "id": "Menyimpan video ({p0}%)...", "en": "Encoding video ({p0}%)..." },
  "Render dibatalkan": { "id": "Ekspor dibatalkan", "en": "Export cancelled" },
  "Render selesai 100%": { "id": "Ekspor selesai 100%", "en": "Export completed 100%" },
  "0px (Off)": { "id": "0 px (Nonaktif)", "en": "0 px (Off)" },
  "15px (Default)": { "id": "15 px (Awal)", "en": "15 px (Default)" },
  "⚠️ TSX RUNTIME EXCEPTION": {
    "id": "Error saat menampilkan animasi",
    "en": "Animation runtime error"
  },
  "Terjadi runtime error pada komponen animasi. Silakan periksa sintaks kode TSX Anda atau klik Reset untuk memuat kembali template standar.": {
    "id": "Animasi belum dapat ditampilkan. Periksa diagnostik TSX atau muat ulang preview.",
    "en": "The animation could not be displayed. Check the TSX diagnostic or reload the preview."
  },
  "🔄 Coba Muat Ulang": {
    "id": "Muat ulang preview",
    "en": "Reload preview"
  },
  "⚡ Reset Template Standar": {
    "id": "Reset template awal",
    "en": "Reset starter template"
  },
  "Dynamic Motion": {
    "id": "Dynamic Motion",
    "en": "Dynamic Motion"
  },
  "Masukkan nomor lisensi terlebih dahulu.": {
    "id": "Masukkan nomor lisensi terlebih dahulu.",
    "en": "Enter your license key first."
  },
  "Gagal memvalidasi lisensi.": {
    "id": "Gagal memvalidasi lisensi.",
    "en": "License validation failed."
  },
  "Gagal melakukan sinkronisasi waktu.": {
    "id": "Gagal melakukan sinkronisasi waktu.",
    "en": "Time synchronization failed."
  },
  "MOTION SUITE PRO": {
    "id": "MOTION SUITE PRO",
    "en": "MOTION SUITE PRO"
  },
  "Memeriksa dan memperbaiki sintaks animasi...": {
    "id": "Memeriksa dan memperbaiki sintaks animasi...",
    "en": "Checking and repairing animation syntax..."
  },
  "Mengalami kendala pada layanan AI. Mencoba model cadangan...": {
    "id": "Mengalami kendala pada layanan AI. Mencoba model cadangan...",
    "en": "The AI request encountered a problem. Trying a backup model..."
  },
  "Halo! Saya asisten editor Motion Suite Pro. Tuliskan instruksi revisi yang ingin diterapkan ke video ini (contoh: \"Percepat tempo animasi\", \"Ubah aksen warna jadi neon purple\", atau \"Tambahkan efek orbit berputar\").": {
    "id": "Halo! Saya asisten editor Motion Suite Pro. Tuliskan instruksi revisi yang ingin diterapkan ke video ini (contoh: \"Percepat tempo animasi\", \"Ubah aksen warna jadi neon purple\", atau \"Tambahkan efek orbit berputar\").",
    "en": "Hello! Describe the changes you would like to make to this animation. You can adjust timing, colors, or motion."
  },
  "⚠️ API Key tidak valid. Masukkan minimal 10 karakter.": {
    "id": "API Key tidak valid. Masukkan minimal 10 karakter.",
    "en": "The API key is not valid. Enter at least 10 characters."
  },
  "✓ API Key berhasil disimpan!": {
    "id": "✓ API Key berhasil disimpan!",
    "en": "API key saved."
  },
  "Format tidak didukung. Harap gunakan Gambar (PNG, JPG, WebP, SVG), GIF, atau Video Pendek (MP4, WebM).": {
    "id": "Format tidak didukung. Harap gunakan Gambar (PNG, JPG, WebP, SVG), GIF, atau Video Pendek (MP4, WebM).",
    "en": "Unsupported format. Use an image (PNG, JPG, WebP, SVG), GIF, or short video (MP4, WebM)."
  },
  "Ukuran file referensi terlalu besar (maksimal 25MB untuk reverse-engineering AI).": {
    "id": "Ukuran file referensi terlalu besar (maksimal 25MB untuk reverse-engineering AI).",
    "en": "The reference file exceeds the 25 MB limit."
  },
  "Gagal membaca file referensi.": {
    "id": "Gagal membaca file referensi.",
    "en": "Could not read the reference file."
  },
  "Silakan masukkan Gemini API Key terlebih dahulu pada menu di atas.": {
    "id": "Silakan masukkan Gemini API Key terlebih dahulu pada menu di atas.",
    "en": "Enter your Gemini API key in the settings above first."
  },
  "Silakan tulis konsep / prompt video yang diinginkan.": {
    "id": "Silakan tulis konsep / prompt video yang diinginkan.",
    "en": "Describe the animation you would like to create first."
  },
  "Planning": {
    "id": "Merencanakan",
    "en": "Planning"
  },
  "Quality Mode Beta: planning and building with Gemini...": {
    "id": "Kualitas Tinggi Beta: merencanakan dan membuat animasi dengan Gemini...",
    "en": "Quality Mode Beta: planning and building with Gemini..."
  },
  "Gemini sedang merancang kode animasi motion graphics...": {
    "id": "Gemini sedang merancang kode animasi motion graphics...",
    "en": "Gemini is building the animation code..."
  },
  "Building Animation": {
    "id": "Membuat Animasi",
    "en": "Building Animation"
  },
  "Ready": {
    "id": "Siap",
    "en": "Ready"
  },
  "⚠️ Gemini API Key belum diatur. Silakan isi di panel kiri sebelum merevisi.": {
    "id": "Gemini API Key belum diatur. Silakan isi di panel kiri sebelum merevisi.",
    "en": "Set your Gemini API key before requesting an edit."
  },
  "Kesalahan jaringan / API": {
    "id": "Kesalahan jaringan / API",
    "en": "Connection or API error"
  },
  "Terjadi kesalahan saat menyimpan kode TSX": {
    "id": "Terjadi kesalahan saat menyimpan kode TSX",
    "en": "Could not save the TSX code"
  },
  "MOV ProRes 4444 (Alpha Transparan)": {
    "id": "MOV ProRes 4444 (Alpha Transparan)",
    "en": "MOV ProRes 4444 (Transparent Alpha)"
  },
  "MOV ProRes 4444 (Solid / Latar Penuh)": {
    "id": "MOV ProRes 4444 (Solid / Latar Penuh)",
    "en": "MOV ProRes 4444 (Solid Background)"
  },
  "MP4 (H.264 - Standar)": {
    "id": "MP4 (H.264 - Standar)",
    "en": "MP4 (H.264)"
  },
  "Terjadi kesalahan sistem saat rendering": {
    "id": "Terjadi kesalahan sistem saat rendering",
    "en": "An error occurred while rendering"
  },
  "✅ File VibeGraphic.tsx berhasil dipulihkan ke versi stabil sebelumnya!": {
    "id": "File VibeGraphic.tsx berhasil dipulihkan ke versi stabil sebelumnya!",
    "en": "The previous working animation was restored."
  },
  "Gagal memulihkan kode.": {
    "id": "Gagal memulihkan kode.",
    "en": "Could not restore the code."
  },
  "⚠️ Masukkan Gemini API Key terlebih dahulu untuk menjalankan Auto-Fix.": {
    "id": "Masukkan Gemini API Key terlebih dahulu untuk menjalankan Auto-Fix.",
    "en": "Enter your Gemini API key before using Auto-Fix."
  },
  "🔍 Memverifikasi render engine Remotion...": {
    "id": "Memverifikasi render engine Remotion...",
    "en": "Checking the Remotion render engine..."
  },
  "⚡ Auto-Fix Berhasil! Kode terverifikasi aman dan kanvas dimuat ulang.": {
    "id": "Auto-Fix Berhasil! Kode terverifikasi aman dan kanvas dimuat ulang.",
    "en": "Auto-Fix completed. The code passed verification and the preview was reloaded."
  },
  "🔄 Percobaan 1 belum lolos render. Menjalankan auto-refine dengan error engine...": {
    "id": "Percobaan 1 belum lolos render. Menjalankan auto-refine dengan error engine...",
    "en": "The first attempt did not pass rendering. Refining using the engine diagnostic..."
  },
  "⚠️ Auto-Fix belum berhasil memperbaiki error ini secara otomatis. Silakan gunakan tombol 'Kembalikan ke Versi Sebelumnya' atau generate ulang.": {
    "id": "Auto-Fix belum berhasil memperbaiki error ini secara otomatis. Silakan gunakan tombol 'Kembalikan ke Versi Sebelumnya' atau generate ulang.",
    "en": "Auto-Fix could not resolve this error. Restore the previous version or review the diagnostic."
  },
  "Terjadi kesalahan saat menjalankan Auto-Fix.": {
    "id": "Terjadi kesalahan saat menjalankan Auto-Fix.",
    "en": "An error occurred during Auto-Fix."
  },
  "Studio Preview": {
    "id": "Studio Preview",
    "en": "Preview Studio"
  },
  "Code Inspector": {
    "id": "Pemeriksa Kode",
    "en": "Code Inspector"
  },
  "Buka jendela pembaruan": {
    "id": "Buka jendela pembaruan",
    "en": "Open the update dialog"
  },
  "Update v": {
    "id": "Update v",
    "en": "Update v"
  },
  "Motion Engine Ready": {
    "id": "Mesin animasi siap",
    "en": "Motion engine ready"
  },
  "Inisialisasi Engine...": {
    "id": "Inisialisasi Engine...",
    "en": "Initializing the motion engine..."
  },
  "Jenis Animasi": {
    "id": "Jenis Animasi",
    "en": "Animation Type"
  },
  "Animasi 3D belum tersedia.": {
    "id": "Animasi 3D belum tersedia.",
    "en": "3D animation is not available yet."
  },
  "Code Inspector (TSX Live Editor)": {
    "id": "Pemeriksa Kode — Editor TSX",
    "en": "Code Inspector — TSX Editor"
  },
  "BYOC • Live Engine": {
    "id": "Satu file TSX · Preview langsung",
    "en": "Single-file TSX · Live preview"
  },
  "Editor TSX mandiri untuk menulis atau memodifikasi kode animasi secara leluasa. Kompilasi langsung memperbarui canvas visual secara instan.": {
    "id": "Tempel atau edit satu file animasi TSX lengkap. Terapkan untuk memeriksa kode dan memperbarui preview.",
    "en": "Paste or edit a complete TSX animation. Apply it to validate the code and update the preview."
  },
  "Salin Panduan Master Prompt ke clipboard": {
    "id": "Salin Panduan Master Prompt ke clipboard",
    "en": "Copy the Master Prompt to the clipboard"
  },
  "✅ Disalin!": {
    "id": "Disalin!",
    "en": "Copied!"
  },
  "🤖 Salin Master Prompt AI": {
    "id": "Salin Master Prompt",
    "en": "Copy Master Prompt"
  },
  "Kembalikan ke template awal": {
    "id": "Kembalikan ke template awal",
    "en": "Reset to the starter template"
  },
  "🔄 Reset Template": {
    "id": "Reset Template",
    "en": "Reset Template"
  },
  "Mengompilasi...": {
    "id": "Memeriksa dan menerapkan...",
    "en": "Validating and applying..."
  },
  "Render & Buka Preview": {
    "id": "Terapkan & Lihat Hasil",
    "en": "Apply & View Result"
  },
  "Paste kode TSX dari ChatGPT / Claude atau ketik kode animasi di sini...": {
    "id": "Paste kode TSX dari ChatGPT / Claude atau ketik kode animasi di sini...",
    "en": "Paste TSX from your external AI, or edit animation code here..."
  },
  ") •": {
    "id": ") •",
    "en": ") •"
  },
  "s •": {
    "id": "s •",
    "en": "s •"
  },
  "FPS": {
    "id": "FPS",
    "en": "FPS"
  },
  "🎬 Lihat di Live Preview ➔": {
    "id": "Lihat di Studio Preview",
    "en": "View in Preview Studio"
  },
  "Status Lisensi": {
    "id": "Status Lisensi",
    "en": "License"
  },
  "Aktif - Lifetime": {
    "id": "Aktif — Lifetime",
    "en": "Active — Lifetime"
  },
  "Lisensi Expired": {
    "id": "Lisensi kedaluwarsa",
    "en": "License expired"
  },
  "Belum Divalidasi": {
    "id": "Belum diaktifkan",
    "en": "Not activated"
  },
  "Tempel kunci lisensi digital di sini...": {
    "id": "Tempel kunci lisensi digital di sini...",
    "en": "Paste your digital license key here..."
  },
  "Validasi": {
    "id": "Validasi",
    "en": "Validate"
  },
  "Machine ID:": {
    "id": "Machine ID:",
    "en": "Machine ID:"
  },
  "Klik untuk menyalin Machine ID": {
    "id": "Klik untuk menyalin Machine ID",
    "en": "Click to copy the Machine ID"
  },
  "Machine ID disalin!": {
    "id": "Machine ID disalin!",
    "en": "Machine ID copied."
  },
  "Gemini API Key": {
    "id": "Gemini API Key",
    "en": "Gemini API Key"
  },
  "🔑 Dapatkan API Key Gratis ↗": {
    "id": "Dapatkan API Key ↗",
    "en": "Get an API Key ↗"
  },
  "✓ Tersimpan": {
    "id": "Tersimpan",
    "en": "Saved"
  },
  "⚠️ Belum Diatur": {
    "id": "Belum diatur",
    "en": "Not set"
  },
  "Mendukung Google Gemini API Key resmi dari Google AI Studio (Model: Gemini 3.6 / 3.7 Flash & Multi-Model Fallback).": {
    "id": "Gunakan API key Google AI Studio Anda. Ketersediaan model, batas penggunaan, dan biaya mengikuti ketentuan Google.",
    "en": "Use your Google AI Studio API key. Model availability, usage limits, and charges depend on Google."
  },
  "Masukkan API Key (AIza... atau AQ...)": {
    "id": "Masukkan API Key (AIza... atau AQ...)",
    "en": "Enter your Gemini API key..."
  },
  "Simpan": {
    "id": "Simpan",
    "en": "Save"
  },
  "AI Motion Engine": {
    "id": "Mesin Animasi AI",
    "en": "AI Motion Engine"
  },
  "Gemini Flash": {
    "id": "Model dipilih otomatis",
    "en": "Automatic model routing"
  },
  "Ketik konsep animasi... (misal: 'HUD Countdown futuristik dengan neon cyan, glitch partikel, dan hitung mundur 5 detik')": {
    "id": "Jelaskan subjek, gerakan, warna, dan batasan yang Anda inginkan...",
    "en": "Describe your subject, motion, colors, and any constraints..."
  },
  "Reference": {
    "id": "Referensi",
    "en": "Reference"
  },
  "✓ Video Referensi Aktif": {
    "id": "Referensi video siap",
    "en": "Video reference ready"
  },
  "✓ GIF Referensi Aktif": {
    "id": "Referensi GIF siap",
    "en": "GIF reference ready"
  },
  "✓ Referensi Aktif": {
    "id": "Referensi siap",
    "en": "Reference ready"
  },
  "Hapus referensi": {
    "id": "Hapus referensi",
    "en": "Remove reference"
  },
  "Drop Gambar, GIF, atau Video Pendek (MP4) Referensi": {
    "id": "Drop Gambar, GIF, atau Video Pendek (MP4) Referensi",
    "en": "Drop a reference image, GIF, or short video (MP4)"
  },
  "atau klik di sini": {
    "id": "atau klik di sini",
    "en": "or click here"
  },
  "(AI Video-to-Code Cloner mereverse-engineer ritme gerakan &amp; tata visual)": {
    "id": "Referensi membantu AI memahami gerakan dan komposisi.",
    "en": "The reference helps the AI understand motion and composition."
  },
  "Generation mode": {
    "id": "Mode Pembuatan",
    "en": "Generation Mode"
  },
  "Fast": {
    "id": "Cepat",
    "en": "Fast"
  },
  "Quality Mode (Beta)": {
    "id": "Kualitas Tinggi (Beta)",
    "en": "High Quality (Beta)"
  },
  "Additional AI planning, then animation code. More time and API usage; request budget up to 180 seconds.": {
    "id": "Menambahkan perencanaan sebelum membuat animasi. Memerlukan waktu dan penggunaan API lebih banyak; batas total permintaan AI 180 detik.",
    "en": "Adds creative planning before building the animation. Requires more time and API usage; AI requests have a total 180-second limit."
  },
  "Precision SVG Strokes (Beta)": {
    "id": "Garis SVG Presisi (Beta)",
    "en": "Precision SVG Strokes (Beta)"
  },
  "Optional path drawing for suitable icons and outlines. No additional AI stage.": {
    "id": "Opsional untuk menggambar garis ikon dan outline yang sesuai. Tanpa tahap AI tambahan.",
    "en": "Optional stroke drawing for suitable icons and outlines. No additional AI stage."
  },
  "Gunakan palet saat ini untuk Generate ini": {
    "id": "Gunakan palet saat ini untuk Generate ini",
    "en": "Use the current palette for this generation"
  },
  "Jika tidak dicentang, gunakan default warna dari kode baru. Warna yang tidak didefinisikan tetap dipertahankan; warna dapat diedit setelah Generate.": {
    "id": "Jika tidak dicentang, gunakan default warna dari kode baru. Warna yang tidak didefinisikan tetap dipertahankan; warna dapat diedit setelah Generate.",
    "en": "When off, use colors defined by the new code. Undefined colors keep their current values. You can edit colors after generation."
  },
  "Diagnostik teknis": {
    "id": "Diagnostik teknis",
    "en": "Technical diagnostics"
  },
  "Reuse current title, subtitle and badge in the next generation": {
    "id": "Gunakan judul, subjudul, dan label saat ini",
    "en": "Reuse current title, subtitle, and badge"
  },
  "Stopping...": {
    "id": "Menghentikan...",
    "en": "Stopping..."
  },
  "Stop": {
    "id": "Hentikan",
    "en": "Stop"
  },
  "Gemini sedang merancang animasi...": {
    "id": "Gemini sedang merancang animasi...",
    "en": "Gemini is planning the animation..."
  },
  "Generate Motion Asset": {
    "id": "Buat Animasi",
    "en": "Generate Animation"
  },
  "Video Dimensions & Framerate": {
    "id": "Pengaturan Video",
    "en": "Video Settings"
  },
  "Aspect Ratio": {
    "id": "Rasio Layar",
    "en": "Aspect Ratio"
  },
  "Landscape": {
    "id": "Mendatar",
    "en": "Landscape"
  },
  "16:9 (Standard)": {
    "id": "16:9 (Mendatar)",
    "en": "16:9 (Landscape)"
  },
  "Vertical": {
    "id": "Tegak",
    "en": "Portrait"
  },
  "9:16 (Reels/Shorts)": {
    "id": "9:16 (Tegak)",
    "en": "9:16 (Portrait)"
  },
  "Resolution Quality": {
    "id": "Resolusi",
    "en": "Resolution"
  },
  "1080p Full HD (1920×1080)": {
    "id": "1080p Full HD (1920×1080)",
    "en": "1080p Full HD (1920×1080)"
  },
  "2K QHD (2560×1440)": {
    "id": "2K QHD (2560×1440)",
    "en": "2K QHD (2560×1440)"
  },
  "4K Ultra HD (3840×2160)": {
    "id": "4K Ultra HD (3840×2160)",
    "en": "4K Ultra HD (3840×2160)"
  },
  "1080p Full HD (1080×1920)": {
    "id": "1080p Full HD (1080×1920)",
    "en": "1080p Full HD (1080×1920)"
  },
  "4K Ultra HD (2160×3840)": {
    "id": "4K Ultra HD (2160×3840)",
    "en": "4K Ultra HD (2160×3840)"
  },
  "Duration": {
    "id": "Durasi",
    "en": "Duration"
  },
  "5 Detik (": {
    "id": "5 detik (",
    "en": "5 seconds ("
  },
  "f)": {
    "id": "f)",
    "en": "f)"
  },
  "10 Detik (": {
    "id": "10 detik (",
    "en": "10 seconds ("
  },
  "15 Detik (": {
    "id": "15 detik (",
    "en": "15 seconds ("
  },
  "20 Detik (": {
    "id": "20 detik (",
    "en": "20 seconds ("
  },
  "Frame Rate (FPS)": {
    "id": "Frame Rate (FPS)",
    "en": "Frame Rate (FPS)"
  },
  "24 FPS (Cinematic)": {
    "id": "24 FPS (Film)",
    "en": "24 FPS (Film)"
  },
  "30 FPS (Standard Web)": {
    "id": "30 FPS (Standar)",
    "en": "30 FPS (Standard)"
  },
  "60 FPS (Ultra Smooth)": {
    "id": "60 FPS (Halus)",
    "en": "60 FPS (Smooth)"
  },
  "Motion Canvas — Live Preview": {
    "id": "Preview Animasi",
    "en": "Animation Preview"
  },
  "Buka / tutup panel kontrol parameter visual & transformasi (Visual Tweaker)": {
    "id": "Buka / tutup panel kontrol parameter visual & transformasi (Visual Tweaker)",
    "en": "Open or close visual and motion controls"
  },
  "🎛️ Visual Tweaker": {
    "id": "Pengaturan Visual",
    "en": "Visual Controls"
  },
  "Muat ulang kanvas preview": {
    "id": "Muat ulang kanvas preview",
    "en": "Reload the preview"
  },
  "Sync Canvas": {
    "id": "Muat Ulang Preview",
    "en": "Reload Preview"
  },
  "Buka preview video dalam layar penuh": {
    "id": "Buka preview video dalam layar penuh",
    "en": "Open full-screen preview"
  },
  "Cinema Mode": {
    "id": "Layar Penuh",
    "en": "Full Screen"
  },
  "Runtime Error Terdeteksi:": {
    "id": "Runtime Error Terdeteksi:",
    "en": "Animation runtime error:"
  },
  "Analisis dan perbaiki error ini menggunakan AI": {
    "id": "Analisis dan perbaiki error ini menggunakan AI",
    "en": "Analyze and repair this error using AI"
  },
  "Memperbaiki...": {
    "id": "Memperbaiki...",
    "en": "Repairing..."
  },
  "⚡ Auto-Fix Sekarang": {
    "id": "Jalankan Auto-Fix",
    "en": "Run Auto-Fix"
  },
  "Tutup notifikasi error": {
    "id": "Tutup notifikasi error",
    "en": "Dismiss the error notification"
  },
  "0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(0, 242, 254, 0.12)": {
    "id": "0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(0, 242, 254, 0.12)",
    "en": "0 25px 60px -15px rgba(0,0,0,0.8), 0 0 30px rgba(0, 242, 254, 0.12)"
  },
  "0 20px 50px -15px rgba(0,0,0,0.7)": {
    "id": "0 20px 50px -15px rgba(0,0,0,0.7)",
    "en": "0 20px 50px -15px rgba(0,0,0,0.7)"
  },
  "Menginisialisasi Motion Engine...": {
    "id": "Menginisialisasi Motion Engine...",
    "en": "Initializing the motion engine..."
  },
  "Menyiapkan lingkungan render dan komputasi visual di latar belakang": {
    "id": "Menyiapkan lingkungan render dan komputasi visual di latar belakang",
    "en": "Preparing the preview and render environment"
  },
  "MOTION ENGINE READY": {
    "id": "MESIN ANIMASI SIAP",
    "en": "MOTION ENGINE READY"
  },
  "Motion Canvas Siap": {
    "id": "Motion Canvas Siap",
    "en": "Preview ready"
  },
  "Masukkan instruksi di panel kiri untuk merancang aset motion.": {
    "id": "Masukkan instruksi di panel kiri untuk merancang aset motion.",
    "en": "Describe your animation in the panel on the left."
  },
  "Buka kanvas preview langsung": {
    "id": "Buka kanvas preview langsung",
    "en": "Open the live preview"
  },
  "🎬 Buka Kanvas Langsung": {
    "id": "Buka Preview",
    "en": "Open Preview"
  },
  "Rendering sedang berjalan...": {
    "id": "Rendering sedang berjalan...",
    "en": "Rendering in progress..."
  },
  "Buka asisten chat AI untuk merevisi video ini secara realtime": {
    "id": "Buka asisten chat AI untuk merevisi video ini secara realtime",
    "en": "Open the AI assistant to revise this animation"
  },
  "Edit Video dengan AI": {
    "id": "Edit Video dengan AI",
    "en": "Edit with AI"
  },
  "Realtime Chat": {
    "id": "Asisten AI",
    "en": "AI Assistant"
  },
  "Perbaiki error runtime secara otomatis dengan Gemini AI": {
    "id": "Minta AI memperbaiki error preview",
    "en": "Request an AI repair for the preview error"
  },
  "Memperbaiki Error...": {
    "id": "Memperbaiki Error...",
    "en": "Repairing error..."
  },
  "Auto-Fix Error": {
    "id": "Perbaiki Error dengan AI",
    "en": "Auto-Fix Error"
  },
  "Kembalikan file VibeGraphic.tsx ke versi kode terakhir yang aman dan stabil": {
    "id": "Kembalikan file VibeGraphic.tsx ke versi kode terakhir yang aman dan stabil",
    "en": "Restore the last working animation code"
  },
  "Belum ada versi kode sebelumnya untuk di-rollback": {
    "id": "Belum ada versi kode sebelumnya untuk di-rollback",
    "en": "No previous working version is available"
  },
  "Kembalikan ke Versi Sebelumnya": {
    "id": "Kembalikan ke Versi Sebelumnya",
    "en": "Restore Previous Version"
  },
  "Pilih format render video": {
    "id": "Pilih format render video",
    "en": "Select a video format"
  },
  "MOV (Apple ProRes 4444 - Kualitas Terbaik)": {
    "id": "MOV (Apple ProRes 4444 - Kualitas Terbaik)",
    "en": "MOV (Apple ProRes 4444)"
  },
  "Format MP4 tidak mendukung Alpha Channel. Ubah ke format MOV (ProRes 4444) untuk mengaktifkan video transparan.": {
    "id": "Format MP4 tidak mendukung Alpha Channel. Ubah ke format MOV (ProRes 4444) untuk mengaktifkan video transparan.",
    "en": "MP4 does not support alpha transparency. Select MOV (ProRes 4444) for transparent video."
  },
  "Pilih mode latar belakang: Solid atau Transparan (Alpha Channel)": {
    "id": "Pilih mode latar belakang: Solid atau Transparan (Alpha Channel)",
    "en": "Select a solid or transparent background"
  },
  "⬛ Solid / Latar Penuh": {
    "id": "Latar Solid",
    "en": "Solid Background"
  },
  "✨ Transparan (Khusus MOV)": {
    "id": "Transparan (Khusus MOV)",
    "en": "Transparent (MOV Only)"
  },
  "✨ Transparan (Alpha Channel)": {
    "id": "Transparan (Alpha Channel)",
    "en": "Transparent (Alpha Channel)"
  },
  "Pilih mode render hardware (Auto / GPU Hardware Acceleration / CPU SwiftShader)": {
    "id": "Pilih mode render hardware (Auto / GPU Hardware Acceleration / CPU SwiftShader)",
    "en": "Select Auto, GPU acceleration, or CPU rendering"
  },
  "⚡ Mode: Auto": {
    "id": "Mode: Otomatis",
    "en": "Mode: Auto"
  },
  "🚀 Mode: GPU (Akselerasi)": {
    "id": "Mode: GPU",
    "en": "Mode: GPU"
  },
  "💻 Mode: CPU (SwiftShader)": {
    "id": "Mode: CPU (SwiftShader)",
    "en": "Mode: CPU (SwiftShader)"
  },
  "Buka Folder Ekspor di File Explorer (Downloads/Motion Studio Exports)": {
    "id": "Buka Folder Ekspor di File Explorer (Downloads/Motion Studio Exports)",
    "en": "Open the export folder"
  },
  "Folder Ekspor: Downloads/Motion Studio Exports": {
    "id": "Folder Ekspor: Downloads/Motion Studio Exports",
    "en": "Export folder: Downloads/Motion Studio Exports"
  },
  "Folder Ekspor": {
    "id": "Folder Ekspor",
    "en": "Export Folder"
  },
  "Ganti folder tujuan ekspor video": {
    "id": "Ganti folder tujuan ekspor video",
    "en": "Change the export folder"
  },
  "Ganti": {
    "id": "Ganti",
    "en": "Change"
  },
  "Batalkan proses rendering": {
    "id": "Batalkan proses rendering",
    "en": "Cancel rendering"
  },
  "✕ Batal": {
    "id": "Batal",
    "en": "Cancel"
  },
  "Render video fisik beresolusi tinggi": {
    "id": "Render video fisik beresolusi tinggi",
    "en": "Export the animation to a video file"
  },
  "Ekspor / Render Video": {
    "id": "Ekspor Video",
    "en": "Export Video"
  },
  "Render berhasil disimpan!": {
    "id": "Render berhasil disimpan!",
    "en": "Video saved."
  },
  "Render Gagal": {
    "id": "Render Gagal",
    "en": "Export failed"
  },
  "Buka folder video di File Explorer": {
    "id": "Buka folder video di File Explorer",
    "en": "Open the video folder"
  },
  "📂 Buka Folder": {
    "id": "Buka Folder",
    "en": "Open Folder"
  },
  "Tutup pemberitahuan": {
    "id": "Tutup pemberitahuan",
    "en": "Dismiss notification"
  },
  "Title:": {
    "id": "Judul:",
    "en": "Title:"
  },
  "Specs:": {
    "id": "Video:",
    "en": "Video:"
  },
  "Format:": {
    "id": "Format:",
    "en": "Format:"
  },
  "MOV (ProRes 4444 Alpha)": {
    "id": "MOV (ProRes 4444 Alpha)",
    "en": "MOV (ProRes 4444 Alpha)"
  },
  "MOV (ProRes 4444 Solid)": {
    "id": "MOV (ProRes 4444 Solid)",
    "en": "MOV (ProRes 4444 Solid)"
  },
  "MP4 (H.264)": {
    "id": "MP4 (H.264)",
    "en": "MP4 (H.264)"
  },
  "Accent:": {
    "id": "Aksen:",
    "en": "Accent:"
  },
  "Background:": {
    "id": "Latar:",
    "en": "Background:"
  },
  "Alpha / Transparan": {
    "id": "Alpha / Transparan",
    "en": "Alpha / Transparent"
  },
  ".0s /": {
    "id": ".0s /",
    "en": ".0s /"
  },
  "frames (": {
    "id": "frame (",
    "en": "frames ("
  },
  "FPS)": {
    "id": "FPS)",
    "en": "FPS)"
  },
  "AI Motion Director": {
    "id": "Asisten Animasi AI",
    "en": "AI Animation Assistant"
  },
  "Beri instruksi revisi pada aset motion yang sedang aktif": {
    "id": "Beri instruksi revisi pada aset motion yang sedang aktif",
    "en": "Describe changes to the current animation"
  },
  "Tutup dialog chat": {
    "id": "Tutup dialog chat",
    "en": "Close the AI assistant"
  },
  "Tersalin ke clipboard!": {
    "id": "Tersalin ke clipboard!",
    "en": "Copied to clipboard."
  },
  "Salin isi pesan": {
    "id": "Salin isi pesan",
    "en": "Copy message"
  },
  "Tersalin!": {
    "id": "Tersalin!",
    "en": "Copied."
  },
  "Salin": {
    "id": "Salin",
    "en": "Copy"
  },
  "Gemini sedang merevisi kode VibeGraphic.tsx...": {
    "id": "Gemini sedang merevisi kode VibeGraphic.tsx...",
    "en": "Gemini is revising the animation code..."
  },
  "Saran Cepat:": {
    "id": "Saran Cepat:",
    "en": "Suggestions:"
  },
  "Percepat Tempo (1.5x)": {
    "id": "Percepat Tempo (1.5x)",
    "en": "Increase Speed (1.5×)"
  },
  "Ganti Aksen Warna": {
    "id": "Ganti Aksen Warna",
    "en": "Change Accent Color"
  },
  "Tambah Efek Partikel/Orbit": {
    "id": "Tambah Efek Partikel/Orbit",
    "en": "Add Particles / Orbit"
  },
  "Ketik instruksi revisi (misal: 'Buat judul berkedip halus dan aksen warna emas')...": {
    "id": "Ketik instruksi revisi (misal: 'Buat judul berkedip halus dan aksen warna emas')...",
    "en": "Describe the changes you want to make..."
  },
  "Kirim": {
    "id": "Kirim",
    "en": "Send"
  },
  "Visual Recovery — Pemulihan Kanvas Blank": {
    "id": "Visual Recovery — Pemulihan Kanvas Blank",
    "en": "Visual Recovery — Blank Preview"
  },
  "Auto-Fix Error AI (Self-Healing)": {
    "id": "Auto-Fix Error AI (Self-Healing)",
    "en": "AI Auto-Fix"
  },
  "Pemulihan visual layar gelap, opacity frame 0 & sinkronisasi viewport": {
    "id": "Pemulihan visual layar gelap, opacity frame 0 & sinkronisasi viewport",
    "en": "Review blank previews, first-frame visibility, and layout"
  },
  "Analisis runtime error & perbaiki kode TSX secara otomatis": {
    "id": "Analisis runtime error & perbaiki kode TSX secara otomatis",
    "en": "Analyze the runtime error and request a TSX correction"
  },
  "Tutup dialog auto-fix": {
    "id": "Tutup dialog auto-fix",
    "en": "Close Auto-Fix"
  },
  "Runtime Error Terdeteksi Otomatis:": {
    "id": "Runtime Error Terdeteksi Otomatis:",
    "en": "Preview runtime error:"
  },
  "Pesan error di atas ditangkap otomatis dari engine preview. Klik tombol di bawah untuk perbaikan 1-klik dengan AI.": {
    "id": "Pesan error di atas ditangkap otomatis dari engine preview. Klik tombol di bawah untuk perbaikan 1-klik dengan AI.",
    "en": "The preview engine reported this error. The button below requests an AI repair."
  },
  "Tampilan Kanvas Gelap / Blank Terdeteksi": {
    "id": "Tampilan Kanvas Gelap / Blank Terdeteksi",
    "en": "Blank preview reported"
  },
  "Tidak ada runtime crash teknis pada preview. Mode": {
    "id": "Tidak ada runtime crash teknis pada preview. Mode",
    "en": "The preview has not reported a runtime crash. Mode"
  },
  "Visual Recovery": {
    "id": "Pemulihan Visual",
    "en": "Visual Recovery"
  },
  "akan memeriksa dan memperbaiki penyebab umum layar kosong:": {
    "id": "akan memeriksa dan memperbaiki penyebab umum layar kosong:",
    "en": "checks common causes of blank previews:"
  },
  "✓ Memastikan": {
    "id": "Periksa",
    "en": "Check"
  },
  "opacity elemen pada Frame 0": {
    "id": "opacity elemen pada Frame 0",
    "en": "first-frame opacity"
  },
  "minimal 0.95 (tidak tertahan di 0/NaN).": {
    "id": "minimal 0.95 (tidak tertahan di 0/NaN).",
    "en": "and invalid values."
  },
  "✓ Mengoreksi koordinat agar semua elemen berada di dalam": {
    "id": "✓ Mengoreksi koordinat agar semua elemen berada di dalam",
    "en": "Check object positions within the"
  },
  "viewport kanvas aktif": {
    "id": "viewport kanvas aktif",
    "en": "composition bounds"
  },
  "✓ Memastikan warna teks & badge": {
    "id": "✓ Memastikan warna teks & badge",
    "en": "Check text and badge"
  },
  "kontras tajam": {
    "id": "kontras tajam",
    "en": "contrast"
  },
  "dengan background solid pada &lt;AbsoluteFill&gt;.": {
    "id": "dengan background solid pada <AbsoluteFill>.",
    "en": "against the root background."
  },
  "✓ Menggunakan": {
    "id": "Gunakan",
    "en": "Use"
  },
  "useVideoConfig()": {
    "id": "useVideoConfig()",
    "en": "useVideoConfig()"
  },
  "untuk tata letak dinamis sesuai resolusi aktif.": {
    "id": "untuk tata letak dinamis sesuai resolusi aktif.",
    "en": "for resolution-aware layout."
  },
  "Detik (": {
    "id": "detik (",
    "en": "seconds ("
  },
  "frames)": {
    "id": "frame)",
    "en": "frames)"
  },
  "▼ Sembunyikan Input Manual": {
    "id": "▼ Sembunyikan Input Manual",
    "en": "Hide Manual Input"
  },
  "▶ Tambah Catatan / Sesuaikan Pesan Manual (Opsional)": {
    "id": "Tambah Catatan / Sesuaikan Pesan Manual (Opsional)",
    "en": "Add a Note / Edit the Diagnostic (Optional)"
  },
  "Ketik atau edit catatan error/instruksi tambahan untuk AI di sini...": {
    "id": "Ketik atau edit catatan error/instruksi tambahan untuk AI di sini...",
    "en": "Add or edit a diagnostic note for the AI..."
  },
  "Pilihan Error Umum (Klik Cepat):": {
    "id": "Pilihan Error Umum (Klik Cepat):",
    "en": "Common Errors:"
  },
  "⚠️ interpolate() inputRange": {
    "id": "interpolate() inputRange",
    "en": "interpolate() inputRange"
  },
  "⚠️ Range length mismatch": {
    "id": "Panjang range tidak sesuai",
    "en": "Range length mismatch"
  },
  "🎨 Blank Screen Frame 0": {
    "id": "Frame Awal Kosong",
    "en": "Blank First Frame"
  },
  "Batal": {
    "id": "Batal",
    "en": "Cancel"
  },
  "Memulihkan Visual...": {
    "id": "Memulihkan Visual...",
    "en": "Recovering preview..."
  },
  "Perbaiki Tampilan Blank / Reset Visual": {
    "id": "Perbaiki Tampilan Blank / Reset Visual",
    "en": "Repair Blank Preview"
  },
  "Perbaiki Error Ini (1-Klik AI)": {
    "id": "Perbaiki Error Ini (1-Klik AI)",
    "en": "Request AI Repair"
  },
  "Akses Ditolak: Fitur Terkunci": {
    "id": "Akses Ditolak: Fitur Terkunci",
    "en": "This Feature Requires a License"
  },
  "Akses Ditolak: Fitur ini terkunci. Masukkan nomor lisensi Motion Suite Pro yang valid untuk menggunakan generator AI dan render video.": {
    "id": "Akses Ditolak: Fitur ini terkunci. Masukkan nomor lisensi Motion Suite Pro yang valid untuk menggunakan generator AI dan render video.",
    "en": "A valid Motion Suite Pro license is required to use AI generation and video export."
  },
  "Hardware Machine ID Perangkat Anda:": {
    "id": "Hardware Machine ID Perangkat Anda:",
    "en": "Your Device Machine ID:"
  },
  "Machine ID disalin ke clipboard!": {
    "id": "Machine ID disalin ke clipboard!",
    "en": "Machine ID copied to clipboard."
  },
  "Berikan kode Machine ID di atas kepada admin/penjual untuk mendapatkan kunci lisensi Anda.": {
    "id": "Berikan kode Machine ID di atas kepada admin/penjual untuk mendapatkan kunci lisensi Anda.",
    "en": "Send this Machine ID to the seller to obtain your license key."
  },
  "Saya Mengerti (Masukkan Lisensi di Panel Kiri)": {
    "id": "Saya Mengerti (Masukkan Lisensi di Panel Kiri)",
    "en": "Enter a License in the Settings Panel"
  },
  "Layar Penuh Preview —": {
    "id": "Layar Penuh Preview —",
    "en": "Full-Screen Preview —"
  },
  "Tekan": {
    "id": "Tekan",
    "en": "Press"
  },
  "Esc": {
    "id": "Esc",
    "en": "Esc"
  },
  "untuk keluar": {
    "id": "untuk keluar",
    "en": "to exit"
  },
  "Keluar dari Layar Penuh (Esc)": {
    "id": "Keluar dari Layar Penuh (Esc)",
    "en": "Exit Full Screen (Esc)"
  },
  "✕ Keluar Layar Penuh": {
    "id": "✕ Keluar Layar Penuh",
    "en": "Exit Full Screen"
  },
  "Studio Preview — Live Canvas": {
    "id": "Studio Preview — Kanvas Langsung",
    "en": "Studio Preview — Live Canvas"
  },
  "Pembaruan Tersedia": {
    "id": "Pembaruan Tersedia",
    "en": "Update Available"
  },
  "Motion Suite Pro": {
    "id": "Motion Suite Pro",
    "en": "Motion Suite Pro"
  },
  "Tutup (Nanti Saja)": {
    "id": "Tutup (Nanti Saja)",
    "en": "Close (Later)"
  },
  "Versi baru Motion Suite Pro v": {
    "id": "Versi baru Motion Suite Pro v",
    "en": "Motion Suite Pro version"
  },
  "telah tersedia. Pembaruan ini mencakup peningkatan engine rendering, pembaruan fitur visual, dan peningkatan stabilitas.": {
    "id": "telah tersedia. Pembaruan ini mencakup peningkatan engine rendering, pembaruan fitur visual, dan peningkatan stabilitas.",
    "en": "is available. Review the release notes below before updating."
  },
  "HIGHLIGHT FITUR PEMBARUAN v1.0.6:": {
    "id": "INFORMASI PEMBARUAN",
    "en": "UPDATE INFORMATION"
  },
  "Engine Prompt-to-Code v1.0.6:": {
    "id": "Mesin animasi:",
    "en": "Motion engine:"
  },
  "Vektor masif berdimensi &amp; layout split-stage 16:9.": {
    "id": "Lihat catatan rilis resmi untuk rinciannya.",
    "en": "Use the official release notes for details."
  },
  "Silent Dry-Run Verification:": {
    "id": "Pemeriksaan kode:",
    "en": "Code verification:"
  },
  "Pengujian render 1-frame di latar belakang sebelum konfirmasi.": {
    "id": "Kode diperiksa sebelum diterapkan.",
    "en": "Generated code is checked before it is applied."
  },
  "Auto-Fix Cerdas:": {
    "id": "Auto-Fix manual:",
    "en": "Manual Auto-Fix:"
  },
  "Perlindungan anti-crash NaN, pembagian nol, dan finite range check.": {
    "id": "Perbaikan AI berjalan hanya saat diminta.",
    "en": "AI repair runs only when requested."
  },
  "Multi-Style Adaptation:": {
    "id": "Kebebasan kreatif:",
    "en": "Creative flexibility:"
  },
  "Bebas gaya visual (Pop Art, Modern SaaS, Bold Sports, Editorial).": {
    "id": "Mengikuti brief dan teknik animasi yang didukung.",
    "en": "Follow your brief and supported animation techniques."
  },
  "Pemberitahuan Resmi macOS:": {
    "id": "Pemberitahuan Resmi macOS:",
    "en": "macOS manual updates:"
  },
  "Pembaruan versi 1.0.7 disediakan melalui Google Drive resmi Motion Suite Pro untuk instalasi manual yang aman dan stabil. File installer (.dmg) 100% bersih dan terverifikasi oleh pengembang.": {
    "id": "Pembaruan macOS tersedia sebagai DMG Intel dan Apple Silicon melalui tautan Google Drive resmi.",
    "en": "macOS updates are distributed as separate Intel and Apple Silicon DMG installers through the official Google Drive links."
  },
  "Catatan Rilis (Release Notes):": {
    "id": "Catatan Rilis (Release Notes):",
    "en": "Release Notes:"
  },
  "Memverifikasi paket instalasi...": {
    "id": "Memverifikasi paket instalasi...",
    "en": "Verifying the installer..."
  },
  "Mengunduh pembaruan di latar belakang...": {
    "id": "Mengunduh pembaruan di latar belakang...",
    "en": "Downloading the update..."
  },
  "Pembaruan Siap Dipasang!": {
    "id": "Pembaruan Siap Dipasang!",
    "en": "Ready to Install"
  },
  "Paket instalasi v": {
    "id": "Paket instalasi v",
    "en": "Installer version"
  },
  "telah selesai diunduh dan diverifikasi. Klik tombol di bawah untuk memasang dan me-restart aplikasi.": {
    "id": "telah selesai diunduh dan diverifikasi. Klik tombol di bawah untuk memasang dan me-restart aplikasi.",
    "en": "has been downloaded. Install it and restart the application using the button below."
  },
  "Nanti Saja": {
    "id": "Nanti Saja",
    "en": "Later"
  },
  "Unduh via Google Drive Resmi": {
    "id": "Unduh via Google Drive Resmi",
    "en": "Download from Official Google Drive"
  },
  "Update Sekarang": {
    "id": "Update Sekarang",
    "en": "Update Now"
  },
  "Sembunyikan (Unduh di Latar)": {
    "id": "Sembunyikan (Unduh di Latar)",
    "en": "Hide (Download in Background)"
  },
  "Coba Lagi": {
    "id": "Coba Lagi",
    "en": "Try Again"
  },
  "Mengunduh (": {
    "id": "Mengunduh (",
    "en": "Downloading ("
  },
  "Pasang &amp; Restart": {
    "id": "Pasang & Restart",
    "en": "Install & Restart"
  },
  "Tutup": {
    "id": "Tutup",
    "en": "Close"
  },
  "Manipulasi Jam Sistem Terdeteksi": {
    "id": "Manipulasi Jam Sistem Terdeteksi",
    "en": "System Clock Issue Detected"
  },
  "Anti-Clock Rollback Guard Active": {
    "id": "Perlindungan Jam Sistem",
    "en": "System Clock Protection"
  },
  "Solusi Mudah:": {
    "id": "Solusi Mudah:",
    "en": "Suggested action:"
  },
  "Klik tombol di bawah untuk menyinkronkan waktu dengan server internet (Google/Cloudflare). Jam sistem Anda akan terverifikasi dan akses fitur akan terbuka kembali seketika.": {
    "id": "Klik tombol di bawah untuk menyinkronkan waktu dengan server internet (Google/Cloudflare). Jam sistem Anda akan terverifikasi dan akses fitur akan terbuka kembali seketika.",
    "en": "Verify time using the internet services below. Access will be checked again after synchronization."
  },
  "Menyinkronkan Waktu Internet...": {
    "id": "Menyinkronkan Waktu Internet...",
    "en": "Synchronizing internet time..."
  },
  "Sinkronkan Waktu via Internet (1-Klik)": {
    "id": "Sinkronkan Waktu via Internet (1-Klik)",
    "en": "Synchronize Internet Time"
  },
  "Masa Berlaku Lisensi Telah Berakhir": {
    "id": "Masa Berlaku Lisensi Telah Berakhir",
    "en": "License Has Expired"
  },
  "Subscription Expired": {
    "id": "Langganan Berakhir",
    "en": "Subscription Expired"
  },
  "Klik untuk menyalin": {
    "id": "Klik untuk menyalin",
    "en": "Click to copy"
  },
  "Masukkan Kunci Lisensi Baru:": {
    "id": "Masukkan Kunci Lisensi Baru:",
    "en": "Enter a New License Key:"
  },
  "Tempel kunci lisensi baru di sini...": {
    "id": "Tempel kunci lisensi baru di sini...",
    "en": "Paste a new license key here..."
  },
  "Memvalidasi Lisensi...": {
    "id": "Memvalidasi Lisensi...",
    "en": "Validating license..."
  },
  "Aktifkan Lisensi Baru": {
    "id": "Aktifkan Lisensi Baru",
    "en": "Activate New License"
  },
  "Visual Tweaker Inspector": {
    "id": "Pengaturan visual",
    "en": "Visual controls"
  },
  "Visual Tweaker": {
    "id": "Pengaturan Visual",
    "en": "Visual Controls"
  },
  "Live Hot-Sync": {
    "id": "Preview Langsung",
    "en": "Live Preview"
  },
  "Batalkan pergeseran/perubahan terakhir (Undo ↶)": {
    "id": "Batalkan pergeseran/perubahan terakhir (Undo ↶)",
    "en": "Undo the last adjustment"
  },
  "↶ Undo": {
    "id": "Urungkan",
    "en": "Undo"
  },
  "Kembalikan semua parameter ke nilai asli template (↺ Revert)": {
    "id": "Kembalikan semua parameter ke nilai asli template (↺ Revert)",
    "en": "Restore the original animation parameters"
  },
  "↺ Kembalikan ke Asli": {
    "id": "Kembalikan Nilai Awal",
    "en": "Restore Original Values"
  },
  "Tutup Inspector (✕)": {
    "id": "Tutup Inspector (✕)",
    "en": "Close the controls"
  },
  "Tutup panel": {
    "id": "Tutup panel",
    "en": "Close panel"
  },
  "Semua": {
    "id": "Semua",
    "en": "All"
  },
  "Teks": {
    "id": "Teks",
    "en": "Text"
  },
  "Warna": {
    "id": "Warna",
    "en": "Colors"
  },
  "Transform": {
    "id": "Posisi & Skala",
    "en": "Position & Scale"
  },
  "Efek": {
    "id": "Efek",
    "en": "Effects"
  },
  "Konten Teks": {
    "id": "Konten Teks",
    "en": "Text Content"
  },
  "Judul Utama (titleText)": {
    "id": "Judul",
    "en": "Title"
  },
  "char": {
    "id": "karakter",
    "en": "characters"
  },
  "Masukkan judul utama...": {
    "id": "Masukkan judul utama...",
    "en": "Enter the title..."
  },
  "Sub-judul / Informasi Sekunder (subtitleText)": {
    "id": "Subjudul",
    "en": "Subtitle"
  },
  "Masukkan sub-judul atau info sekunder...": {
    "id": "Masukkan sub-judul atau info sekunder...",
    "en": "Enter the subtitle..."
  },
  "Label Atas / Kategori (badgeText)": {
    "id": "Label",
    "en": "Label"
  },
  "Masukkan label atas / badge...": {
    "id": "Masukkan label atas / badge...",
    "en": "Enter the label..."
  },
  "Warna & Latar Belakang": {
    "id": "Warna & Latar Belakang",
    "en": "Colors & Background"
  },
  "Warna Aksen": {
    "id": "Warna Aksen",
    "en": "Accent Color"
  },
  "Pilih warna aksen utama": {
    "id": "Pilih warna aksen utama",
    "en": "Choose the main accent color"
  },
  "Warna Sekunder": {
    "id": "Warna Sekunder",
    "en": "Secondary Color"
  },
  "Pilih warna aksen sekunder": {
    "id": "Pilih warna aksen sekunder",
    "en": "Choose the secondary color"
  },
  "Mode Latar Belakang": {
    "id": "Mode Latar Belakang",
    "en": "Background Mode"
  },
  "Alpha Channel": {
    "id": "Alpha Channel",
    "en": "Alpha Channel"
  },
  "Solid Background": {
    "id": "Latar Solid",
    "en": "Solid Background"
  },
  "⬛ Solid": {
    "id": "Solid",
    "en": "Solid"
  },
  "🏁 Alpha (Transparan)": {
    "id": "Alpha (Transparan)",
    "en": "Alpha (Transparent)"
  },
  "Warna Latar (Solid)": {
    "id": "Warna Latar (Solid)",
    "en": "Background Color"
  },
  "(Diabaikan di mode Alpha)": {
    "id": "(Diabaikan di mode Alpha)",
    "en": "(Ignored in alpha mode)"
  },
  "Latar saat ini transparan": {
    "id": "Latar saat ini transparan",
    "en": "The background is transparent"
  },
  "Pilih warna latar belakang": {
    "id": "Pilih warna latar belakang",
    "en": "Choose the background color"
  },
  "Transparent": {
    "id": "Transparan",
    "en": "Transparent"
  },
  "Transformasi Dinamis": {
    "id": "Transformasi Dinamis",
    "en": "Position & Scale"
  },
  "Posisi Sumbu X": {
    "id": "Posisi Sumbu X",
    "en": "Horizontal Position"
  },
  "px": {
    "id": "px",
    "en": "px"
  },
  "-500px": {
    "id": "-500px",
    "en": "-500px"
  },
  "0 (Tengah)": {
    "id": "0 (Tengah)",
    "en": "0 (Center)"
  },
  "+500px": {
    "id": "+500px",
    "en": "+500px"
  },
  "Posisi Sumbu Y": {
    "id": "Posisi Sumbu Y",
    "en": "Vertical Position"
  },
  "Skala Tampilan (Scale)": {
    "id": "Skala Tampilan (Scale)",
    "en": "Scale"
  },
  "100% (Normal)": {
    "id": "100% (Normal)",
    "en": "100% (Normal)"
  },
  "Kembalikan posisi X, Y ke 0px dan skala ke 100%": {
    "id": "Kembalikan posisi X, Y ke 0px dan skala ke 100%",
    "en": "Reset position to 0 and scale to 100%"
  },
  "↺ Reset Transform": {
    "id": "Reset Posisi & Skala",
    "en": "Reset Position & Scale"
  },
  "FX & Efek Visual": {
    "id": "FX & Efek Visual",
    "en": "Visual Effects"
  },
  "Intensitas Neon Glow": {
    "id": "Intensitas Glow",
    "en": "Glow Intensity"
  },
  "40px": {
    "id": "40px",
    "en": "40px"
  },
  "Kecepatan Animasi (Speed)": {
    "id": "Kecepatan Animasi (Speed)",
    "en": "Animation Speed"
  },
  "0.5x (Lambat)": {
    "id": "0.5x (Lambat)",
    "en": "0.5× (Slow)"
  },
  "1.0x (Normal)": {
    "id": "1.0x (Normal)",
    "en": "1.0x (Normal)"
  },
  "2.0x (Cepat)": {
    "id": "2.0x (Cepat)",
    "en": "2× (Fast)"
  },
  "Nilai slider otomatis hot-sync ke kanvas dan render engine.": {
    "id": "Nilai slider otomatis hot-sync ke kanvas dan render engine.",
    "en": "Changes are applied to the preview and export."
  },
  "Slot 1: Flash Sale Cyber": {
    "id": "Slot 1: Flash Sale Cyber",
    "en": "Slot 1: Flash Sale Cyber"
  },
  "Slot 2: Minimalist Glass Card": {
    "id": "Slot 2: Minimalist Glass Card",
    "en": "Slot 2: Minimalist Glass Card"
  },
  "Slot 3: Tech Metric Counter": {
    "id": "Slot 3: Tech Metric Counter",
    "en": "Slot 3: Tech Metric Counter"
  },
  "Antrean tugas telah dibersihkan.": {
    "id": "Antrean tugas telah dibersihkan.",
    "en": "The task queue was cleared."
  },
  "⚠️ Harap masukkan Google Gemini API Key terlebih dahulu di panel API Key.": {
    "id": "Harap masukkan Google Gemini API Key terlebih dahulu di panel API Key.",
    "en": "Enter your Google Gemini API key in the settings first."
  },
  "⚠️ Antrean kosong. Silakan tambahkan atau buat slot terlebih dahulu.": {
    "id": "Antrean kosong. Silakan tambahkan atau buat slot terlebih dahulu.",
    "en": "The queue is empty. Add a task first."
  },
  "⚠️ API Electron tidak tersedia untuk eksekusi batch.": {
    "id": "API Electron tidak tersedia untuk eksekusi batch.",
    "en": "The Electron API is not available for batch processing."
  },
  "Proses batch dihentikan oleh pengguna.": {
    "id": "Proses batch dihentikan oleh pengguna.",
    "en": "Batch processing was stopped by the user."
  },
  "Selesai! Seluruh tugas antrean batch telah diproses.": {
    "id": "Selesai! Seluruh tugas antrean batch telah diproses.",
    "en": "All queued tasks have been processed."
  },
  "Membatalkan proses batch...": {
    "id": "Membatalkan proses batch...",
    "en": "Stopping batch processing..."
  },
  "AUTONOMOUS BATCH GENERATOR": {
    "id": "PEMBUATAN BATCH",
    "en": "BATCH GENERATOR"
  },
  "⚡ Batch Pipeline": {
    "id": "Pembuatan Batch",
    "en": "Batch Processing"
  },
  "Otomasi produksi aset motion graphics massal berbasis antrean mandiri & Gemini AI.": {
    "id": "Otomasi produksi aset motion graphics massal berbasis antrean mandiri & Gemini AI.",
    "en": "Generate and export queued animations using Gemini AI."
  },
  "Selesai": {
    "id": "Selesai",
    "en": "Completed"
  },
  "Antrean Tugas (": {
    "id": "Antrean Tugas (",
    "en": "Task Queue ("
  },
  "Slot)": {
    "id": "tugas)",
    "en": "tasks)"
  },
  "Tambah satu slot baru ke antrean": {
    "id": "Tambah satu slot baru ke antrean",
    "en": "Add a task to the queue"
  },
  "+ Tambah Slot": {
    "id": "Tambah Tugas",
    "en": "Add Task"
  },
  "Bersihkan semua slot": {
    "id": "Bersihkan semua slot",
    "en": "Clear the task queue"
  },
  "🗑️ Reset": {
    "id": "Kosongkan Antrean",
    "en": "Clear Queue"
  },
  "Antrean Kosong": {
    "id": "Antrean Kosong",
    "en": "Queue Empty"
  },
  "Gunakan tombol \"+ Tambah Slot\" atau atur jumlah loop di panel kanan lalu klik \"Buat Slot\".": {
    "id": "Gunakan tombol \"+ Tambah Slot\" atau atur jumlah loop di panel kanan lalu klik \"Buat Slot\".",
    "en": "Add a task, or select a task count and create a queue."
  },
  "+ Muat 3 Slot Contoh": {
    "id": "Muat 3 Contoh Tugas",
    "en": "Load 3 Example Tasks"
  },
  "Buka folder file di explorer": {
    "id": "Buka folder file di explorer",
    "en": "Open the file folder"
  },
  "Buka": {
    "id": "Buka",
    "en": "Open"
  },
  "Hapus slot ini dari antrean": {
    "id": "Hapus slot ini dari antrean",
    "en": "Remove this task"
  },
  "Pengaturan Batch Pipeline": {
    "id": "Pengaturan Batch Pipeline",
    "en": "Batch Settings"
  },
  "AUTO PIPELINE": {
    "id": "PEMROSESAN BERURUTAN",
    "en": "SEQUENTIAL PROCESSING"
  },
  "Jumlah Video (Loop Slot)": {
    "id": "Jumlah Video (Loop Slot)",
    "en": "Number of Videos"
  },
  "Generate slot otomatis sesuai jumlah": {
    "id": "Generate slot otomatis sesuai jumlah",
    "en": "Create a queue with the selected task count"
  },
  "⚡ Buat Slot": {
    "id": "Buat Tugas",
    "en": "Create Tasks"
  },
  "Format Export Render": {
    "id": "Format Export Render",
    "en": "Export Format"
  },
  "MP4 Video (H.264)": {
    "id": "MP4 Video (H.264)",
    "en": "MP4 Video (H.264)"
  },
  "MOV (ProRes Alpha Transparan)": {
    "id": "MOV (ProRes Alpha Transparan)",
    "en": "MOV (Transparent ProRes Alpha)"
  },
  "Instruksi / Konsep Master Batch": {
    "id": "Instruksi / Konsep Master Batch",
    "en": "Shared Brief / Instructions"
  },
  "Berikan pedoman tema untuk seluruh video yang akan digenerate secara massal...": {
    "id": "Berikan pedoman tema untuk seluruh video yang akan digenerate secara massal...",
    "en": "Describe the theme or instructions for the queued videos..."
  },
  "Gambar Referensi Massal": {
    "id": "Gambar Referensi Massal",
    "en": "Shared Reference Images"
  },
  "gambar)": {
    "id": "gambar)",
    "en": "images)"
  },
  "Pilih atau Tarik Multi-Gambar": {
    "id": "Pilih atau Tarik Gambar",
    "en": "Select or Drop Images"
  },
  "(Gambar akan dibagikan ke setiap slot antrean)": {
    "id": "(Gambar akan dibagikan ke setiap slot antrean)",
    "en": "(Images are shared across queued tasks)"
  },
  "Hapus gambar": {
    "id": "Hapus gambar",
    "en": "Remove image"
  },
  "Hentikan eksekusi antrean massal": {
    "id": "Hentikan eksekusi antrean massal",
    "en": "Stop batch processing"
  },
  "Hentikan Proses Batch": {
    "id": "Hentikan Proses Batch",
    "en": "Stop Batch Processing"
  },
  "Mulai eksekusi sekuensial seluruh antrean video": {
    "id": "Mulai eksekusi sekuensial seluruh antrean video",
    "en": "Process all queued tasks in order"
  },
  "Mulai Auto Generate Massal (": {
    "id": "Mulai Auto Generate Massal (",
    "en": "Generate Queue ("
  },
  "Video)": {
    "id": "video)",
    "en": "videos)"
  },
  "✨ Template offline berhasil diracik dari parameter terpilih!": {
    "id": "Template offline berhasil diracik dari parameter terpilih!",
    "en": "The offline prompt was prepared from your selections."
  },
  "⚠️ Gemini API Key belum diatur. Silakan isi di tab Live Preview atau panel API Key.": {
    "id": "Gemini API Key belum diatur. Silakan isi di tab Live Preview atau panel API Key.",
    "en": "Set your Gemini API key in the settings first."
  },
  "🤖 Gemini AI sedang menyempurnakan konsep visual & timing template...": {
    "id": "Gemini AI sedang menyempurnakan konsep visual & timing template...",
    "en": "Gemini is refining the concept and timing..."
  },
  "✨ Konsep template berhasil disempurnakan dengan kecerdasan Gemini AI!": {
    "id": "Konsep template berhasil disempurnakan dengan kecerdasan Gemini AI!",
    "en": "Gemini has refined the concept."
  },
  "✨ Template berhasil diracik (menggunakan profil offline optimal).": {
    "id": "Template berhasil diracik (menggunakan profil offline optimal).",
    "en": "The prompt was prepared using the offline settings."
  },
  "Template diracik dengan profil offline optimal.": {
    "id": "Template diracik dengan profil offline optimal.",
    "en": "The prompt was prepared using the offline settings."
  },
  "🚀 Mengirim prompt ke Motion Engine & mengalihkan ke Live Preview...": {
    "id": "Mengirim prompt ke Motion Engine & mengalihkan ke Live Preview...",
    "en": "Sending the brief to the motion engine..."
  },
  "🎲 Parameter visual berhasil diacak secara kreatif!": {
    "id": "Parameter visual berhasil diacak secara kreatif!",
    "en": "The visual parameters were randomized."
  },
  "MOTION CORE ENGINE v1.2": {
    "id": "PENGATURAN KONSEP",
    "en": "CONCEPT SETTINGS"
  },
  "🪄 Design Architect": {
    "id": "Penyusun Konsep",
    "en": "Concept Builder"
  },
  "Mesin parameter preset visual & peracik prompt terstruktur untuk video motion graphics berbasis AI.": {
    "id": "Mesin parameter preset visual & peracik prompt terstruktur untuk video motion graphics berbasis AI.",
    "en": "Prepare an animation brief using optional visual references."
  },
  "Acak seluruh parameter untuk ide instan": {
    "id": "Acak seluruh parameter untuk ide instan",
    "en": "Randomize the parameters"
  },
  "🎲 Acak Parameter (Random)": {
    "id": "Acak Parameter",
    "en": "Randomize"
  },
  "Kembalikan ke pengaturan awal": {
    "id": "Kembalikan ke pengaturan awal",
    "en": "Restore the initial settings"
  },
  "🔄 Reset": {
    "id": "Reset",
    "en": "Reset"
  },
  "Dimensi, Timing & Art Style": {
    "id": "Dimensi, Timing & Art Style",
    "en": "Dimensions, Timing & Style"
  },
  "Rasio Resolusi": {
    "id": "Rasio Resolusi",
    "en": "Aspect Ratio"
  },
  "Waktu Video": {
    "id": "Waktu Video",
    "en": "Duration"
  },
  "Frame Rate": {
    "id": "Frame Rate",
    "en": "Frame Rate"
  },
  "Tema Video": {
    "id": "Tema Video",
    "en": "Animation Theme"
  },
  "(Opsional)": {
    "id": "(Opsional)",
    "en": "(Optional)"
  },
  "Misal: Flash Sale Diskon 70%, Cyber System Alert, Podcast Intro...": {
    "id": "Misal: Flash Sale Diskon 70%, Cyber System Alert, Podcast Intro...",
    "en": "For example: a logo reveal, product infographic, or abstract background..."
  },
  "Art Style / Aesthetic": {
    "id": "Gaya Visual",
    "en": "Visual Style"
  },
  "Motion, Kamera & Tipografi": {
    "id": "Motion, Kamera & Tipografi",
    "en": "Motion, Camera & Typography"
  },
  "Gaya Animasi Masuk": {
    "id": "Gaya Animasi Masuk",
    "en": "Entrance Motion"
  },
  "Pergerakan Kamera / Idle": {
    "id": "Pergerakan Kamera / Idle",
    "en": "Camera Motion / Hold"
  },
  "Pacing / Rhythm": {
    "id": "Tempo",
    "en": "Pacing"
  },
  "Tingkat Kompleksitas": {
    "id": "Tingkat Kompleksitas",
    "en": "Complexity"
  },
  "Gaya Tipografi / Teks": {
    "id": "Gaya Tipografi / Teks",
    "en": "Typography"
  },
  "Prompt Template Motion (Dapat Diedit)": {
    "id": "Prompt Template Motion (Dapat Diedit)",
    "en": "Animation Brief (Editable)"
  },
  "karakter": {
    "id": "karakter",
    "en": "characters"
  },
  "Hasil peracikan prompt parameter akan muncul di sini...": {
    "id": "Hasil peracikan prompt parameter akan muncul di sini...",
    "en": "The prepared brief will appear here..."
  },
  "Meracik template prompt tanpa memanggil API": {
    "id": "Meracik template prompt tanpa memanggil API",
    "en": "Prepare the brief without an API request"
  },
  "Generate Template Offline": {
    "id": "Susun Brief Offline",
    "en": "Prepare Offline Brief"
  },
  "Sempurnakan ide visual & timing menggunakan Gemini AI": {
    "id": "Sempurnakan ide visual & timing menggunakan Gemini AI",
    "en": "Refine the concept and timing with Gemini"
  },
  "Menyempurnakan dengan AI...": {
    "id": "Menyempurnakan dengan AI...",
    "en": "Refining with AI..."
  },
  "Generate Template dengan AI": {
    "id": "Sempurnakan Brief dengan AI",
    "en": "Refine Brief with AI"
  },
  "Salin prompt, generate kode video fisik, dan langsung buka Live Preview": {
    "id": "Salin prompt, generate kode video fisik, dan langsung buka Live Preview",
    "en": "Apply the brief and generate an animation"
  },
  "Sedang Merender Video...": {
    "id": "Membuat animasi...",
    "en": "Generating animation..."
  },
  "Tersalin! Merender...": {
    "id": "Tersalin! Merender...",
    "en": "Copied. Generating..."
  },
  "Copy Template & Terapkan (Generate)": {
    "id": "Salin & Buat Animasi",
    "en": "Copy & Generate"
  },
  "Language": {
    "id": "Bahasa",
    "en": "Language"
  },
  "Settings": {
    "id": "Pengaturan",
    "en": "Settings"
  },
  "Manage license": {
    "id": "Kelola lisensi",
    "en": "Manage license"
  },
  "Validating": {
    "id": "Memeriksa Kode",
    "en": "Validating"
  },
  "Otomatis (Disarankan)": {
    "id": "Otomatis (Disarankan)",
    "en": "Automatic (Recommended)"
  },
  "Animasi 2D": {
    "id": "Animasi 2D",
    "en": "2D Animation"
  },
  "Animasi 2.5D": {
    "id": "Animasi 2.5D",
    "en": "2.5D Animation"
  },
  "Animasi 3D": {
    "id": "Animasi 3D",
    "en": "3D Animation"
  },
  "AI akan membantu menentukan jenis animasi yang sesuai dengan ide Anda.": {
    "id": "AI akan membantu menentukan jenis animasi yang sesuai dengan ide Anda.",
    "en": "AI helps choose an animation technique suited to your idea."
  },
  "Untuk tulisan, ikon, dan gambar datar yang bergerak.": {
    "id": "Untuk tulisan, ikon, dan gambar datar yang bergerak.",
    "en": "For animated text, icons, and flat illustrations."
  },
  "Untuk animasi yang terlihat memiliki efek kedalaman.": {
    "id": "Untuk animasi yang terlihat memiliki efek kedalaman.",
    "en": "For animation with an impression of depth."
  },
  "Untuk animasi berbentuk tiga dimensi yang dapat dilihat dari berbagai sudut.": {
    "id": "Untuk animasi berbentuk tiga dimensi yang dapat dilihat dari berbagai sudut.",
    "en": "For three-dimensional animation viewed from different angles."
  },
  "Export Remotion Video (Apple ProRes MOV)": {
    "id": "Ekspor Video (Apple ProRes MOV)",
    "en": "Export Video (Apple ProRes MOV)"
  },
  "Export Remotion Video (MP4)": {
    "id": "Ekspor Video (MP4)",
    "en": "Export Video (MP4)"
  },
  "Pilih Folder Ekspor Video": {
    "id": "Pilih Folder Ekspor Video",
    "en": "Choose Video Export Folder"
  },
  "Motion asset berhasil digenerate dan dimuat ke kanvas preview!": {
    "id": "Animasi berhasil dibuat dan dimuat ke preview.",
    "en": "Animation generated and loaded into the preview."
  },
  "Berhasil": {
    "id": "Berhasil",
    "en": "Success"
  },
  "Gagal": {
    "id": "Gagal",
    "en": "Failed"
  },
  "Nomor lisensi tidak valid.": {
    "id": "Nomor lisensi tidak valid.",
    "en": "The license key is not valid."
  },
  "PRO {p0}": {
    "id": "PRO {p0}",
    "en": "PRO {p0}"
  },
  "Aktif - Bulanan (Exp: {p0})": {
    "id": "Aktif - Bulanan (Exp: {p0})",
    "en": "Active — Monthly (expires {p0})"
  },
  "Rendering {p0}%...": {
    "id": "Rendering {p0}%...",
    "en": "Rendering {p0}%..."
  },
  "+{p0}": {
    "id": "+{p0}",
    "en": "+{p0}"
  },
  "macOS updates are distributed via official Google Drive installer": {
    "id": "macOS updates are distributed via official Google Drive installer",
    "en": "macOS updates are distributed via official Google Drive installer"
  },
  "Invalid or unsafe URL": {
    "id": "Invalid or unsafe URL",
    "en": "Invalid or unsafe URL"
  },
  "Motion Suite Pro — Render Selesai! 🎉": {
    "id": "Motion Suite Pro — Render Selesai!",
    "en": "Motion Suite Pro — Render Selesai!"
  },
  "Video Anda telah selesai diekspor dan siap digunakan.": {
    "id": "Video Anda telah selesai diekspor dan siap digunakan.",
    "en": "Your video has been exported and is ready to use."
  },
  "Pilih Folder Tujuan Batch Export": {
    "id": "Pilih Folder Tujuan Batch Export",
    "en": "Choose Batch Export Folder"
  },
  "File path not found": {
    "id": "File path not found",
    "en": "File path not found"
  },
  "Pilih Folder Penyimpanan Video": {
    "id": "Pilih Folder Penyimpanan Video",
    "en": "Choose Video Save Folder"
  },
  "Kunci lisensi tidak boleh kosong.": {
    "id": "Kunci lisensi tidak boleh kosong.",
    "en": "Enter a license key."
  },
  "Gagal aktivasi: Jam sistem terdeteksi dimundurkan. Sinkronkan waktu internet terlebih dahulu.": {
    "id": "Gagal aktivasi: Jam sistem terdeteksi dimundurkan. Sinkronkan waktu internet terlebih dahulu.",
    "en": "Activation could not continue because the system clock was moved backwards. Synchronize internet time first."
  },
  "Kunci lisensi legacy tidak valid atau tanda tangan digital salah.": {
    "id": "Kunci lisensi legacy tidak valid atau tanda tangan digital salah.",
    "en": "The legacy license key or its digital signature is not valid."
  },
  "Gagal menyimpan lisensi legacy ke sistem lokal.": {
    "id": "Gagal menyimpan lisensi legacy ke sistem lokal.",
    "en": "Could not save the legacy license locally."
  },
  "Aktivasi Berhasil! Lisensi Lifetime Legacy resmi aktif permanen.": {
    "id": "Aktivasi Berhasil! Lisensi Lifetime Legacy resmi aktif permanen.",
    "en": "Activation completed. Your legacy Lifetime license is active."
  },
  "Perangkat ini tidak terdaftar dalam whitelist pengguna lama resmi.": {
    "id": "Perangkat ini tidak terdaftar dalam whitelist pengguna lama resmi.",
    "en": "This device is not registered for a legacy license."
  },
  "Format kunci lisensi tidak valid. Pastikan Anda menyalin seluruh teks kunci lisensi digital.": {
    "id": "Format kunci lisensi tidak valid. Pastikan Anda menyalin seluruh teks kunci lisensi digital.",
    "en": "Invalid license format. Make sure you copied the complete digital license key."
  },
  "Kunci lisensi digital tidak valid / palsu. Verifikasi tanda tangan kriptografi RSA-SHA256 gagal.": {
    "id": "Kunci lisensi digital tidak valid / palsu. Verifikasi tanda tangan kriptografi RSA-SHA256 gagal.",
    "en": "The digital license could not be verified. Its RSA-SHA256 signature is not valid."
  },
  "Format data payload di dalam lisensi rusak.": {
    "id": "Format data payload di dalam lisensi rusak.",
    "en": "The license data format is not valid."
  },
  "Gagal menyimpan file lisensi ke sistem lokal.": {
    "id": "Gagal menyimpan file lisensi ke sistem lokal.",
    "en": "Could not save the license file locally."
  },
  "Layanan AI Sedang Mengalami Gangguan": {
    "id": "Layanan AI Sedang Mengalami Gangguan",
    "en": "AI Service Temporarily Unavailable"
  },
  "Layanan Google Gemini sedang mengalami gangguan sementara sehingga permintaan belum berhasil diproses. Ini bukan kesalahan kode animasi Anda. Silakan coba kembali beberapa saat lagi. Pekerjaan sebelumnya tetap aman.": {
    "id": "Layanan Google Gemini sedang mengalami gangguan sementara sehingga permintaan belum berhasil diproses. Ini bukan kesalahan kode animasi Anda. Silakan coba kembali beberapa saat lagi. Pekerjaan sebelumnya tetap aman.",
    "en": "The Google Gemini API returned a temporary service error. This is not an animation code error. Try again later. Your previous work remains safe."
  },
  "Permintaan AI Sedang Dibatasi": {
    "id": "Permintaan AI Sedang Dibatasi",
    "en": "AI Requests Are Being Limited"
  },
  "Layanan Google Gemini sedang membatasi permintaan atau kuota API yang digunakan telah tercapai. Silakan periksa kuota API Anda atau coba kembali nanti.": {
    "id": "Layanan Google Gemini sedang membatasi permintaan atau kuota API yang digunakan telah tercapai. Silakan periksa kuota API Anda atau coba kembali nanti.",
    "en": "Google Gemini is limiting requests or the API quota may have been reached. Check your API quota or try again later."
  },
  "Waktu Pemrosesan AI Habis": {
    "id": "Waktu Pemrosesan AI Habis",
    "en": "AI Processing Time Limit Reached"
  },
  "Proses AI belum selesai dalam batas waktu yang tersedia. Hal ini tidak selalu berarti server Google sedang bermasalah. Silakan coba kembali beberapa saat lagi. Animasi sebelumnya tidak diubah.": {
    "id": "Proses AI belum selesai dalam batas waktu yang tersedia. Hal ini tidak selalu berarti server Google sedang bermasalah. Silakan coba kembali beberapa saat lagi. Animasi sebelumnya tidak diubah.",
    "en": "The AI request did not finish within the application time limit. This does not necessarily indicate a Google service outage. Try again later. Your previous animation was not changed."
  },
  "Koneksi ke Layanan AI Gagal": {
    "id": "Koneksi ke Layanan AI Gagal",
    "en": "Could Not Connect to the AI Service"
  },
  "Motion Suite Pro tidak dapat terhubung ke layanan Google Gemini. Periksa koneksi internet Anda dan coba kembali.": {
    "id": "Motion Suite Pro tidak dapat terhubung ke layanan Google Gemini. Periksa koneksi internet Anda dan coba kembali.",
    "en": "Motion Suite Pro could not connect to Google Gemini. Check your internet connection and try again."
  },
  "Konfigurasi API Memerlukan Perhatian": {
    "id": "Konfigurasi API Memerlukan Perhatian",
    "en": "Check Your API Configuration"
  },
  "Permintaan AI tidak dapat diotorisasi. Periksa API Key, izin akses model, dan pengaturan Google AI Studio Anda.": {
    "id": "Permintaan AI tidak dapat diotorisasi. Periksa API Key, izin akses model, dan pengaturan Google AI Studio Anda.",
    "en": "The AI request could not be authorized. Check your API key, model permissions, and Google AI Studio settings."
  },
  "Kode Animasi Belum Valid": {
    "id": "Kode Animasi Belum Valid",
    "en": "Animation Code Did Not Pass Validation"
  },
  "Kode animasi yang dihasilkan AI belum lolos pemeriksaan teknis. Animasi sebelumnya tetap aman dan tidak ditimpa.": {
    "id": "Kode animasi yang dihasilkan AI belum lolos pemeriksaan teknis. Animasi sebelumnya tetap aman dan tidak ditimpa.",
    "en": "The generated animation code did not pass technical validation. Your previous animation remains safe and was not overwritten."
  },
  "Perencanaan Animasi Belum Berhasil": {
    "id": "Perencanaan Animasi Belum Berhasil",
    "en": "Animation Planning Did Not Pass Validation"
  },
  "AI belum menghasilkan rancangan animasi yang memenuhi pemeriksaan struktur. Tidak ada animasi baru yang diterapkan.": {
    "id": "AI belum menghasilkan rancangan animasi yang memenuhi pemeriksaan struktur. Tidak ada animasi baru yang diterapkan.",
    "en": "The creative blueprint did not pass structural validation. No new animation was applied."
  },
  "Proses AI Belum Berhasil": {
    "id": "Proses AI Belum Berhasil",
    "en": "AI Processing Was Not Successful"
  },
  "Terjadi kendala saat memproses permintaan animasi. Penyebabnya belum dapat dipastikan. Silakan coba kembali atau periksa informasi diagnostik.": {
    "id": "Terjadi kendala saat memproses permintaan animasi. Penyebabnya belum dapat dipastikan. Silakan coba kembali atau periksa informasi diagnostik.",
    "en": "The animation request encountered an issue. Its cause could not be confirmed. Try again or review the diagnostic information."
  },
  "Proses AI Dibatalkan": {
    "id": "Proses AI Dibatalkan",
    "en": "AI Request Cancelled"
  },
  "Permintaan dihentikan. Animasi sebelumnya tidak diubah.": {
    "id": "Permintaan dihentikan. Animasi sebelumnya tidak diubah.",
    "en": "The request was stopped. Your previous animation was not changed."
  },
  "Waktu Validasi Animasi Habis": {
    "id": "Waktu Validasi Animasi Habis",
    "en": "Animation Validation Time Limit Reached"
  },
  "Pemeriksaan lokal kode animasi belum selesai dalam batas waktu yang tersedia. Animasi sebelumnya tidak diubah.": {
    "id": "Pemeriksaan lokal kode animasi belum selesai dalam batas waktu yang tersedia. Animasi sebelumnya tidak diubah.",
    "en": "Local code validation did not finish within its time limit. Your previous animation was not changed."
  },
  "Kuota API Google Gemini telah tercapai. Silakan periksa kuota API Anda di Google AI Studio.": {
    "id": "Kuota API Google Gemini telah tercapai. Silakan periksa kuota API Anda di Google AI Studio.",
    "en": "The Google Gemini API quota has been reached. Check your quota in Google AI Studio."
  },
  "Layanan Google Gemini sedang membatasi laju permintaan. Silakan coba kembali nanti.": {
    "id": "Layanan Google Gemini sedang membatasi laju permintaan. Silakan coba kembali nanti.",
    "en": "Google Gemini is limiting the request rate. Try again later."
  },
  "Lisensi Bulanan Legacy telah berakhir pada {p0}.": {
    "id": "Lisensi Bulanan Legacy telah berakhir pada {p0}.",
    "en": "Your legacy monthly license expired on {p0}."
  },
  "Aktivasi Berhasil! Lisensi Bulanan Legacy aktif hingga {p0}.": {
    "id": "Aktivasi Berhasil! Lisensi Bulanan Legacy aktif hingga {p0}.",
    "en": "Activation completed. Your legacy monthly license is active until {p0}."
  },
  "Lisensi ini terikat untuk perangkat lain (ID: {p0}). Machine ID perangkat ini adalah: {p1}": {
    "id": "Lisensi ini terikat untuk perangkat lain (ID: {p0}). Machine ID perangkat ini adalah: {p1}",
    "en": "This license is bound to another device (ID: {p0}). This device Machine ID is: {p1}"
  },
  "Kunci lisensi ini telah kadaluarsa pada {p0}.": {
    "id": "Kunci lisensi ini telah kadaluarsa pada {p0}.",
    "en": "This license expired on {p0}."
  },
  "Aktivasi Berhasil! Lisensi Lifetime Access aktif selamanya.": {
    "id": "Aktivasi Berhasil! Lisensi Lifetime Access aktif selamanya.",
    "en": "Activation completed. Your Lifetime license is active."
  },
  "Aktivasi Berhasil! Lisensi aktif hingga {p0}.": {
    "id": "Aktivasi Berhasil! Lisensi aktif hingga {p0}.",
    "en": "Activation completed. Your license is active until {p0}."
  },
  "Sisa Masa Aktif: {p0} Hari": {
    "id": "Sisa Masa Aktif: {p0} Hari",
    "en": "Remaining: {p0} days"
  },
  "Animasi berhasil dibuat dan dimuat ke preview.": {
    "id": "Animasi berhasil dibuat dan dimuat ke preview.",
    "en": "Animation generated and loaded into the preview."
  },
  "Render berhasil disimpan! [{p0}]": {
    "id": "Render berhasil disimpan! [{p0}]",
    "en": "Video saved. [{p0}]"
  },
  "Render berhasil disimpan ke:\n{p0}": {
    "id": "Render berhasil disimpan ke:\n{p0}",
    "en": "Video saved to:\n{p0}"
  },
  "Gagal melakukan render: {p0}": {
    "id": "Gagal melakukan render: {p0}",
    "en": "Export failed: {p0}"
  },
  "Gagal memproses kode: {p0}": {
    "id": "Gagal memproses kode: {p0}",
    "en": "Code could not be applied: {p0}"
  },
  "Kode berhasil diterapkan!": {
    "id": "Kode berhasil diterapkan!",
    "en": "Code applied."
  },
  "Memvalidasi kode...": {
    "id": "Memvalidasi kode...",
    "en": "Validating code..."
  },
  "Kode TSX kosong.": {
    "id": "Kode TSX kosong.",
    "en": "The TSX code is empty."
  },
  "Kode tidak boleh kosong.": {
    "id": "Kode tidak boleh kosong.",
    "en": "The code cannot be empty."
  },
  "Master Prompt berhasil disalin!": {
    "id": "Master Prompt berhasil disalin!",
    "en": "Master Prompt copied."
  },
  "Tidak dapat mengakses Clipboard API.": {
    "id": "Tidak dapat mengakses Clipboard API.",
    "en": "The clipboard API is not available."
  },
  "Menyimpan...": {
    "id": "Menyimpan...",
    "en": "Saving..."
  },
  "Berhasil disimpan!": {
    "id": "Berhasil disimpan!",
    "en": "Saved."
  },
  "Parameter berhasil dikembalikan ke nilai awal (↺ Revert)": {
    "id": "Parameter berhasil dikembalikan ke nilai awal (↺ Revert)",
    "en": "The original parameters were restored."
  },
  "Gagal memulai unduhan pembaruan.": {
    "id": "Gagal memulai unduhan pembaruan.",
    "en": "Could not start downloading the update."
  },
  " Berhasil dibuat menggunakan ": {
    "id": " Berhasil dibuat menggunakan ",
    "en": " Generated using "
  },
  "Memeriksa dan menyimpan kode TSX...": {
    "id": "Memeriksa dan menyimpan kode TSX...",
    "en": "Validating and applying the TSX code..."
  },
  "Gagal menyimpan kode: Proses penulisan file melebihi batas waktu.": {
    "id": "Gagal menyimpan kode: Proses penulisan file melebihi batas waktu.",
    "en": "Could not save the code within the time limit."
  },
  "Kode berhasil disimpan! Kanvas melakukan hot-reload otomatis.": {
    "id": "Kode berhasil disimpan! Kanvas melakukan hot-reload otomatis.",
    "en": "Code applied. The preview is reloading."
  },
  "Sintaks TSX tidak valid atau gagal menyimpan file.": {
    "id": "Sintaks TSX tidak valid atau gagal menyimpan file.",
    "en": "The TSX did not pass validation or could not be saved."
  },
  "Master Prompt AI berhasil disalin ke clipboard!": {
    "id": "Master Prompt AI berhasil disalin ke clipboard!",
    "en": "Master Prompt copied to the clipboard."
  },
  "Gagal menyalin Master Prompt ke clipboard.": {
    "id": "Gagal menyalin Master Prompt ke clipboard.",
    "en": "Could not copy the Master Prompt."
  },
  "Gagal merender video": {
    "id": "Gagal merender video",
    "en": "Could not export the video"
  },
  "Export gagal.": {
    "id": "Export gagal.",
    "en": "Export failed."
  },
  "Sistem mendeteksi bahwa tanggal/jam lokal perangkat Anda dimundurkan dari waktu rekaman sebelumnya. Untuk melindungi integritas lisensi, fitur render dan generator AI dikunci sementara.": {
    "id": "Sistem mendeteksi bahwa tanggal/jam lokal perangkat Anda dimundurkan dari waktu rekaman sebelumnya. Untuk melindungi integritas lisensi, fitur render dan generator AI dikunci sementara.",
    "en": "The system clock is earlier than its previous recorded time. Generation and export are temporarily locked to protect license integrity."
  },
  "Masa aktif lisensi Anda telah habis. Masukkan Kunci Lisensi baru atau perpanjang lisensi Anda untuk melanjutkan ekspor video dan fitur generator AI.": {
    "id": "Masa aktif lisensi Anda telah habis. Masukkan Kunci Lisensi baru atau perpanjang lisensi Anda untuk melanjutkan ekspor video dan fitur generator AI.",
    "en": "Your license has expired. Enter a new license key or renew it to continue generating and exporting video."
  },
  "Gagal menghasilkan kode dengan Gemini AI": {
    "id": "Gagal menghasilkan kode dengan Gemini AI",
    "en": "Gemini could not generate the code"
  },
  "Gagal render video motion asset": {
    "id": "Gagal render video motion asset",
    "en": "Could not export the animation"
  },
  "❌ Gagal": {
    "id": "❌ Gagal",
    "en": "Failed"
  },
  "5 Detik": {
    "id": "5 Detik",
    "en": "5 seconds"
  },
  "8 Detik": {
    "id": "8 Detik",
    "en": "8 seconds"
  },
  "15 Detik": {
    "id": "15 Detik",
    "en": "15 seconds"
  },
  "24 Detik": {
    "id": "24 Detik",
    "en": "24 seconds"
  },
  "Animasi {p0}": {
    "id": "Animasi {p0}",
    "en": "Animation {p0}"
  },
  "✓ Validasi Berhasil: {p0}": {
    "id": "Validasi Berhasil: {p0}",
    "en": "Validation passed: {p0}"
  },
  "⚠️ Gagal: {p0}": {
    "id": "Gagal: {p0}",
    "en": "Failed: {p0}"
  },
  "Silakan masukkan atau tempelkan kode TSX terlebih dahulu.": {
    "id": "Silakan masukkan atau tempelkan kode TSX terlebih dahulu.",
    "en": "Enter or paste your TSX code first."
  },
  "📁 Folder penyimpanan diubah: {p0}": {
    "id": "Folder penyimpanan diubah: {p0}",
    "en": "Export folder changed: {p0}"
  },
  "Kode TSX tidak valid: {p0}": {
    "id": "Kode TSX tidak valid: {p0}",
    "en": "The TSX code did not pass validation: {p0}"
  },
  "✓ Kode berhasil diterapkan!": {
    "id": "Kode berhasil diterapkan!",
    "en": "Code applied."
  },
  "✓ Berhasil menggunakan {p0}": {
    "id": "Berhasil menggunakan {p0}",
    "en": "Generated using {p0}"
  },
  "Failed to copy message": {
    "id": "Failed to copy message",
    "en": "Could not copy the message"
  },
  "Perubahan terakhir dibatalkan (Undo ↶)": {
    "id": "Perubahan terakhir dibatalkan (Undo ↶)",
    "en": "The last adjustment was undone."
  },
  "Kanvas Motion Engine dimuat ulang.": {
    "id": "Kanvas Motion Engine dimuat ulang.",
    "en": "The preview was reloaded."
  },
  "Template standar dimuat. Tekan \"Render Motion\" untuk menerapkan ke player.": {
    "id": "Template standar dimuat. Tekan \"Render Motion\" untuk menerapkan ke player.",
    "en": "Starter template loaded. Select Apply & View Result to apply it."
  },
  "❌ Gagal memulihkan: {p0}": {
    "id": "❌ Gagal memulihkan: {p0}",
    "en": "Could not restore the code: {p0}"
  },
  "❌ Auto-Fix Gagal: {p0}": {
    "id": "❌ Auto-Fix Gagal: {p0}",
    "en": "Auto-Fix failed: {p0}"
  },
  "{p0} slot otomatis berhasil dibuat berdasarkan pengaturan batch!": {
    "id": "{p0} slot otomatis berhasil dibuat berdasarkan pengaturan batch!",
    "en": "Created {p0} tasks from your batch settings."
  },
  "Memulai proses batch untuk {p0} video...": {
    "id": "Memulai proses batch untuk {p0} video...",
    "en": "Starting batch processing for {p0} videos..."
  },
  "[{p0}/{p1}] Meng-generate kode TSX untuk: {p2}...": {
    "id": "[{p0}/{p1}] Meng-generate kode TSX untuk: {p2}...",
    "en": "[{p0}/{p1}] Generating TSX for: {p2}..."
  },
  "[{p0}/{p1}] Merender video fisik untuk: {p2}...": {
    "id": "[{p0}/{p1}] Merender video fisik untuk: {p2}...",
    "en": "[{p0}/{p1}] Exporting video for: {p2}..."
  },
  "Aplikasi belum diaktivasi.": {
    "id": "Aplikasi belum diaktivasi.",
    "en": "The application has not been activated."
  },
  "Tanda tangan kunci legacy tidak valid.": {
    "id": "Tanda tangan kunci legacy tidak valid.",
    "en": "The legacy license signature is not valid."
  },
  "Lisensi Lifetime Legacy Aktif Permanen.": {
    "id": "Lisensi Lifetime Legacy Aktif Permanen.",
    "en": "The legacy Lifetime license is active."
  },
  "Lisensi Bulanan Legacy Aktif.": {
    "id": "Lisensi Bulanan Legacy Aktif.",
    "en": "The legacy monthly license is active."
  },
  "Perangkat tidak terdaftar dalam whitelist legacy resmi.": {
    "id": "Perangkat tidak terdaftar dalam whitelist legacy resmi.",
    "en": "This device is not registered for a legacy license."
  },
  "Tanda tangan digital pada file lisensi tidak valid.": {
    "id": "Tanda tangan digital pada file lisensi tidak valid.",
    "en": "The license file signature is not valid."
  },
  "Payload lisensi rusak.": {
    "id": "Payload lisensi rusak.",
    "en": "The license data format is not valid."
  },
  "Ketidakcocokan integritas data lisensi.": {
    "id": "Ketidakcocokan integritas data lisensi.",
    "en": "License data integrity could not be verified."
  },
  "Format file lisensi tidak memiliki tanda tangan digital.": {
    "id": "Format file lisensi tidak memiliki tanda tangan digital.",
    "en": "The license file does not contain a digital signature."
  },
  "Kunci lisensi ini terikat untuk perangkat keras lain.": {
    "id": "Kunci lisensi ini terikat untuk perangkat keras lain.",
    "en": "This license is bound to another device."
  },
  "Lisensi Resmi Aktif.": {
    "id": "Lisensi Resmi Aktif.",
    "en": "Your license is active."
  },
  "Lisensi tidak aktif.": {
    "id": "Lisensi tidak aktif.",
    "en": "The license is not active."
  },
  "Gagal memuat status lisensi.": {
    "id": "Gagal memuat status lisensi.",
    "en": "Could not load license status."
  },
  "Lisensi Bulanan Legacy telah kadaluarsa pada {p0}.": {
    "id": "Lisensi Bulanan Legacy telah kadaluarsa pada {p0}.",
    "en": "Your legacy monthly license expired on {p0}."
  },
  "Masa aktif lisensi Anda telah berakhir pada {p0}. Perpanjang lisensi Anda untuk melanjutkan.": {
    "id": "Masa aktif lisensi Anda telah berakhir pada {p0}. Perpanjang lisensi Anda untuk melanjutkan.",
    "en": "Your license expired on {p0}. Renew it to continue."
  },
  "Jam sistem terdeteksi dimundurkan.": {
    "id": "Jam sistem terdeteksi dimundurkan.",
    "en": "The system clock was moved backwards."
  },
  "Motion asset berhasil digenerate dan dimuat ke kanvas preview! Berhasil dibuat menggunakan {p0}. Planning: {p1}.": {
    "id": "Animasi berhasil dibuat dan dimuat. Dibuat menggunakan {p0}. Perencanaan: {p1}.",
    "en": "Animation generated and loaded. Built using {p0}. Planning: {p1}."
  },
  "Motion asset berhasil digenerate dan dimuat ke kanvas preview! Berhasil dibuat menggunakan {p0}.": {
    "id": "Animasi berhasil dibuat dan dimuat. Dibuat menggunakan {p0}.",
    "en": "Animation generated and loaded. Built using {p0}."
  },
  "Flowchart Construction": {
    "id": "Flowchart Construction",
    "en": "Flowchart Construction"
  }
} as const
export type TranslationKey = keyof typeof UI_MESSAGES
export type UiParams = Record<string, string | number | null | undefined>

export function translateUi(key: string, language: UiLanguage = 'id', params: UiParams = {}): string {
  const entry = Object.prototype.hasOwnProperty.call(UI_MESSAGES, key) ? UI_MESSAGES[key as TranslationKey] : undefined
  const text = entry ? entry[language] : key
  return text.replace(/\{(p\d+)\}/g, (token, name: string) => Object.prototype.hasOwnProperty.call(params, name) ? String(params[name] ?? '') : token)
}

const storedMessages = Object.entries(UI_MESSAGES)
const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const templates = storedMessages.filter(([key]) => /\{p\d+\}/.test(key)).flatMap(([key, entry]) =>
  [...new Set([key, entry.id, entry.en])].map(text => {
    const names: string[] = []
    const pattern = text.split(/(\{p\d+\})/g).map(part => {
      if (/^\{p\d+\}$/.test(part)) { names.push(part.slice(1, -1)); return '([\\s\\S]{0,4096}?)' }
      return escapeRegex(part)
    }).join('')
    return { key, names, regex: new RegExp('^' + pattern + '$') }
  }))

// Present only known application messages. Unknown diagnostics and user content stay untouched.
export function translateUiMessage(value: string | null | undefined, language: UiLanguage): string {
  if (!value) return ''
  if (value.length > 8192) return value
  if (Object.prototype.hasOwnProperty.call(UI_MESSAGES, value)) return translateUi(value, language)
  const entry = storedMessages.find(([, text]) => text.id === value || text.en === value)
  if (entry) return translateUi(entry[0], language)
  for (const template of templates) {
    const match = template.regex.exec(value)
    if (match) {
      const params = Object.fromEntries(template.names.map((name, i) => [name, match[i + 1]]))
      // This application-owned parameter is a format label, never user content.
      if (template.key === 'Render berhasil disimpan! [{p0}]') params.p0 = translateUi(params.p0, language)
      return translateUi(template.key, language, params)
    }
  }
  for (const stage of ['Planning', 'Building Animation', 'Validating', 'Ready']) {
    if (value === stage + '...' || value.startsWith(stage + ' - ')) return translateUi(stage, language) + value.slice(stage.length)
  }
  return value
}
