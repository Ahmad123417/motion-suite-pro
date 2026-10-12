Motion Suite Pro v1.0.7 — Panduan & Spesifikasi / Guide & Specifications

BAHASA INDONESIA

Motion Suite Pro v1.0.7 — Panduan Pengguna

Motion Suite Pro adalah aplikasi desktop untuk membuat motion graphics berbasis kode. Gunakan brief AI internal atau satu file TSX dari AI eksternal. Hasil dapat diedit, dipreview, dan diekspor. Kualitas visual dan penerimaan marketplace tetap perlu diperiksa oleh kreator; render berhasil bukan jaminan kualitas komersial.

PERSYARATAN DAN INSTALLER
Windows 10/11 x64: Motion-Suite-Pro.Setup.1.0.7.exe.
macOS 13+: pilih Motion Suite Pro-1.0.7-mac-x64.dmg untuk Intel, atau Motion Suite Pro-1.0.7-mac-arm64.dmg untuk Apple Silicon. Electron 44.2.0 memerlukan macOS 13+. Installer kedua arsitektur harus diperiksa sebelum distribusi; keberhasilan Windows tidak membuktikan kompatibilitas Mac.
Performa tergantung CPU, GPU/WebGL, memori, resolusi, dan kerumitan animasi. Dukungan 4K/60 FPS bukan janji preview real-time. Pastikan ruang penyimpanan cukup untuk paket, aset, dan render.
Status signing/notarization mengikuti laporan artefak rilis. Jika Windows atau macOS menampilkan peringatan, verifikasi sumber dan checksum installer; jangan menganggap semua error sebagai Gatekeeper. Hubungi dukungan jika paket rusak atau arsitektur tidak cocok.

MEMULAI
1. Buka aplikasi, lalu aktifkan lisensi resmi melalui pengaturan lisensi. Machine ID tetap terikat pada perangkat; pembaruan tidak membutuhkan bypass aktivasi.
2. Pilih Indonesia atau English melalui pilihan Bahasa. Pergantian bahasa tidak mengubah brief, kode, konfigurasi, maupun lisensi.
3. Atur rasio 16:9 atau 9:16, resolusi, durasi 5/10/15/20 detik, dan FPS 24/30/60. Total frame = durasi × FPS.
4. Pilih Jenis Animasi: Otomatis, 2D, 2.5D, atau 3D. Pilihan ini mengarahkan teknik, bukan memaksakan tema, warna, atau gaya.

STUDIO DAN BAHASA
Indonesia adalah bahasa awal instalasi baru. Preferensi bahasa yang sudah tersimpan tetap digunakan. Panel Konsep Animasi berisi brief, Jenis Animasi, Mode Pembuatan, lalu Buat Animasi. Buka Pengaturan tambahan untuk referensi, garis SVG presisi, penggunaan palet, dan penggunaan teks sebelumnya. Pengaturan lisensi dan API key tetap tersedia di sidebar. Studio Preview menampilkan hasil dan timeline; Code Inspector menyediakan editor serta Salin Master Prompt. Bahasa dapat diganti tanpa menghapus pekerjaan.

AI INTERNAL
Gunakan Gemini API key pribadi dari Google AI Studio. Ketersediaan model, kuota, dan biaya mengikuti ketentuan Google; aplikasi tidak menyediakan kuota tanpa batas atau menjamin layanan selalu tersedia.
Cepat memakai satu tahap pembuatan kode. Kualitas Tinggi (Beta) memakai perencanaan blueprint kemudian pembuatan kode. Retry/fallback dan recovery yang diizinkan dapat menambah penggunaan API. Batas permintaan Quality: Planning 60 detik, Building maksimal 150 detik dalam sisa total 180 detik. Pemeriksaan lokal memiliki batas tersendiri. Tidak ada janji durasi selesai atau kualitas sempurna.
Tuliskan subjek, gerakan, warna, sudut pandang, timing, dan batasan seperti tanpa teks/shadow. Referensi gambar/GIF/video pendek bersifat opsional. Model yang berhasil ditampilkan sesuai hasil aktual.
Garis SVG Presisi (Beta) default OFF. Aktifkan untuk outline atau ikon yang membutuhkan stroke drawing; bukan template wajib.
Gunakan palet saat ini OFF: pada Generate yang berhasil, nilai warna default literal pada props accentColor, secondaryColor, dan backgroundColor dalam kode baru diterapkan sebelum preview dan ekspor. Nilai yang tidak didefinisikan mempertahankan pengaturan saat ini. ON: palet yang Anda pilih di aplikasi dipertahankan sebagai pilihan sengaja. Anda tetap dapat mengubah warna secara manual setelahnya. Saat Transparan aktif, latar preview/ekspor tetap transparan; MP4 tidak menyimpan alpha.
Gunakan judul/subjudul/label saat ini hanya jika ingin mempertahankan teks tersebut pada Generate baru. Jika OFF, animasi baru memakai teksnya sendiri tanpa mewarisi teks lama yang tidak terkait.
Hentikan tersedia pada proses yang mendukung cancellation. Auto-Fix dan Edit dengan AI adalah tindakan manual dan dapat memakai API. Tidak ada repair startup diam-diam.

