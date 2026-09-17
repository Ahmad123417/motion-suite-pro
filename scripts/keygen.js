const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, 'private.pem');

if (!fs.existsSync(privateKeyPath)) {
  console.error('\n[ERROR] File scripts/private.pem tidak ditemukan!');
  console.error('Harap jalankan terlebih dahulu: node scripts/generate-rsa-keys.js\n');
  process.exit(1);
}

const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');

const args = process.argv.slice(2);
const machineId = args[0]?.trim().toUpperCase();
const plan = args[1]?.toLowerCase();
const customDays = args[2] ? parseInt(args[2], 10) : (plan === 'monthly' ? 30 : null);

if (!machineId || (plan !== 'monthly' && plan !== 'lifetime')) {
  console.log('\n======================================================');
  console.log('       MOTION STUDIO - OFFLINE RSA LICENSE GENERATOR');
  console.log('======================================================');
  console.log('Penggunaan:');
  console.log('  node scripts/keygen.js <MACHINE_ID> <PLAN: monthly|lifetime> [DAYS]\n');
  console.log('Contoh Lifetime:');
  console.log('  node scripts/keygen.js 9F8A2B1C4D3E5F6A lifetime\n');
  console.log('Contoh Bulanan (Default 30 Hari):');
  console.log('  node scripts/keygen.js 9F8A2B1C4D3E5F6A monthly\n');
  console.log('Contoh Bulanan Custom Hari (misal 90 Hari):');
  console.log('  node scripts/keygen.js 9F8A2B1C4D3E5F6A monthly 90\n');
  process.exit(1);
}

let expiryDate = null;
if (plan === 'monthly') {
  const days = customDays && !isNaN(customDays) && customDays > 0 ? customDays : 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  expiryDate = d.toISOString();
}

const payload = {
  machineId,
  plan,
  expiryDate,
  issuedAt: new Date().toISOString()
};

const jsonString = JSON.stringify(payload);
const b64Payload = Buffer.from(jsonString, 'utf-8').toString('base64');

// Generate RSA-SHA256 digital signature using private key
const signer = crypto.createSign('SHA256');
signer.update(b64Payload);
signer.end();
const b64Signature = signer.sign(privateKey, 'base64');

const licenseKey = `${b64Payload}.${b64Signature}`;

console.log('\n======================================================');
console.log('   MOTION STUDIO - KUNCI LISENSI RESMI BERHASIL DIBUAT');
console.log('======================================================');
console.log(`Machine ID : ${machineId}`);
console.log(`Paket      : ${plan.toUpperCase()}`);
console.log(`Dibuat Pada: ${new Date(payload.issuedAt).toLocaleString('id-ID')}`);
console.log(`Kadaluarsa : ${expiryDate ? new Date(expiryDate).toLocaleString('id-ID') : 'SELAMANYA (Lifetime)'}`);
console.log('------------------------------------------------------');
console.log('KUNCI LISENSI UNTUK PEMBELI (Salin seluruh baris di bawah):');
console.log('------------------------------------------------------');
console.log(licenseKey);
console.log('------------------------------------------------------\n');
