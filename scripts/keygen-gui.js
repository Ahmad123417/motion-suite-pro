const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Path to private key
const privateKeyPath = path.join(__dirname, 'private.pem');

function createWindow() {
  const iconPath = fs.existsSync(path.join(__dirname, '../resources/icon.ico'))
    ? path.join(__dirname, '../resources/icon.ico')
    : path.join(__dirname, '../resources/icon.png');

  const win = new BrowserWindow({
    title: 'Motion Studio - Keygen Developer PRO',
    width: 520,
    height: 630,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    transparent: false,
    backgroundColor: '#0b0f19',
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'keygen-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, 'keygen-gui.html'));

  // Ensure window close IPC
  ipcMain.on('close-keygen', () => {
    win.close();
  });
}

// IPC handler for cryptographic license generation
ipcMain.handle('generate-license-key', async (_event, { machineId, plan, days }) => {
  if (!fs.existsSync(privateKeyPath)) {
    return {
      success: false,
      error: 'File scripts/private.pem tidak ditemukan! Jalankan scripts/generate-rsa-keys.js terlebih dahulu.'
    };
  }

  const cleanedMachineId = (machineId || '').trim().toUpperCase();
  if (!cleanedMachineId) {
    return { success: false, error: 'Machine ID tidak boleh kosong.' };
  }

  try {
    const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');

    let expiryDate = null;
    if (plan === 'monthly') {
      const validDays = days && !isNaN(days) && days > 0 ? parseInt(days, 10) : 30;
      const d = new Date();
      d.setDate(d.getDate() + validDays);
      expiryDate = d.toISOString();
    }

    const payload = {
      machineId: cleanedMachineId,
      plan: plan === 'monthly' ? 'monthly' : 'lifetime',
      expiryDate,
      issuedAt: new Date().toISOString()
    };

    const jsonString = JSON.stringify(payload);
    const b64Payload = Buffer.from(jsonString, 'utf-8').toString('base64');

    // Sign with RSA-SHA256
    const signer = crypto.createSign('SHA256');
    signer.update(b64Payload);
    signer.end();
    const b64Signature = signer.sign(privateKey, 'base64');

    const licenseKey = `${b64Payload}.${b64Signature}`;

    return {
      success: true,
      licenseKey,
      payload
    };
  } catch (err) {
    console.error('[KeygenGUI] Error generating key:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