AI EKSTERNAL DAN PEMERIKSA KODE
Salin Master Prompt setelah pengaturan video dan jenis animasi dipilih. Prompt memuat konfigurasi aktif saat diklik. Diskusikan konsep, lalu katakan LANJUT atau BUAT KODE untuk mendapatkan satu file TSX. AI eksternal belum tentu mengikuti setiap instruksi; periksa hasil.
Pertahankan header // @title: dan kontrak ekspor DynamicMotion/VibeGraphic/default sesuai Master Prompt. Gunakan hanya import/API yang didukung; 3D memakai wrapper resmi aplikasi. Jangan tempel API key atau lisensi ke layanan AI eksternal.
Tempel TSX, lalu pilih Terapkan & Lihat Hasil. Sintaks, import, dan kompatibilitas diperiksa sebelum penulisan. Kode ditolak tidak mengganti animasi aktif. Salin diagnostik yang aman kepada AI untuk revisi; jangan mengirim informasi rahasia.

PREVIEW DAN PENGATURAN VISUAL
Gunakan playback dan scrub untuk memeriksa frame awal, transisi, akhir, clipping, dan kesinambungan objek. Pengaturan Visual menyediakan teks, warna, posisi, skala, glow, kecepatan, Undo, dan pengembalian nilai awal. Dampaknya tergantung kontrak props yang digunakan kode. Efek bukan kewajiban dan tidak otomatis memperbaiki kualitas desain.
Untuk 3D, diperlukan WebGL yang sesuai. Jika preview gagal, baca pesan diagnostik dan periksa dukungan GPU; jangan mengubah pengaturan GPU secara acak.

PEMERIKSAAN ASET MICROSTOCK
Periksa keterbacaan subjek, warna yang diminta, konstruksi bentuk, kesinambungan objek, timing, clipping, flicker, dan frame akhir sebelum mengirim aset ke marketplace. Hindari merek, watermark, dan teks yang tidak diminta. Hasil AI tetap membutuhkan penilaian kreator; mode Kualitas Tinggi dan render 4K tidak menjamin penerimaan marketplace.

EKSPOR
MP4 H.264 untuk video dengan latar solid. MP4 tidak mendukung alpha.
MOV ProRes 4444 untuk alpha ketika Transparan dipilih. Periksa alpha di editor yang mendukung; pemutar biasa dapat menampilkan transparansi sebagai hitam.
Pilih folder ekspor, format, dan mode render yang sesuai. Memori dan waktu render meningkat pada 4K/60 FPS serta adegan 3D kompleks. Jangan menutup aplikasi saat proses masih berjalan tanpa membatalkan secara normal.

