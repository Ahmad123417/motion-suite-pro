const fs = require('fs')
const path = require('path')
const https = require('https')
const { execSync } = require('child_process')

// Target platform & arch
const isWin = process.platform === 'win32'
const isMac = process.platform === 'darwin'

const args = process.argv.slice(2)
const archArg = args.find((a) => a.startsWith('--arch='))
const targetArch = (archArg ? archArg.split('=')[1] : process.env.TARGET_ARCH || process.arch || 'x64').trim()

const binaryName = isWin ? 'node.exe' : 'node'
const targetDir = path.resolve(__dirname, '../resources/bin')
const targetFile = path.join(targetDir, binaryName)
const archMarkerFile = path.join(targetDir, '.node-arch')
const nodeVersion = 'v20.18.0'

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function downloadStream(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath)
    const request = (targetUrl) => {
      https
        .get(targetUrl, (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            return request(response.headers.location)
          }
          if (response.statusCode !== 200) {
            return reject(new Error(`HTTP status ${response.statusCode} saat mengunduh dari ${targetUrl}`))
          }
          response.pipe(file)
          file.on('finish', () => {
            file.close(() => resolve(true))
          })
        })
        .on('error', (err) => {
          fs.unlink(destPath, () => {})
          reject(err)
        })
    }
    request(url)
  })
}

function copyLocalNode() {
  try {
    const activeNode = process.execPath
    if (!fs.existsSync(activeNode)) return false

    if (isWin && activeNode.toLowerCase().endsWith('node.exe')) {
      console.log(`[setup-node-bin] Menyalin binary node lokal Windows dari: ${activeNode}`)
      fs.copyFileSync(activeNode, targetFile)
      fs.writeFileSync(archMarkerFile, targetArch, 'utf-8')
      console.log(`[setup-node-bin] Berhasil menyalin ke: ${targetFile}`)
      return true
    }

    if (isMac && path.basename(activeNode) === 'node' && process.arch === targetArch) {
      console.log(`[setup-node-bin] Menyalin binary node lokal macOS (${targetArch}) dari: ${activeNode}`)
      fs.copyFileSync(activeNode, targetFile)
      fs.chmodSync(targetFile, 0o755)
      fs.writeFileSync(archMarkerFile, targetArch, 'utf-8')
      console.log(`[setup-node-bin] Berhasil menyalin dan chmod +x ke: ${targetFile}`)
      return true
    }
  } catch (err) {
    console.warn('[setup-node-bin] Gagal menyalin binary lokal:', err.message)
  }
  return false
}

async function downloadOfficialNode() {
  if (isWin) {
    const url = `https://nodejs.org/dist/${nodeVersion}/win-x64/node.exe`
    console.log(`[setup-node-bin] Mengunduh official Node.js Windows binary (${nodeVersion} x64) dari ${url}...`)
    await downloadStream(url, targetFile)
    fs.writeFileSync(archMarkerFile, 'x64', 'utf-8')
    console.log('[setup-node-bin] Berhasil mengunduh node.exe ke resources/bin/')
    return
  }

  if (isMac) {
    const macArch = targetArch === 'arm64' ? 'darwin-arm64' : 'darwin-x64'
    const tarUrl = `https://nodejs.org/dist/${nodeVersion}/node-${nodeVersion}-${macArch}.tar.gz`
    const tempTar = path.join(targetDir, `node-${macArch}.tar.gz`)
    console.log(`[setup-node-bin] Mengunduh official Node.js macOS binary (${nodeVersion} ${macArch}) dari ${tarUrl}...`)

    await downloadStream(tarUrl, tempTar)
    console.log(`[setup-node-bin] Mengekstrak binary node dari ${tempTar}...`)
    try {
      execSync(`tar -xzf "${tempTar}" --strip-components=2 -C "${targetDir}" "node-${nodeVersion}-${macArch}/bin/node"`, {
        stdio: 'inherit'
      })
      fs.chmodSync(targetFile, 0o755)
      fs.writeFileSync(archMarkerFile, targetArch, 'utf-8')
      console.log(`[setup-node-bin] Berhasil mengekstrak dan mengatur izin eksekusi resources/bin/node (${targetArch})`)
    } finally {
      if (fs.existsSync(tempTar)) {
        try {
          fs.unlinkSync(tempTar)
        } catch (_) {}
      }
    }
    return
  }
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

async function main() {
  ensureDir(targetDir)

  let isReady = false
  if (fs.existsSync(targetFile)) {
    const stats = fs.statSync(targetFile)
    if (stats.size > 10000000) {
      if (isWin) {
        isReady = true
      } else if (isMac) {
        const recordedArch = fs.existsSync(archMarkerFile) ? fs.readFileSync(archMarkerFile, 'utf-8').trim() : ''
        if (recordedArch === targetArch) {
          isReady = true
        }
      }
    }
  }

  if (isReady) {
    const stats = fs.statSync(targetFile)
    console.log(`[setup-node-bin] resources/bin/${binaryName} (${targetArch}) sudah siap (${(stats.size / 1024 / 1024).toFixed(1)} MB).`)
  } else {
    // 1. Coba salin dari active node environment terlebih dahulu jika arsitektur cocok
    if (!copyLocalNode()) {
      // 2. Jika gagal atau arsitektur berbeda, unduh official archive dari nodejs.org
      try {
        await downloadOfficialNode()
      } catch (err) {
        console.error('[setup-node-bin] Gagal menyiapkan node binary:', err.message)
        process.exit(1)
      }
    }
  }

  // Pastikan icon.ico tersedia jika diperlukan di Windows
  if (isWin) {
    await setupIcon()
  }
}

main()
