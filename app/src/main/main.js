const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { startWatching, stopWatching } = require('./windowWatcher');
const { registerIpcHandlers } = require('./ipcHandlers');

let mainWindow;

// Unconditional startup log — writes immediately on every launch,
// independent of any session logic. Used to confirm the packaged app
// is actually running this build of the code.
try {
  const startupLogPath = path.join(app.getPath('userData'), 'startup.log');
  fs.appendFileSync(
    startupLogPath,
    `[${new Date().toISOString()}] App started. userData path: ${app.getPath('userData')}\n`
  );
} catch (err) {
  // If even this fails, there's nothing else we can do to surface it
  // from inside the packaged app.
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  registerIpcHandlers(ipcMain, () => mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  stopWatching();
  if (process.platform !== 'darwin') app.quit();
});