ERROR DAN PEMBARUAN
429: layanan membatasi permintaan atau kuota tercapai. Periksa informasi kuota; quota exhaustion tidak selalu pulih setelah menunggu singkat. Jangan mengganti key/proyek untuk menghindari kebijakan provider.
500/502/503/504: permintaan menerima error layanan Gemini, bukan bukti seluruh server Google mati. Coba lagi nanti.
401/403: periksa API key dan izin. Deadline aplikasi: request tidak selesai dalam batas waktu; bukan bukti outage. Error koneksi: periksa koneksi. TSX/blueprint invalid: pemeriksaan teknis gagal; animasi sebelumnya dilindungi sebelum penerapan.
Windows memakai notifikasi, download, dan Pasang & Restart melalui updater. macOS memakai DMG manual dari tautan Google Drive resmi, tanpa notifikasi update dalam aplikasi v1.0.7.
Setelah upgrade, periksa proyek, aset, konfigurasi, lisensi, API key, preview, dan ekspor. Status pengujian upgrade dicatat dalam laporan rilis; satu perangkat bukan jaminan semua konfigurasi pelanggan.

AKTIVASI DAN DUKUNGAN
Salin Machine ID, lalu gunakan formulir aktivasi resmi: https://motionsuite-act.duckdns.org/form/c1dc1a25-386b-4780-9e60-454b6201969e
Masukkan email, transaksi/invoice, Machine ID, paket lisensi, dan bukti pembelian sesuai formulir. Salin seluruh kunci lisensi dari email dan pilih Validasi. Paket mengikuti pembelian resmi; v1.0.7 tidak mengubah ketentuan durasi atau Lifetime.
Jika jam perangkat tidak sesuai, gunakan sinkronisasi waktu yang tersedia atau pengaturan tanggal/waktu OS. Jika masa berlaku habis, perpanjang melalui penjual resmi.
Dukungan: ahmadmuslihfarhany46@gmail.com · Telegram: @ahmadmuslihfarhany

ENGLISH

Motion Suite Pro v1.0.7 — User Guide

Motion Suite Pro is a desktop application for code-based motion graphics. Use the internal AI brief or a single TSX file from an external AI. Preview, edit, and export the result. Creators must review visual quality and marketplace suitability; a successful render does not guarantee commercial quality or marketplace acceptance.

SYSTEMS AND INSTALLERS
Windows 10/11 x64: Motion-Suite-Pro.Setup.1.0.7.exe.
macOS 13+: use Motion Suite Pro-1.0.7-mac-x64.dmg for Intel or Motion Suite Pro-1.0.7-mac-arm64.dmg for Apple Silicon. Electron 44.2.0 requires macOS 13 or later. Each architecture must pass release checks; Windows success does not establish Mac compatibility.
Performance depends on CPU, GPU/WebGL, memory, resolution, and scene complexity. 4K/60 FPS support does not promise real-time preview. Allow sufficient disk space for the application, assets, and exports.
Signing/notarization status is recorded in the artifact report. If Windows or macOS shows a warning, verify the source and checksum. Do not assume every error is Gatekeeper-related; contact support for damaged or incompatible packages.

GETTING STARTED
1. Activate a legitimate license in the license settings. Machine ID binding remains intact; updates do not require an activation bypass.
2. Select Indonesia or English using Language. Switching languages preserves your brief, code, configuration, and license.
3. Select 16:9 or 9:16, resolution, 5/10/15/20 seconds, and 24/30/60 FPS. Total frames = seconds × FPS.
4. Select Automatic, 2D, 2.5D, or 3D Animation. This guides technique without prescribing a theme, palette, or visual style.

STUDIO AND LANGUAGE
Indonesian is the default for new installations. An existing saved language preference is retained. The Animation Concept panel contains the brief, Animation Type, Generation Mode, and Generate Animation action. Expand Additional Settings for references, precision strokes, palette reuse, and text reuse. License and API key settings remain accessible in the sidebar. Studio Preview contains the result and timeline; Code Inspector provides the editor and Copy Master Prompt. Switching languages preserves your work.

