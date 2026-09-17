const { contextBridge, ipcRenderer, clipboard } = require('electron');

contextBridge.exposeInMainWorld('keygenAPI', {
  generateKey: (params) => ipcRenderer.invoke('generate-license-key', params),
  copyToClipboard: (text) => clipboard.writeText(text),
  closeWindow: () => ipcRenderer.send('close-keygen')
});
