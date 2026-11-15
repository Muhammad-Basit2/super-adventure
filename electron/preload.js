const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadData: () => ipcRenderer.invoke('app:load-data'),
  saveData: (data) => ipcRenderer.invoke('app:save-data', data),
  toggleFullscreen: () => ipcRenderer.invoke('app:toggle-fullscreen'),
  quitApp: () => ipcRenderer.invoke('app:quit')
});