INTERNAL AI
Use your own Google AI Studio Gemini API key. Availability, quotas, and charges are governed by Google; the application does not provide unlimited usage or guaranteed service availability.
Fast uses one code-generation stage. High Quality (Beta) plans a blueprint and then builds the code. Permitted retries, fallback, and recovery may increase API usage. Quality request deadlines are 60 seconds for Planning, up to 150 seconds for Building within a shared 180-second total. Local validation has a separate bounded deadline. Completion time and visual quality are not guaranteed.
Specify subjects, actions, colors, viewpoint, timing, and constraints such as no text or shadows. References are optional. Successful model information reflects the actual result.
Precision SVG Strokes (Beta) defaults OFF. Enable it for suitable outlines or icons requiring stroke drawing; it does not force a template.
Use current palette OFF: after successful generation, literal color defaults on the new code's accentColor, secondaryColor, and backgroundColor props are applied before preview and export. Undefined values retain current settings. ON: the palette you chose in the application is deliberately retained. You can still edit colors manually afterward. Transparent mode retains a transparent preview/export background; MP4 cannot store alpha.
Reuse current text only when you want existing title, subtitle, and badge values in a new generation. Otherwise, the new animation supplies its own text without unrelated historic text.
Stop is available where cancellation is supported. Auto-Fix and Edit with AI are manual actions that may use the API. No silent startup repair runs.

EXTERNAL AI AND CODE INSPECTOR
Copy Master Prompt after choosing video settings and animation type. It includes active settings at the time of copying. Discuss the concept, then explicitly say CONTINUE or GENERATE CODE for one complete TSX file. External AI compliance is not guaranteed.
Keep // @title: and the DynamicMotion/VibeGraphic/default export contract. Use only supported imports/APIs; 3D uses the application wrapper. Never paste API keys or license credentials into an external AI.
Paste TSX and select Apply & View Result. Syntax, imports, and compatibility are checked before writing. Rejected code does not replace the active animation. Send safe diagnostics back for revision without sensitive information.

PREVIEW AND VISUAL CONTROLS
Play and scrub to inspect opening frames, transitions, ending, clipping, and continuity. Visual Controls retain text, colors, position, scale, glow, speed, Undo, and original-value restoration. Effects depend on the generated component's prop contract. They are optional and do not certify design quality.
3D requires suitable WebGL support. Review diagnostics when preview fails; do not arbitrarily change GPU settings.

MICROSTOCK ASSET REVIEW
Review subject readability, requested colors, geometry, object continuity, timing, clipping, flicker, and the final frame before submitting an asset. Avoid unrequested branding, watermarks, and text. AI output still requires creator review; High Quality mode and a 4K render do not guarantee marketplace acceptance.

EXPORT
MP4 H.264 is for solid-background video and does not support alpha.
MOV ProRes 4444 supports alpha when Transparent is selected. Verify transparency in a compatible editor; ordinary players may display alpha as black.
Select an export folder, format, and render mode. 4K/60 FPS and complex 3D increase memory use and render time. Cancel normally before closing during an active render.

ERRORS AND UPDATES
429 means rate limiting or quota exhaustion. Check quota evidence; exhausted quota may not recover after a short wait. Do not rotate keys/projects to evade provider limits.
500/502/503/504 are Gemini service errors affecting the request, not proof that all Google servers are down. Try later.
401/403: check credentials and permissions. Application deadlines are local time limits, not confirmed outages. Connection failures require checking connectivity. Invalid TSX/blueprint is rejected before applying a new animation.
Windows retains notification, download, and Install & Restart. macOS updates are manual DMGs from official Google Drive links; v1.0.7 does not display in-app update notifications.
After upgrading, verify projects, assets, settings, license, API key, preview, and export. Release reports record actual upgrade acceptance; one device does not prove all customer configurations.

ACTIVATION AND SUPPORT
Copy Machine ID and use the official activation form: https://motionsuite-act.duckdns.org/form/c1dc1a25-386b-4780-9e60-454b6201969e
Provide the email, invoice/transaction, Machine ID, purchased license tier, and proof of purchase requested by the form. Copy the complete emailed key and select Validate. License duration and Lifetime terms are unchanged.
For clock issues, use the existing time synchronization or OS time settings. Renew expired licenses through the official seller.
Support: ahmadmuslihfarhany46@gmail.com · Telegram: @ahmadmuslihfarhany

RUNTIME / RUNTIME VERSIONS
electron: 44.2.0
typescript: 5.9.3
react: 19.2.8
remotion: 4.0.520
three: 0.178.0
@react-three/fiber: 9.2.0
@remotion/three: 4.0.520

Windows x64. macOS Intel x64 / Apple Silicon arm64: pengujian paket dan perangkat Mac terpisah diperlukan / separate package and Mac hardware acceptance is required.
