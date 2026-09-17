const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('Generating 2048-bit RSA Key Pair for Motion Studio...');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

const scriptsDir = __dirname;
const privateKeyPath = path.join(scriptsDir, 'private.pem');
fs.writeFileSync(privateKeyPath, privateKey, 'utf-8');
console.log('✓ Private key saved securely to:', privateKeyPath);

const publicKeyTsPath = path.join(__dirname, '../src/main/publicKey.ts');
const tsContent = `// Auto-generated RSA-2048 Public Key for offline license verification
// DO NOT MODIFY OR COMMIT PRIVATE KEY TO SOURCE CONTROL

export const PUBLIC_KEY = ${JSON.stringify(publicKey)};
`;

fs.writeFileSync(publicKeyTsPath, tsContent, 'utf-8');
console.log('✓ Public key exported to:', publicKeyTsPath);
console.log('\nRSA key pair generated successfully!');
