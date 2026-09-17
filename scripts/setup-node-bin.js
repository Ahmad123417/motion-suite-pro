const fs = require('fs')
const path = require('path')
const https = require('https')
const { execSync } = require('child_process')

const targetDir = path.resolve(__dirname, '../resources/bin')
const targetFile = path.join(targetDir, 'node.exe')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function copyLocalNode() {
  try {
    const activeNode = process.execPath
    if (fs.existsSync(activeNode) && activeNode.toLowerCase().endsWith('node.exe')) {
      console.log(`[setup-node-bin] Menyalin binary node lokal dari: ${activeNode}`)
      fs.copyFileSync(activeNode, targetFile)
      console.log(`[setup-node-bin] Berhasil menyalin ke: ${targetFile}`)
      return true
    }
  } catch (err) {
    console.warn('[setup-node-bin] Gagal menyalin binary lokal:', err.message)
  }
  return false
}

function downloadOfficialNode() {
  return new Promise((resolve, reject) => {
    const nodeVersion = 'v20.18.0'
    const url = `https://nodejs.org/dist/${nodeVersion}/win-x64/node.exe`
    console.log(`[setup-node-bin] Mengunduh official Node.js portable binary (${nodeVersion} x64) dari ${url}...`)
    
    const file = fs.createWriteStream(targetFile)
    const request = (targetUrl) => {
      https.get(targetUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          return request(response.headers.location)
        }
        if (response.statusCode !== 200) {
          return reject(new Error(`HTTP status ${response.statusCode} saat mengunduh node.exe`))
        }
        response.pipe(file)
        file.on('finish', () => {
          file.close(() => {
            console.log('[setup-node-bin] Berhasil mengunduh node.exe ke resources/bin/')
            resolve(true)
          })
        })
      }).on('error', (err) => {
        fs.unlink(targetFile, () => {})
        reject(err)
      })
    }
    request(url)
  })
}

async function main() {
  ensureDir(targetDir)

  if (fs.existsSync(targetFile)) {
    const stats = fs.statSync(targetFile)
    if (stats.size > 10000000) {
      console.log(`[setup-node-bin] resources/bin/node.exe sudah siap (${(stats.size / 1024 / 1024).toFixed(1)} MB).`)
      return
    }
  }

  // Coba salin dari active node environment terlebih dahulu
  if (copyLocalNode()) {
    return
  }

  // Jika gagal, unduh official node.exe dari nodejs.org
  try {
    await downloadOfficialNode()
  } catch (err) {
    console.error('[setup-node-bin] Gagal menyiapkan node.exe:', err.message)
    process.exit(1)
  }
  // Pastikan resources/icon.ico tersedia
  await setupIcon()
}

async function setupIcon() {
  const icoFile = path.resolve(__dirname, '../resources/icon.ico')
  const pngFile = path.resolve(__dirname, '../resources/icon.png')
  if ((!fs.existsSync(icoFile) || fs.statSync(icoFile).size < 1000) && fs.existsSync(pngFile)) {
    try {
      const p = require('png-to-ico')
      const buf = await (p.default || p)(pngFile)
      fs.writeFileSync(icoFile, buf)
      console.log(`[setup-node-bin] Berhasil membuat resources/icon.ico (${(buf.length / 1024).toFixed(1)} KB).`)
    } catch (err) {
      console.warn('[setup-node-bin] Gagal membuat icon.ico:', err.message)
    }
  }
}

main()
