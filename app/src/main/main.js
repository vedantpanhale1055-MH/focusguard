const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { startWatching, stopWatching } = require('./windowWatcher');
const { registerIpcHandlers } = require('./ipcHandlers');

let mainWindow;

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