const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    useContentSize: true,
    center: true,
    title: 'Super Adventure',
    backgroundColor: '#1a1c23',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function getSaveFilePath() {
  const userData = app.getPath('userData');
  return path.join(userData, 'super_adventure_save.json');
}

function setupIpcHandlers() {
  ipcMain.handle('app:load-data', async () => {
    try {
      const filePath = getSaveFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
      }
      return null;
    } catch (err) {
      console.error('Error reading save data:', err);
      return null;
    }
  });

  ipcMain.handle('app:save-data', async (event, data) => {
    try {
      const filePath = getSaveFilePath();
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return { success: true };
    } catch (err) {
      console.error('Error saving data:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('app:toggle-fullscreen', async () => {
    if (mainWindow) {
      const current = mainWindow.isFullScreen();
      mainWindow.setFullScreen(!current);
      return !current;
    }
    return false;
  });

  ipcMain.handle('app:quit', async () => {
    app.quit();
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
