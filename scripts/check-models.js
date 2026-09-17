const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Ambil API key dari argumen CLI atau auto-detect dari localStorage jika ada
let apiKey = process.argv[2];

if (!apiKey) {
  // Coba auto-detect dari localStorage Electron jika user tidak memasukkan di argumen
  try {
    const appdata = process.env.APPDATA || '';
    const ldbDirs = [
      path.join(appdata, 'Motion Studio', 'Local Storage', 'leveldb'),
      path.join(appdata, 'remotion-motion-desktop', 'Local Storage', 'leveldb')
    ];
    for (const ldb of ldbDirs) {
      if (fs.existsSync(ldb)) {
        for (const file of fs.readdirSync(ldb)) {
          if (file.endsWith('.log') || file.endsWith('.ldb')) {
            const content = fs.readFileSync(path.join(ldb, file), 'utf-8');
            const match = content.match(/gemini_api_key[^\w]*([a-zA-Z0-9_-]{20,})/);
            if (match && match[1]) {
              apiKey = match[1];
              console.log('(Auto-detected API Key dari LocalStorage)');
              break;
            }
          }
        }
      }
      if (apiKey) break;
    }
  } catch (e) {}
}

if (!apiKey) {
  console.error("Masukkan API key sebagai argumen: node scripts/check-models.js <API_KEY>");
  process.exit(1);
}

console.log("Memeriksa API Key:", apiKey.slice(0, 6) + "..." + apiKey.slice(-4));
const genAI = new GoogleGenerativeAI(apiKey);

async function check() {
  try {
    // Cek langsung ke Google model apa saja yang diizinkan untuk key ini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error("ERROR DARI GOOGLE:", JSON.stringify(data.error, null, 2));
      return;
    }

    console.log("=== DAFTAR MODEL YANG DIDUKUNG KUNCI ANDA ===");
    const supported = (data.models || [])
      .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name.replace("models/", ""));
    
    console.log(supported);

    if (supported.length > 0) {
      console.log("\nREKOMENDASI MODEL AKTIF:", supported[0]);
    } else {
      console.log("Kunci valid tapi tidak ada model dengan hak akses generateContent.");
    }
  } catch (err) {
    console.error("Koneksi gagal:", err.message);
  }
}

check();
